#!/usr/bin/env python3
"""
Universal SemVer Versioning Manager
Manages release version life cycles:
- SemVer bumping (Major, Minor, Patch, pre-release tags)
- VERSION file updating (protocol specification baseline)
- package.json version updating (optional, when application is present)
- Sealing the [Unreleased] section in CHANGELOG.md with current date
- Automatic Git tagging preparation
"""

import sys
import os
import re
import json
import shutil
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

# UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
PACKAGE_JSON_PATH = ROOT_DIR / "package.json"
VERSION_PATH = ROOT_DIR / "VERSION"
CHANGELOG_PATH = ROOT_DIR / "CHANGELOG.md"

CORE_ENGINE_DIRS = [
    "evals",
    ".agents/workflows",
    ".agents/prompts"
]

CORE_ENGINE_FILES = [
    "AGENTS.md",
    "VERSION"
]

def parse_semver(version_str: str) -> tuple[int, int, int, str | None]:
    clean = version_str.lstrip("v").strip()
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9._-]+))?$", clean)
    if not match:
        raise ValueError(f"Invalid SemVer format: '{version_str}'")
    return int(match.group(1)), int(match.group(2)), int(match.group(3)), match.group(4)

def get_current_version() -> str:
    if VERSION_PATH.exists():
        return VERSION_PATH.read_text(encoding="utf-8").strip()
    if PACKAGE_JSON_PATH.exists():
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("version", "0.1.0")
    return "0.1.0"

def bump_semver(current_ver: str, bump_type: str, mention: str | None = None) -> str:
    major, minor, patch, _ = parse_semver(current_ver)
    bump_lower = bump_type.lower()

    if bump_lower == "major":
        major += 1
        minor = 0
        patch = 0
    elif bump_lower == "minor":
        minor += 1
        patch = 0
    elif bump_lower == "patch":
        patch += 1
    else:
        raise ValueError(f"Invalid bump type: '{bump_type}'")

    new_ver = f"{major}.{minor}.{patch}"
    if mention:
        clean_mention = re.sub(r"[^a-zA-Z0-9._-]", "-", mention.strip())
        new_ver = f"{new_ver}-{clean_mention}"
    return new_ver

