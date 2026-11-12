#!/usr/bin/env python3
"""
Technical Stack, Topological Map & Blast Radius Auditor
- Detects package manager, framework, ORM, auth, styles, cloud services
- Generates a compact Topological Repo Map (--map) of canonical singletons and hub files
- Predicts change Blast Radius (--impact <file>) via reverse dependency analysis
- Recommends and verifies official tooling installation (MCP servers & Skills)
"""

import sys
import os
import re
import json
import shutil
import zipfile
import argparse
from datetime import datetime
from pathlib import Path

# UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
SKILLS_DIR = ROOT_DIR / ".agents" / "skills"
SKILLS_BACKUP_DIR = ROOT_DIR / "backups" / "skills"
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', '.next', 'backups', 'logs'}
CODE_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.rs', '.php', '.rb', '.java', '.cs'}

SINGLETON_SIGNATURES = [
    (re.compile(r'new\s+PrismaClient|PrismaClient'), "Database ORM Singleton"),
    (re.compile(r'createClient\s*\(|supabase', re.IGNORECASE), "Supabase / Cloud Client"),
    (re.compile(r'betterAuth\s*\(|NextAuth|authOptions'), "Authentication Core"),
    (re.compile(r'new\s+Redis\s*\(|Redis\.fromEnv|QStash', re.IGNORECASE), "Cache / Queue Client"),
    (re.compile(r'S3Client|Tigris', re.IGNORECASE), "Object Storage Client"),
    (re.compile(r'createEnv\s*\(|z\.object\s*\(.*process\.env', re.DOTALL), "Environment Schema Validator")
]

ECOSYSTEM_CATALOG = {
    "shadcn": {
        "deps": ["@radix-ui", "clsx", "tailwind-merge"],
        "files": ["components.json"],
        "skill": "shadcn",
        "mcp_server": None,
        "purpose": "Accessible and styled UI component primitives",
        "install_guide": "Add shadcn skill to .agents/skills/shadcn or use IDE plugin."
    },
    "prisma": {
        "deps": ["@prisma/client", "prisma"],
        "files": ["prisma/schema.prisma"],
        "skill": "prisma-management",
        "skill_keywords": ["prisma"],
        "mcp_server": None,
        "purpose": "Database schema management and validation",
        "install_guide": "Add prisma skill to .agents/skills/prisma-management or use IDE plugin."
    },
    "upstash": {
        "deps": ["@upstash/redis", "@upstash/qstash", "@upstash/ratelimit"],
        "files": [],
        "skill": "upstash",
        "mcp_server": "upstash",
        "purpose": "Asynchronous job queue, rate limiting, and distributed cache",
        "mcp_setup": "Add to .mcp.json: npx -y @upstash/mcp-server (requires UPSTASH_REDIS_REST_URL/TOKEN)",
        "install_guide": "Configure 'upstash' in .mcp.json and install upstash skill."
    },
    "tigris": {
        "deps": ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
        "env_keys": ["TIGRIS_", "AWS_ENDPOINT_URL_S3"],
        "files": [],
        "skill": "file-storage",
        "skill_keywords": ["tigris", "storage"],
        "mcp_server": None,
        "purpose": "Zero-egress S3-compatible high-performance object storage",
        "install_guide": "Add file-storage skill to .agents/skills/file-storage."
    },
    "playwright": {
        "deps": ["@playwright/test", "playwright"],
        "files": ["playwright.config.ts", "playwright.config.js"],
        "skill": "playwright-skill",
        "skill_keywords": ["playwright"],
        "mcp_server": None,
        "purpose": "Deterministic E2E testing and browser automation",
        "install_guide": "Add playwright-skill to .agents/skills/playwright-skill."
    }
}

