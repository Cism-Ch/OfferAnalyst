#!/usr/bin/env python3
"""
RSI Protocol Reset Engine
Resets project memory and tracking state for starting a fresh project:
- docs/TASKS.md restored to pristine initial state (TASK-INIT-01)
- docs/archive/tasks/ cleaned
- CHANGELOG.md reset to initial 0.1.0 unreleased baseline
- evals/logs/ trajectory cleared
- Optional backup archive creation
- 100% Pure ASCII terminal output
"""

import sys
import os
import shutil
import zipfile
import argparse
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
TASKS_PATH = ROOT_DIR / "docs" / "TASKS.md"
TASKS_ARCHIVE_DIR = ROOT_DIR / "docs" / "archive" / "tasks"
CHANGELOG_PATH = ROOT_DIR / "CHANGELOG.md"
LOGS_DIR = ROOT_DIR / "evals" / "logs"
BACKUPS_DIR = ROOT_DIR / "evals" / "backups"

PRISTINE_TASKS_TEMPLATE = """# [SSOT] TASKS.md - Central Registry & Task Tracker

> Single Source of Truth (SSOT) for orchestrating technical and functional tasks.
> Strict ceiling: 250 lines. Consult before every task, update on completion.

---

## Synthetic Kanban View

```
+-------------------------+  +-------------------------+  +-------------------------+
| [>] IN PROGRESS (SP 01) |  |   [?] FUTURE BACKLOG    |  |       [X] ARCHIVES      |
+-------------------------+  +-------------------------+  +-------------------------+
| [ ] TASK-INIT-01        |  | [ ] Future task 1       |  |     - No archived       |
|                         |  | [ ] Future task 2       |  |       sprints yet       |
+-------------------------+  +-------------------------+  +-------------------------+
```

---

## Active Sprint 01: Project Setup & Initialization

- [ ] **`TASK-INIT-01` - Project Scaffolding & Initial Setup**
  - **Priority:** HIGH
  - **Target files:** `package.json`, `README.md`
  - **Acceptance criteria:**
    - [ ] `TASK-INIT-01.01`: Technical baseline and dependency configuration.
    - [ ] `TASK-INIT-01.02`: Deterministic validation with `python evals/run_fullstack_eval.py --quick` (100/100 PASS).

---

## Completed Tasks History

| Date | Task ID | Title & Description | Created / Modified Files |
| :--- | :--- | :--- | :--- |
| *YYYY-MM-DD* | *TASK-INIT-00* | *Project initialization* | *Initial repository setup* |
"""

PRISTINE_CHANGELOG_TEMPLATE = """# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project initialized using the Agentic RSI Protocol template.
"""

def create_backup() -> Path:
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_path = BACKUPS_DIR / f"rsi_backup_{timestamp}.zip"

    files_to_backup = []
    if TASKS_PATH.exists():
        files_to_backup.append(TASKS_PATH)
    if CHANGELOG_PATH.exists():
        files_to_backup.append(CHANGELOG_PATH)
    if TASKS_ARCHIVE_DIR.exists():
        files_to_backup.extend(TASKS_ARCHIVE_DIR.glob("**/*"))

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in files_to_backup:
            if f.is_file():
                arcname = str(f.relative_to(ROOT_DIR))
                zipf.write(f, arcname)

    return zip_path

def perform_reset(dry_run: bool = False, backup: bool = True) -> bool:
    print("[RSI Reset Engine] Starting repository memory reset process...")

    if dry_run:
        print("[INFO] DRY RUN MODE: No files will be modified.")

    # 1. Backup
    if backup and not dry_run:
        backup_file = create_backup()
        print(f"[OK] State backup archived to: {backup_file.relative_to(ROOT_DIR)}")

    # 2. Reset docs/TASKS.md
    print(f"  * docs/TASKS.md -> Restoring pristine sprint template (TASK-INIT-01)")
    if not dry_run:
        TASKS_PATH.parent.mkdir(parents=True, exist_ok=True)
        TASKS_PATH.write_text(PRISTINE_TASKS_TEMPLATE, encoding="utf-8")

    # 3. Clean docs/archive/tasks/
    if TASKS_ARCHIVE_DIR.exists():
        archived_files = list(TASKS_ARCHIVE_DIR.glob("*.md"))
        print(f"  * docs/archive/tasks/ -> Removing {len(archived_files)} archived sprint file(s)")
        if not dry_run:
            for af in archived_files:
                af.unlink()

    # 4. Reset CHANGELOG.md
    print(f"  * CHANGELOG.md -> Resetting to unreleased initial state")
    if not dry_run:
        CHANGELOG_PATH.write_text(PRISTINE_CHANGELOG_TEMPLATE, encoding="utf-8")

    # 5. Clean logs in evals/logs/
    if LOGS_DIR.exists():
        log_files = list(LOGS_DIR.glob("*.json"))
        print(f"  * evals/logs/ -> Clearing {len(log_files)} evaluation trajectory log(s)")
        if not dry_run:
            for lf in log_files:
                try:
                    lf.unlink()
                except Exception:
                    pass

    if dry_run:
        print("\n[INFO] Dry run complete. Use without --dry-run to apply changes.")
    else:
        print("\n[SUCCESS] RSI Memory and task registry reset successfully!")
        print("[INFO] Next step: Run 'python evals/run_fullstack_eval.py --quick' to verify clean baseline.")

    return True

def main():
    parser = argparse.ArgumentParser(description="RSI Protocol Memory & Task Reset Engine")
    parser.add_argument("--dry-run", action="store_true", help="Simulate reset without altering files")
    parser.add_argument("--no-backup", action="store_true", help="Skip creating a zip backup in evals/backups/")
    parser.add_argument("--force", "-f", action="store_true", help="Bypass interactive user confirmation")
    args = parser.parse_args()

    if not args.force and not args.dry_run:
        print("=" * 65)
        print("WARNING: This will reset docs/TASKS.md and CHANGELOG.md to clean baseline.")
        print("=" * 65)
        try:
            choice = input("Are you sure you want to proceed? [y/N]: ").strip().lower()
            if choice not in ["y", "yes"]:
                print("[INFO] Operation aborted by user.")
                sys.exit(0)
        except EOFError:
            pass

    success = perform_reset(dry_run=args.dry_run, backup=not args.no_backup)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
