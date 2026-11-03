#!/usr/bin/env python3
"""
Dynamic Modular Memory Engine for OfferAnalyst & Universal RSI Projects.

Capabilities:
1. Dynamically detects target files / git diff to identify relevant architectural layers.
2. Resolves and compiles targeted sub-playbooks from `.agents/rules/modules/` without context bloat.
3. Automatically creates new domain sub-playbooks on demand when an agent learns a new area.
4. Enforces strict modular ceilings (< 80 lines per module).
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Force UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = ROOT_DIR / ".agents" / "rules"
MODULES_DIR = RULES_DIR / "modules"
INDEX_FILE = RULES_DIR / "fullstack_playbook.md"

MODULE_MAPPING = {
    "db.md": ["prisma", "schema.prisma", "db/", "mongo", "database", "migration"],
    "api_backend.md": ["src/app/actions", "src/app/api", "qstash", "redis", "action", "server"],
    "ui_frontend.md": ["src/components", "src/app/", ".tsx", "tailwind", "layout", "page.tsx", "css"],
    "security_auth.md": ["src/lib/auth", "better-auth", "api-key", "crypto", "encryption", "login", "session"],
    "integration_ai.md": ["openrouter", "analyze", "fetch", "telemetry", "ai-models", "version_manager"]
}

MAX_MODULE_LINES = 80

def get_modified_files() -> list[str]:
    try:
        res = subprocess.run(["git", "status", "--porcelain"], cwd=str(ROOT_DIR), capture_output=True, text=True, timeout=10)
        files = []
        for line in res.stdout.splitlines():
            parts = line.strip().split()
            if len(parts) >= 2:
                files.append(parts[-1])
        return files
    except Exception:
        return []

def resolve_modules_for_files(target_files: list[str]) -> list[str]:
    matched_modules = set()
    files_str = " ".join(target_files).lower()

    if not target_files:
        # Default fallback: load all modules if no target provided
        return [f.name for f in MODULES_DIR.glob("*.md")]

    for module_file, keywords in MODULE_MAPPING.items():
        if any(kw in files_str for kw in keywords):
            matched_modules.add(module_file)

    # Always include core integration rules if match set is small
    if not matched_modules:
        matched_modules.add("ui_frontend.md")
        matched_modules.add("api_backend.md")

    return sorted(list(matched_modules))

def compile_memory(target_files: list[str] | None = None) -> str:
    if target_files is None:
        target_files = get_modified_files()

    modules_to_load = resolve_modules_for_files(target_files)
    compiled_lines = [
        "# 🧠 RSI Injected Context Memory",
        f"> Résolu dynamiquement pour les fichiers : {', '.join(target_files) if target_files else 'Environnement Global'}\n"
    ]

    for mod_name in modules_to_load:
        mod_path = MODULES_DIR / mod_name
        if mod_path.exists():
            content = mod_path.read_text(encoding="utf-8").strip()
            compiled_lines.append(f"\n--- \n### 📦 [{mod_name.upper()}]\n{content}\n")

    return "\n".join(compiled_lines)

def audit_modules() -> dict:
    issues = []
    modules_stats = {}

    if not MODULES_DIR.exists():
        return {"passed": False, "error": f"Dossier {MODULES_DIR} introuvable"}

    for mod_path in MODULES_DIR.glob("*.md"):
        lines = mod_path.read_text(encoding="utf-8").splitlines()
        count = len(lines)
        modules_stats[mod_path.name] = count
        if count > MAX_MODULE_LINES:
            issues.append(f"{mod_path.name} dépasse le plafond ({count}/{MAX_MODULE_LINES} lignes)")

    return {
        "passed": len(issues) == 0,
        "modules_count": len(modules_stats),
        "stats": modules_stats,
        "issues": issues
    }

def main():
    parser = argparse.ArgumentParser(description="Moteur de Mémoire Modulaire Dynamique RSI")
    parser.add_argument("--inject", nargs="*", help="Fichiers cibles pour injection contextuelle")
    parser.add_argument("--audit", action="store_true", help="Vérifier la conformité et taille des modules")
    parser.add_argument("--json", action="store_true", help="Format de sortie JSON")
    args = parser.parse_args()

    if args.audit:
        result = audit_modules()
        if args.json:
            import json
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"📊 [RSI Memory Audit] {result['modules_count']} modules détectés.")
            for mod, count in result["stats"].items():
                status = "✅" if count <= MAX_MODULE_LINES else "⚠️"
                print(f"  {status} {mod} : {count}/{MAX_MODULE_LINES} lignes")
            if result["issues"]:
                print("\n⚠️  Problèmes détectés :")
                for iss in result["issues"]:
                    print(f"  • {iss}")
            else:
                print("\n✅ Tous les modules respectent le plafond strict de compacité !")
        sys.exit(0 if result["passed"] else 1)

    # Injection mode
    target_files = args.inject if args.inject is not None else get_modified_files()
    compiled = compile_memory(target_files)
    print(compiled)

if __name__ == "__main__":
    main()

