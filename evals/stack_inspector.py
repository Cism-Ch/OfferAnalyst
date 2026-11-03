#!/usr/bin/env python3
"""
Stack & MCP / Skills Ecosystem Inspector for OfferAnalyst & Universal RSI Projects.

Analyzes the codebase dependencies, configuration, and environment to:
1. Detect Project Stack (Package Manager, Framework, ORM/DB, Testing, Cloud Providers)
2. Verify MCP Server setup against project dependencies
3. Audit official Skills installed vs recommended
4. Output structured recommendations to avoid agents guessing or hallucinating code.
"""

import sys
import json
import os
from pathlib import Path

# Ensure UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent

# Official Catalog of recommended Skills & MCPs per technology ecosystem
ECOSYSTEM_CATALOG = {
    "upstash": {
        "detection_keywords": ["@upstash/redis", "@upstash/qstash", "@upstash/ratelimit", "@upstash/workflow"],
        "recommended_mcp": {
            "id": "upstash",
            "url": "https://mcp.upstash.com/mcp",
            "type": "http"
        },
        "recommended_skills_repo": "upstash/skills",
        "description": "Upstash Serverless Redis, QStash message queues, and workflow orchestration"
    },
    "tigris": {
        "detection_keywords": ["@aws-sdk/client-s3", "@tigrisdata/core", "tigris"],
        "recommended_mcp": {
            "id": "tigris",
            "command": "npx -y @tigrisdata/tigris-mcp-server run",
            "type": "stdio"
        },
        "recommended_skills_repo": "tigrisdata/skills",
        "description": "Tigris distributed S3-compatible object storage and bucket management"
    },
    "prisma": {
        "detection_keywords": ["@prisma/client", "prisma"],
        "recommended_skills_repo": "prisma-mongodb",
        "description": "Prisma ORM schema management, database migrations and connection hygiene"
    },
    "shadcn": {
        "detection_keywords": ["@radix-ui/", "tailwind-merge", "class-variance-authority", "components.json"],
        "recommended_skills_repo": "shadcn",
        "description": "Official shadcn/ui and Radix UI accessible component primitives"
    },
    "better-auth": {
        "detection_keywords": ["better-auth"],
        "skill_keywords": ["security", "auth", "identity"],
        "recommended_skills_repo": "security-identity-management",
        "description": "Server-side Better-Auth authentication, session and secret integrity"
    },
    "playwright": {
        "detection_keywords": ["@playwright/test", "playwright"],
        "recommended_skills_repo": "playwright-skill",
        "description": "Playwright end-to-end browser testing and UX validation"
    }
}

def detect_package_manager() -> str:
    if (ROOT_DIR / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (ROOT_DIR / "bun.lockb").exists() or (ROOT_DIR / "bun.lock").exists():
        return "bun"
    if (ROOT_DIR / "yarn.lock").exists():
        return "yarn"
    if (ROOT_DIR / "package-lock.json").exists():
        return "npm"
    return "unknown"

def inspect_dependencies() -> dict:
    package_json_path = ROOT_DIR / "package.json"
    if not package_json_path.exists():
        return {"dependencies": [], "devDependencies": []}
    
    try:
        data = json.loads(package_json_path.read_text(encoding="utf-8"))
        deps = list(data.get("dependencies", {}).keys())
        dev_deps = list(data.get("devDependencies", {}).keys())
        return {
            "name": data.get("name", "unknown"),
            "version": data.get("version", "0.0.0"),
            "all_dependencies": deps + dev_deps,
            "dependencies": deps,
            "devDependencies": dev_deps
        }
    except Exception as e:
        return {"error": str(e), "all_dependencies": []}

def inspect_mcp_servers() -> dict:
    mcp_file = ROOT_DIR / ".mcp.json"
    if not mcp_file.exists():
        return {}
    try:
        data = json.loads(mcp_file.read_text(encoding="utf-8"))
        return data.get("mcpServers", {})
    except Exception:
        return {}

def inspect_installed_skills() -> list[str]:
    skills_dir = ROOT_DIR / ".agents" / "skills"
    if not skills_dir.exists():
        return []
    installed = []
    for item in skills_dir.iterdir():
        if item.is_dir() and (item / "SKILL.md").exists():
            installed.append(item.name)
    return installed

def evaluate_stack():
    pkg_manager = detect_package_manager()
    dep_info = inspect_dependencies()
    configured_mcps = inspect_mcp_servers()
    installed_skills = inspect_installed_skills()

    all_deps_text = " ".join(dep_info.get("all_dependencies", []))
    
    detected_ecosystems = []
    recommendations = []

    for name, config in ECOSYSTEM_CATALOG.items():
        matched = any(kw in all_deps_text for kw in config["detection_keywords"])
        if matched:
            detected_ecosystems.append(name)
            
            # Check MCP presence
            has_mcp = any(name in mcp_key.lower() for mcp_key in configured_mcps.keys())
            # Check Skill presence (by exact match or skill keywords)
            skill_keywords = config.get("skill_keywords", [name])
            has_skill = any(any(sk in skill.lower() for sk in skill_keywords) for skill in installed_skills)

            rec = {
                "ecosystem": name,
                "description": config["description"],
                "has_mcp": has_mcp,
                "has_skill": has_skill,
                "action_needed": False,
                "instructions": []
            }

            if not has_mcp and "recommended_mcp" in config:
                rec["action_needed"] = True
                rec["instructions"].append(f"Ajouter le serveur MCP '{name}' dans .mcp.json ({config['recommended_mcp']})")

            if not has_skill and "recommended_skills_repo" in config:
                rec["action_needed"] = True
                rec["instructions"].append(f"Installer les skills officiels : pnpm dlx skills add {config['recommended_skills_repo']}")

            recommendations.append(rec)

    # Framework detection
    framework = "Next.js" if "next" in all_deps_text else "Node.js"
    orm = "Prisma" if "prisma" in all_deps_text else ("Drizzle" if "drizzle-orm" in all_deps_text else "None/Custom")
    ui_lib = "React 19 / Tailwind CSS" if "react" in all_deps_text else "Unknown"

    return {
        "project_name": dep_info.get("name"),
        "version": dep_info.get("version"),
        "package_manager": pkg_manager,
        "framework": framework,
        "orm": orm,
        "ui_system": ui_lib,
        "installed_skills_count": len(installed_skills),
        "configured_mcp_count": len(configured_mcps),
        "detected_ecosystems": detected_ecosystems,
        "audit": recommendations
    }

def main():
    report = evaluate_stack()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    # Print human summary
    actions_needed = [r for r in report["audit"] if r["action_needed"]]
    if actions_needed:
        print("\n⚠️  [RSI Stack Inspector] Recommandations d'écosystème détectées :")
        for act in actions_needed:
            print(f"  • {act['ecosystem'].upper()} ({act['description']}):")
            for inst in act["instructions"]:
                print(f"    -> {inst}")
    else:
        print("\n✅ [RSI Stack Inspector] Écosystème 100% aligné avec les MCPs et Skills officiels !")

if __name__ == "__main__":
    main()