def detect_stack() -> dict:
    dependencies = {}
    pkg_json = ROOT_DIR / "package.json"
    if pkg_json.exists():
        try:
            with open(pkg_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                dependencies.update(data.get("dependencies", {}))
                dependencies.update(data.get("devDependencies", {}))
        except Exception:
            pass

    env_content = ""
    for env_file in [".env", ".env.local", ".env.example"]:
        p = ROOT_DIR / env_file
        if p.exists():
            try:
                env_content += p.read_text(encoding="utf-8") + "\n"
            except Exception:
                pass

    installed_skills = set()
    skills_dir = ROOT_DIR / ".agents" / "skills"
    if skills_dir.exists():
        for item in skills_dir.iterdir():
            if item.is_dir():
                installed_skills.add(item.name.lower())

    configured_mcps = set()
    mcp_json = ROOT_DIR / ".mcp.json"
    if mcp_json.exists():
        try:
            with open(mcp_json, "r", encoding="utf-8") as f:
                mcp_data = json.load(f)
                servers = mcp_data.get("mcpServers", {})
                configured_mcps.update(k.lower() for k in servers.keys())
        except Exception:
            pass

    detected = {}
    for tech, meta in ECOSYSTEM_CATALOG.items():
        is_present = False
        for dep in meta.get("deps", []):
            if any(dep.lower() in d.lower() for d in dependencies.keys()):
                is_present = True
                break
        if not is_present:
            for f in meta.get("files", []):
                if (ROOT_DIR / f).exists():
                    is_present = True
                    break
        if not is_present:
            for env_key in meta.get("env_keys", []):
                if env_key in env_content:
                    is_present = True
                    break

        if is_present:
            skill_found = False
            target_skill = meta.get("skill")
            skill_keywords = meta.get("skill_keywords", [target_skill])
            for s in installed_skills:
                if any(kw and kw.lower() in s for kw in skill_keywords):
                    skill_found = True
                    break

            mcp_found = False
            target_mcp = meta.get("mcp_server")
            if target_mcp:
                for m in configured_mcps:
                    if target_mcp.lower() in m:
                        mcp_found = True
                        break
            else:
                mcp_found = True

            detected[tech] = {
                "purpose": meta["purpose"],
                "has_skill": skill_found,
                "recommended_skill": target_skill,
                "has_mcp": mcp_found,
                "recommended_mcp": target_mcp,
                "mcp_setup": meta.get("mcp_setup"),
                "install_guide": meta.get("install_guide")
            }

    return detected

def get_missing_tools() -> list[dict]:
    """Returns a list of missing official tools with actionable instructions for conversational request."""
    stack = detect_stack()
    missing = []
    for tech, info in stack.items():
        if not info["has_skill"] or not info["has_mcp"]:
            missing.append({
                "tech": tech,
                "purpose": info["purpose"],
                "missing_skill": info["recommended_skill"] if not info["has_skill"] else None,
                "missing_mcp": info["recommended_mcp"] if not info["has_mcp"] else None,
                "mcp_setup": info.get("mcp_setup"),
                "install_guide": info.get("install_guide")
            })
    return missing

def iter_source_files() -> list[Path]:
    files = []
    for root, dirs, filenames in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for fname in filenames:
            path = Path(root) / fname
            if path.suffix in CODE_EXTENSIONS:
                files.append(path)
    return sorted(files)

def build_dependency_graph(files: list[Path]) -> dict[str, set[str]]:
    """Maps each relative file path to the set of relative file paths that import/reference it."""
    rel_files = [str(f.relative_to(ROOT_DIR)).replace("\\", "/") for f in files]
    reverse_deps: dict[str, set[str]] = {rf: set() for rf in rel_files}

    # Precompute stem and basename lookup keys for fast matching
    lookup_tokens: dict[str, list[str]] = {}
    for rf in rel_files:
        p = Path(rf)
        stem = p.stem
        no_ext = str(p.with_suffix("")).replace("\\", "/")
        tokens = [rf, no_ext]
        if stem not in {"index", "__init__", "main", "route", "page", "layout"}:
            tokens.append(stem)
        lookup_tokens[rf] = tokens

    for f in files:
        caller_rel = str(f.relative_to(ROOT_DIR)).replace("\\", "/")
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for target_rel, tokens in lookup_tokens.items():
            if target_rel == caller_rel:
                continue
            for tok in tokens:
                if re.search(rf'(?:from|import|require|\/|\"|\')\s*[\w\.\/\@\-]*\b{re.escape(tok)}\b', content):
                    reverse_deps[target_rel].add(caller_rel)
                    break

    return reverse_deps

def generate_topological_map() -> None:
    """Outputs a compact O(1) Topological Map of singletons, core hubs, and governance entrypoints."""
    files = iter_source_files()
    reverse_deps = build_dependency_graph(files)

    print("[RSI Topological Map] Scanning canonical singletons and hub modules...")
    singletons = []
    core_dirs = {"lib", "server", "core", "utils", "services", "evals"}

    for f in files:
        rel = str(f.relative_to(ROOT_DIR)).replace("\\", "/")
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        # Only scan application files (outside evals/) for runtime singleton signatures
        if "evals" not in f.relative_to(ROOT_DIR).parts:
            for pattern, role in SINGLETON_SIGNATURES:
                if pattern.search(content):
                    singletons.append((rel, role))
                    break
        if not any(s[0] == rel for s in singletons):
            parts = f.relative_to(ROOT_DIR).parts[:-1]
            if "evals" in parts:
                singletons.append((rel, "RSI Governance / Evaluation Engine"))
            elif any(part in core_dirs for part in parts):
                singletons.append((rel, "Core Infrastructure / Module"))

    print("\n1. Canonical Singletons & Core Modules (Reuse in O(1) - Do Not Duplicate):")
    if singletons:
        for rel, role in singletons[:12]:
            dep_count = len(reverse_deps.get(rel, set()))
            print(f"  - {rel} [{role}] (dependents: {dep_count})")
    else:
        print("  - [INFO] No application singletons detected yet.")

    ranked_hubs = sorted(reverse_deps.items(), key=lambda item: (-len(item[1]), item[0]))
    active_hubs = [(k, v) for k, v in ranked_hubs if len(v) > 0]

    print("\n2. Top Dependency Hubs (Highest Blast Radius):")
    if active_hubs:
        for rel, callers in active_hubs[:8]:
            print(f"  - {rel} -> imported/invoked by {len(callers)} file(s)")
    else:
        print("  - [INFO] No cross-file imports detected yet.")

def compute_blast_radius(target_file: str) -> dict:
    """Computes the reverse dependency Blast Radius for a specific file and returns structured metrics."""
    norm_target = re.sub(r'^\./', '', target_file.replace("\\", "/"))
    files = iter_source_files()
    md_files = []
    for root, dirs, filenames in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for fname in filenames:
            if fname.endswith(".md"):
                md_files.append(Path(root) / fname)
    all_scan_files = files + md_files

    target_path = Path(norm_target)
    target_stem = target_path.stem
    dependents = []

    for f in all_scan_files:
        caller_rel = str(f.relative_to(ROOT_DIR)).replace("\\", "/")
        if caller_rel.lower() == norm_target.lower():
            continue
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if norm_target in content or (
            target_stem not in {"index", "__init__", "main", "route", "page", "layout"}
            and re.search(rf'\b{re.escape(target_stem)}\b', content)
        ):
            dependents.append(caller_rel)

    count = len(dependents)
    if count <= 2:
        tier = "LOW"
        tier_desc = "LOW (Localized impact - System 1 safe edit)"
    elif count <= 7:
        tier = "MEDIUM"
        tier_desc = "MEDIUM (Shared module - Verify consumer contracts)"
    else:
        tier = "HIGH"
        tier_desc = "HIGH / CRITICAL (Core hub - System 2 reasoning required; preserve exported signatures)"

    return {
        "target": norm_target,
        "count": count,
        "tier": tier,
        "tier_desc": tier_desc,
        "dependents": sorted(dependents)
    }

def analyze_blast_radius(target_file: str) -> None:
    """Prints the reverse dependency Blast Radius for a specific file before modification."""
    info = compute_blast_radius(target_file)
    count = info["count"]
    print(f"[RSI Blast Radius] Target: {info['target']}")
    print(f"  |-- Impact Tier : {info['tier_desc']}")
    print(f"  \\-- Dependents  : {count} file(s)")
    for dep in info["dependents"][:15]:
        print(f"      * {dep}")
    if count > 15:
        print(f"      * ... and {count - 15} more file(s)")

def discover_project_profile() -> dict:
    """Autonomously discovers project languages, frameworks, bundlers, installed packages, and source corpus."""
    languages = set()
    frameworks = set()
    bundlers = set()
    dependencies = set()
    env_keys = set()

    # 1. Inspect manifests
    pkg_json = ROOT_DIR / "package.json"
    if pkg_json.exists():
        languages.update({"javascript", "js", "node", "nodejs"})
        try:
            data = json.load(pkg_json.open("r", encoding="utf-8"))
            all_deps = {}
            all_deps.update(data.get("dependencies", {}))
            all_deps.update(data.get("devDependencies", {}))
            for k in all_deps.keys():
                dependencies.add(k.lower())
            if "typescript" in dependencies or (ROOT_DIR / "tsconfig.json").exists():
                languages.update({"typescript", "ts"})
        except Exception:
            pass
    elif (ROOT_DIR / "tsconfig.json").exists():
        languages.update({"javascript", "js", "typescript", "ts", "node"})

    if (ROOT_DIR / "pyproject.toml").exists() or (ROOT_DIR / "requirements.txt").exists():
        languages.update({"python", "py"})
        for req_file in ["pyproject.toml", "requirements.txt"]:
            p = ROOT_DIR / req_file
            if p.exists():
                try:
                    raw = p.read_text(encoding="utf-8", errors="ignore").lower()
                    for token in re.findall(r'\b[a-z0-9_\-]{3,}\b', raw):
                        dependencies.add(token)
                except Exception:
                    pass

    if (ROOT_DIR / "go.mod").exists():
        languages.update({"go", "golang"})
    if (ROOT_DIR / "Cargo.toml").exists():
        languages.update({"rust", "rs"})
    if (ROOT_DIR / "composer.json").exists():
        languages.add("php")
    if (ROOT_DIR / "Gemfile").exists():
        languages.update({"ruby", "rb"})
    if (ROOT_DIR / "pom.xml").exists() or (ROOT_DIR / "build.gradle").exists():
        languages.add("java")
    if list(ROOT_DIR.glob("*.csproj")) or list(ROOT_DIR.glob("*.sln")):
        languages.update({"dotnet", "csharp", "cs"})
    if (ROOT_DIR / "mix.exs").exists():
        languages.add("elixir")

    # 2. Scan application source files (outside evals/ and .agents/)
    ext_lang_map = {
        ".ts": ("typescript", "ts", "javascript", "js"),
        ".tsx": ("typescript", "ts", "javascript", "js", "react"),
        ".js": ("javascript", "js"),
        ".jsx": ("javascript", "js", "react"),
        ".py": ("python", "py"),
        ".go": ("go", "golang"),
        ".rs": ("rust", "rs"),
        ".php": ("php",),
        ".rb": ("ruby", "rb"),
        ".java": ("java",),
        ".cs": ("dotnet", "csharp")
    }
    source_chunks = []
    app_files_count = 0
    for f in iter_source_files():
        rel_parts = f.relative_to(ROOT_DIR).parts
        if rel_parts[0] in {"evals", ".agents", "backups"}:
            continue
        app_files_count += 1
        for lang_tag in ext_lang_map.get(f.suffix.lower(), ()):
            languages.add(lang_tag)
        try:
            source_chunks.append(f.read_text(encoding="utf-8", errors="ignore").lower())
        except Exception:
            pass

    # 3. Detect frameworks & bundlers dynamically
    if list(ROOT_DIR.glob("next.config.*")) or "next" in dependencies:
        frameworks.update({"next", "nextjs"})
        bundlers.add("nextjs")
    if list(ROOT_DIR.glob("vite.config.*")) or "vite" in dependencies:
        bundlers.add("vite")
        frameworks.add("vite")
    if list(ROOT_DIR.glob("nuxt.config.*")) or "nuxt" in dependencies:
        frameworks.add("nuxt")
    if list(ROOT_DIR.glob("svelte.config.*")) or "svelte" in dependencies:
        frameworks.add("svelte")
    if list(ROOT_DIR.glob("astro.config.*")) or "astro" in dependencies:
        frameworks.add("astro")
    if list(ROOT_DIR.glob("remix.config.*")) or "@remix-run/react" in dependencies:
        frameworks.add("remix")
    if (ROOT_DIR / "angular.json").exists() or "@angular/core" in dependencies:
        frameworks.add("angular")
    if "vue" in dependencies:
        frameworks.add("vue")
    if "react" in dependencies:
        frameworks.add("react")

    # 4. Inspect .env* keys
    for env_file in [".env", ".env.local", ".env.example"]:
        p = ROOT_DIR / env_file
        if p.exists():
            try:
                for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
                    m = re.match(r'^\s*([A-Z0-9_]+)\s*=', line)
                    if m:
                        env_keys.add(m.group(1).lower())
            except Exception:
                pass

    return {
        "languages": sorted(languages),
        "frameworks": sorted(frameworks),
        "bundlers": sorted(bundlers),
        "dependencies": sorted(dependencies),
        "env_keys": sorted(env_keys),
        "app_files_count": app_files_count,
        "source_corpus": "\n".join(source_chunks)
    }

RESTORE_SKILL_SCRIPT_TEMPLATE = '''#!/usr/bin/env python3
"""
Standalone RSI Skill Restoration Utility
Allows listing, searching, and restoring pruned skill files from backups/skills/unpacked/
back into .agents/skills/ in O(1) time.
"""

import sys
import json
import shutil
import argparse
from pathlib import Path

BACKUP_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKUP_DIR.parent.parent
SKILLS_DIR = ROOT_DIR / ".agents" / "skills"
UNPACKED_DIR = BACKUP_DIR / "unpacked"
MANIFEST_PATH = BACKUP_DIR / "RESTORE_MANIFEST.json"

def load_manifest() -> dict:
    if not MANIFEST_PATH.exists():
        print("[WARN] No RESTORE_MANIFEST.json found.")
        return {"files": []}
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

def list_pruned(keyword: str = "") -> None:
    data = load_manifest()
    files = data.get("files", [])
    if keyword:
        kw = keyword.lower()
        files = [f for f in files if kw in f["skill_rel_path"].lower() or kw in f["reason"].lower()]
    print(f"[RSI Skill Backup] {len(files)} pruned file(s) matching query:")
    for item in files:
        print(f"  - {item['skill_rel_path']} ({item['size_bytes']} B) -> {item['reason']}")

def restore_file(rel_path: str) -> bool:
    norm = rel_path.replace("\\\\", "/").lstrip("/")
    if norm.startswith(".agents/skills/"):
        norm = norm[len(".agents/skills/"):]
    src = UNPACKED_DIR / norm
    if not src.exists():
        print(f"[FAIL] Backup file not found in unpacked mirror: {norm}")
        return False
    dst = SKILLS_DIR / norm
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"[OK] Restored: .agents/skills/{norm}")
    return True

def restore_all() -> None:
    data = load_manifest()
    files = data.get("files", [])
    restored = 0
    for item in files:
        if restore_file(item["skill_rel_path"]):
            restored += 1
    print(f"[SUCCESS] Restored {restored}/{len(files)} skill file(s).")

def main():
    parser = argparse.ArgumentParser(description="Restore pruned skill files from backups/skills/")
    parser.add_argument("--list", action="store_true", help="List all pruned skill files")
    parser.add_argument("--find", type=str, metavar="KEYWORD", help="Search pruned files by keyword")
    parser.add_argument("--restore", type=str, metavar="REL_PATH", help="Restore a specific file back to .agents/skills/")
    parser.add_argument("--restore-all", action="store_true", help="Restore all pruned files back to .agents/skills/")
    args = parser.parse_args()

    if args.list:
        list_pruned()
    elif args.find:
        list_pruned(args.find)
    elif args.restore:
        sys.exit(0 if restore_file(args.restore) else 1)
    elif args.restore_all:
        restore_all()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
'''

def evaluate_skill_file_for_pruning(file_path: Path, skill_rel: str, profile: dict) -> str | None:
    """Autonomously determines if a skill sub-file is irrelevant to the discovered project stack."""
    fname = file_path.name
    fname_low = fname.lower()
    rel_low = skill_rel.lower()

    # Inviolable Rule: NEVER prune any SKILL.md entrypoint
    if fname_low == "skill.md":
        return None

    # Rule 1: Universal Upstream Maintainer Metadata
    maintainer_files = {
        "changelog.md", "_contributing.md", "contributing.md",
        "_template.md", "feedback-issue-template.md", ".ds_store"
    }
    if fname_low in maintainer_files:
        return "Upstream repository maintainer metadata (not needed by coding agent)"

    active_langs = set(profile.get("languages", []))
    active_bundlers = set(profile.get("bundlers", []))
    active_fws = set(profile.get("frameworks", []))
    active_deps = set(profile.get("dependencies", []))
    corpus = profile.get("source_corpus", "")

    # Rule 2: Autonomous Language SDK Filter (only when project has active application languages)
    if active_langs:
        lang_aliases = {
            "go": {"go", "golang"},
            "golang": {"go", "golang"},
            "php": {"php"},
            "ruby": {"ruby", "rb"},
            "python": {"python", "py"},
            "java": {"java"},
            "dotnet": {"dotnet", "csharp", "cs"},
            "csharp": {"dotnet", "csharp", "cs"},
            "elixir": {"elixir"},
            "rust": {"rust", "rs"},
            "swift": {"swift"},
            "kotlin": {"kotlin"}
        }
        m_sdk = re.search(r'(?:^|[_\-/])(?:sdk|lang|client)[_\-]([a-z0-9]+)\.', fname_low)
        if m_sdk:
            target_lang = m_sdk.group(1)
            if target_lang in lang_aliases and not (lang_aliases[target_lang] & active_langs):
                return f"Unused language SDK '{target_lang}' (active stack languages: {', '.join(sorted(active_langs))})"

    # Rule 3: Autonomous Bundler / Framework Mismatch Filter
    if "nextjs" in active_bundlers and "vite" not in active_bundlers:
        if fname_low.startswith("vite.config.") or fname_low == "tsconfig.app.json":
            return "Vite-specific bundler scaffold (project uses Next.js, not Vite)"
        if "tailwind" in rel_low or "shadcn" in rel_low:
            try:
                txt = file_path.read_text(encoding="utf-8", errors="ignore")
                if "vite" in txt.lower() and "next" not in txt.lower():
                    return "Vite-only UI scaffold file (project uses Next.js)"
            except Exception:
                pass
    elif "vite" in active_bundlers and "nextjs" not in active_bundlers:
        if fname_low.startswith("next.config."):
            return "Next.js-specific config scaffold (project uses Vite, not Next.js)"

    other_fws = {"vue", "nuxt", "svelte", "angular", "astro", "remix"}
    for fw in other_fws:
        if fw not in active_fws and active_fws:
            if f"/{fw}/" in f"/{rel_low}" or fname_low.startswith(f"{fw}-") or fname_low == f"{fw}.md":
                return f"Unused framework guide '{fw}' (active frameworks: {', '.join(sorted(active_fws))})"

    # Rule 4: Autonomous Cloud Sub-Product Dependency Filter (when package.json / deps exist)
    if active_deps:
        upstash_subproducts = {
            "upstash-blob": "@upstash/blob",
            "upstash-box": "@upstash/box",
            "upstash-search": "@upstash/search",
            "upstash-vector": "@upstash/vector",
            "upstash-workflow": "@upstash/workflow"
        }
        for slug, pkg_name in upstash_subproducts.items():
            if slug in rel_low and pkg_name not in active_deps:
                return f"Unused cloud sub-product '{slug}' ('{pkg_name}' not installed in project dependencies)"

    # Rule 5: Autonomous Optional Marketing / Secondary Feature Filter
    optional_marketing_docs = {
        "broadcasts.md": "broadcast",
        "contacts.md": "contacts",
        "contact-properties.md": "contactproperties",
        "segments.md": "segments",
        "topics.md": "topics",
        "inboxes.md": "inboxes"
    }
    if fname_low in optional_marketing_docs and profile.get("app_files_count", 0) > 0:
        token = optional_marketing_docs[fname_low]
        if token not in corpus:
            return f"Out-of-scope secondary feature '{fname}' (0 references to '{token}' in project source)"

    return None

def prune_skills(dry_run: bool = False) -> dict:
    """Executes the 4-step lossless skill pruning workflow against the autonomous project profile."""
    profile = discover_project_profile()
    print("[RSI Autonomous Skill Pruner] Discovered project profile:")
    print(f"  |-- Languages  : {', '.join(profile['languages']) if profile['languages'] else 'None (Template Root)'}")
    print(f"  |-- Frameworks : {', '.join(profile['frameworks']) if profile['frameworks'] else 'None detected'}")
    print(f"  \\-- Packages   : {len(profile['dependencies'])} installed dependency token(s)")

    if not SKILLS_DIR.exists():
        print("[INFO] No .agents/skills/ directory present. Nothing to prune.")
        return {"pruned_count": 0, "bytes_saved": 0}

    candidates = []
    for root, _, filenames in os.walk(SKILLS_DIR):
        for fname in sorted(filenames):
            fpath = Path(root) / fname
            skill_rel = str(fpath.relative_to(SKILLS_DIR)).replace("\\", "/")
            reason = evaluate_skill_file_for_pruning(fpath, skill_rel, profile)
            if reason:
                size_b = fpath.stat().st_size
                candidates.append({
                    "abs_path": fpath,
                    "skill_rel_path": skill_rel,
                    "size_bytes": size_b,
                    "reason": reason
                })

    total_bytes = sum(c["size_bytes"] for c in candidates)
    if not candidates:
        print("[OK] [RSI Skill Pruner] 0 redundant skill files found. All installed skills match the stack!")
        return {"pruned_count": 0, "bytes_saved": 0}

    if dry_run:
        print(f"\n[INFO] [Dry-Run] Would prune {len(candidates)} file(s) ({total_bytes / 1024:.1f} KB):")
        for c in candidates[:25]:
            print(f"  - .agents/skills/{c['skill_rel_path']} ({c['size_bytes']} B) -> {c['reason']}")
        if len(candidates) > 25:
            print(f"  - ... and {len(candidates) - 25} more file(s)")
        return {"pruned_count": len(candidates), "bytes_saved": total_bytes}

    # Step 2: Lossless Dual Backup (unpacked mirror + .bak ZIP archive)
    unpacked_dir = SKILLS_BACKUP_DIR / "unpacked"
    unpacked_dir.mkdir(parents=True, exist_ok=True)

    manifest_Path = SKILLS_BACKUP_DIR / "RESTORE_MANIFEST.json"
    existing_entries = {}
    if manifest_Path.exists():
        try:
            old_data = json.loads(manifest_Path.read_text(encoding="utf-8"))
            for item in old_data.get("files", []):
                existing_entries[item["skill_rel_path"]] = item
        except Exception:
            pass

    now_iso = datetime.now().isoformat()
    for c in candidates:
        dst = unpacked_dir / c["skill_rel_path"]
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(c["abs_path"], dst)
        c["abs_path"].unlink()
        existing_entries[c["skill_rel_path"]] = {
            "skill_rel_path": c["skill_rel_path"],
            "original_path": f".agents/skills/{c['skill_rel_path']}",
            "backup_unpacked_path": f"backups/skills/unpacked/{c['skill_rel_path']}",
            "size_bytes": c["size_bytes"],
            "reason": c["reason"],
            "pruned_at": now_iso
        }

    # Rebuild skills_pruned.bak ZIP containing all files in unpacked_dir
    bak_zip_path = SKILLS_BACKUP_DIR / "skills_pruned.bak"
    with zipfile.ZipFile(bak_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, filenames in os.walk(unpacked_dir):
            for fname in filenames:
                full_p = Path(root) / fname
                arcname = str(full_p.relative_to(unpacked_dir)).replace("\\", "/")
                zf.write(full_p, arcname)

    # Step 3: Write RESTORE_MANIFEST.json and PRUNED_SKILLS.log
    all_pruned_list = sorted(existing_entries.values(), key=lambda x: x["skill_rel_path"])
    total_manifest_bytes = sum(x["size_bytes"] for x in all_pruned_list)
    manifest_payload = {
        "updated_at": now_iso,
        "total_files": len(all_pruned_list),
        "total_size_bytes": total_manifest_bytes,
        "profile_snapshot": {
            "languages": profile["languages"],
            "frameworks": profile["frameworks"],
            "bundlers": profile["bundlers"]
        },
        "files": all_pruned_list
    }
    manifest_Path.write_text(json.dumps(manifest_payload, indent=2), encoding="utf-8")

    log_lines = [
        "# RSI Lossless Skill Pruning Audit Log (PRUNED_SKILLS.log)",
        f"# Last Updated: {now_iso}",
        f"# Total Pruned Files: {len(all_pruned_list)} ({total_manifest_bytes / 1024:.1f} KB saved)",
        "# Note: All SKILL.md entrypoints are strictly preserved.",
        ""
    ]
    for item in all_pruned_list:
        log_lines.append(
            f"[PRUNED] {item['original_path']} ({item['size_bytes']} B) | REASON: {item['reason']}"
        )
    (SKILLS_BACKUP_DIR / "PRUNED_SKILLS.log").write_text("\n".join(log_lines) + "\n", encoding="utf-8")

    # Step 4: Generate standalone backups/skills/restore_skill.py
    restore_script_path = SKILLS_BACKUP_DIR / "restore_skill.py"
    restore_script_path.write_text(RESTORE_SKILL_SCRIPT_TEMPLATE, encoding="utf-8")

    print(f"\n[SUCCESS] [RSI Skill Pruner] Pruned {len(candidates)} file(s) ({total_bytes / 1024:.1f} KB saved).")
    print("  |-- Archive ZIP : backups/skills/skills_pruned.bak")
    print("  |-- O(1) Mirror : backups/skills/unpacked/")
    print("  |-- Audit Log   : backups/skills/PRUNED_SKILLS.log")
    print("  |-- Manifest    : backups/skills/RESTORE_MANIFEST.json")
    print("  \\-- Restore CLI : python backups/skills/restore_skill.py --list | --find <kw> | --restore <path> | --restore-all")
    return {"pruned_count": len(candidates), "bytes_saved": total_bytes}

def main():
    parser = argparse.ArgumentParser(description="RSI Stack Inspector, Topological Map, Blast Radius & Skill Pruner")
    parser.add_argument("--map", action="store_true", help="Generate compact O(1) Topological Map of singletons and hubs")
    parser.add_argument("--impact", type=str, metavar="FILE", help="Analyze reverse-dependency Blast Radius for a file")
    parser.add_argument("--profile", action="store_true", help="Display autonomously discovered project stack profile")
    parser.add_argument("--prune-skills", action="store_true", help="Execute 4-step lossless pruning on .agents/skills/")
    parser.add_argument("--dry-run", action="store_true", help="Preview --prune-skills without modifying files")
    args = parser.parse_args()

    if args.map:
        generate_topological_map()
        sys.exit(0)

    if args.impact:
        analyze_blast_radius(args.impact)
        sys.exit(0)

    if args.profile:
        prof = discover_project_profile()
        print(json.dumps({k: v for k, v in prof.items() if k != "source_corpus"}, indent=2))
        sys.exit(0)

    if args.prune_skills:
        prune_skills(dry_run=args.dry_run)
        sys.exit(0)

    print("[RSI Stack Inspector] Analyzing project ecosystem...")
    stack = detect_stack()

    if not stack:
        print("[INFO] No standard ecosystem technologies detected yet.")
        return

    print(f"[INFO] {len(stack)} technical components identified in the project:\n")
    missing_tools = []

    for tech, info in stack.items():
        skill_status = "[OK] Installed" if info["has_skill"] else f"[WARN] MISSING ({info['recommended_skill']})"
        mcp_status = "[OK] Configured" if info["has_mcp"] else f"[WARN] MISSING ({info['recommended_mcp']})"
        
        print(f"* {tech.upper()}: {info['purpose']}")
        print(f"   |-- Skill : {skill_status}")
        if info["recommended_mcp"]:
            print(f"   \\-- MCP   : {mcp_status}")
        print()

        if not info["has_skill"] or not info["has_mcp"]:
            missing_tools.append((tech, info))

    if missing_tools:
        print("[INFO] [RSI Recommendations] To avoid unguided coding, install the missing official tools.")
    else:
        print("[OK] [RSI Stack Audit] Official tooling is complete and compliant!")

if __name__ == "__main__":
    main()