def update_version_files(new_ver: str) -> None:
    if VERSION_PATH.exists():
        VERSION_PATH.write_text(f"{new_ver}\n", encoding="utf-8")

    if PACKAGE_JSON_PATH.exists():
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["version"] = new_ver
        with open(PACKAGE_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

def update_changelog(new_ver: str) -> None:
    if not CHANGELOG_PATH.exists():
        return
    content = CHANGELOG_PATH.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")
    replacement = f"## [Unreleased]\n\n## [{new_ver}] - {today}"
    if re.search(r"##\s+\[Unreleased\]", content, re.IGNORECASE):
        updated = re.sub(r"##\s+\[Unreleased\]", replacement, content, count=1, flags=re.IGNORECASE)
        CHANGELOG_PATH.write_text(updated, encoding="utf-8")

def sync_protocol_to_target(target_path_str: str, init_mode: bool = False) -> None:
    target_dir = Path(target_path_str).resolve()
    if not target_dir.exists():
        if init_mode:
            target_dir.mkdir(parents=True, exist_ok=True)
            print(f"[Init] Created target project root: {target_dir}")
        else:
            print(f"[Error] Target directory does not exist: {target_dir}")
            sys.exit(1)

    print(f"=== [RSI PROTOCOL SYNC] ===")
    print(f"Source Protocol : {ROOT_DIR} (v{get_current_version()})")
    print(f"Target Project  : {target_dir}")
    print(f"Mode            : {'INITIALIZE + SYNC' if init_mode else 'UPDATE / SYNC'}")
    print("-" * 50)

    # 1. Sync Core Engine Directories
    for rel_dir in CORE_ENGINE_DIRS:
        src = ROOT_DIR / rel_dir
        dst = target_dir / rel_dir
        if not src.exists():
            continue
        dst.mkdir(parents=True, exist_ok=True)

        for root, dirs, files in os.walk(src):
            rel_root = Path(root).relative_to(src)
            target_subdir = dst / rel_root
            target_subdir.mkdir(parents=True, exist_ok=True)

            for f in files:
                if f.endswith(".tmp") or f == "active_session.json":
                    continue
                src_file = Path(root) / f
                dst_file = target_subdir / f
                shutil.copy2(src_file, dst_file)
        print(f"[OK] Synced engine directory: {rel_dir}/")

    # 2. Sync Core Engine Files
    for rel_file in CORE_ENGINE_FILES:
        src = ROOT_DIR / rel_file
        dst = target_dir / rel_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[OK] Synced core contract file: {rel_file}")

    # 3. Base Rules (system_core.md and fullstack_playbook.md) - only if missing or update
    target_rules_dir = target_dir / ".agents" / "rules"
    target_rules_dir.mkdir(parents=True, exist_ok=True)
    for rule_file in ["system_core.md", "fullstack_playbook.md"]:
        src = ROOT_DIR / ".agents" / "rules" / rule_file
        dst = target_rules_dir / rule_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[OK] Synced base rule playbook: .agents/rules/{rule_file}")

    # 4. Target Specific Structures (Never overwritten if they exist)
    target_modules_dir = target_rules_dir / "modules"
    target_modules_dir.mkdir(parents=True, exist_ok=True)

    # If target has no modules yet, seed base modules from protocol
    src_modules_dir = ROOT_DIR / ".agents" / "rules" / "modules"
    if src_modules_dir.exists():
        for mod in src_modules_dir.glob("*.md"):
            dst_mod = target_modules_dir / mod.name
            if not dst_mod.exists():
                shutil.copy2(mod, dst_mod)
                print(f"[Init] Seeded procedural rule module: {mod.name}")

    target_telemetry_dir = target_dir / ".agents" / "telemetry"
    target_telemetry_dir.mkdir(parents=True, exist_ok=True)

    target_archive_dir = target_dir / "docs" / "archive" / "tasks"
    target_archive_dir.mkdir(parents=True, exist_ok=True)

    target_tasks = target_dir / "docs" / "TASKS.md"
    if not target_tasks.exists():
        # Create minimal initial SSOT TASKS.md for target project
        initial_tasks_content = (
            "# [SSOT] TASKS.md - Central Registry & Task Tracker\n\n"
            "> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.\n"
            "> Absolute rule for AI Agents: Consult before every task, update immediately on completion.\n"
            "> Strict ceiling: 250 lines.\n\n"
            "---\n\n"
            "## Synthetic Kanban View\n\n"
            "```\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "| [>] IN PROGRESS (SP 01) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "| [ ] TASK-INIT-01        |  | [ ] Future task 1       |  |                         |\n"
            "+-------------------------+  +-------------------------+  +-------------------------+\n"
            "```\n\n"
            "---\n\n"
            "## Active Sprint 01: Project Setup & Initialization\n\n"
            "- [ ] **`TASK-INIT-01` - Initial Project Scaffolding & Setup**\n"
            "  - **Priority:** HIGH\n"
            "  - **Target files:** `README.md`, `docs/TASKS.md`\n"
            "  - **Acceptance criteria:**\n"
            "    - [ ] `TASK-INIT-01.01`: Project requirements and core architecture definition.\n"
            "    - [ ] `TASK-INIT-01.02`: Validate deterministic baseline with `python evals/run_fullstack_eval.py --quick`.\n\n"
            "---\n\n"
            "## Completed Tasks History\n\n"
            "| Date | Task ID | Title & Description | Created / Modified Files |\n"
            "| :--- | :--- | :--- | :--- |\n"
        )
        target_tasks.write_text(initial_tasks_content, encoding="utf-8")
        print(f"[Init] Created target SSOT: docs/TASKS.md")
    else:
        print(f"[Preserve] Kept existing target backlog: docs/TASKS.md (SSOT intact)")

    print("-" * 50)
    print(f"[SUCCESS] Agentic-RSI-Protocol engine synchronized successfully to:")
    print(f"          {target_dir}")
    print(f"Next steps in target workspace:")
    print(f"  1. cd {target_dir}")
    print(f"  2. python evals/rsi_orchestrator.py --pulse")
    print(f"  3. python evals/run_fullstack_eval.py --quick")

def main():
    parser = argparse.ArgumentParser(description="Universal SemVer & Protocol Target Sync Manager")
    parser.add_argument("--bump", choices=["major", "minor", "patch"], help="SemVer bump increment level")
    parser.add_argument("--mention", help="Optional pre-release tag (e.g. beta, hotfix)")
    parser.add_argument("--sync-to", metavar="TARGET_DIR", help="Synchronize or update protocol engine into a target project")
    parser.add_argument("--init-target", metavar="TARGET_DIR", help="Initialize protocol structure and sync into a new target project")
    args = parser.parse_args()

    if args.sync_to:
        sync_protocol_to_target(args.sync_to, init_mode=False)
        return

    if args.init_target:
        sync_protocol_to_target(args.init_target, init_mode=True)
        return

    if args.bump:
        curr = get_current_version()
        next_ver = bump_semver(curr, args.bump, args.mention)
        print(f"[SemVer Bump] {curr} -> {next_ver}")
        update_version_files(next_ver)
        update_changelog(next_ver)
        print("[OK] Version and CHANGELOG updated successfully.")
        return

    parser.print_help()

if __name__ == "__main__":
    main()
