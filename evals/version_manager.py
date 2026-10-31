#!/usr/bin/env python3
"""
OfferAnalyst — Release & Versioning Manager
Gère automatiquement le cycle de vie des versions SemVer (Semantic Versioning) :
- Analyse et évalue les modifications (Git status, Git diff, Changelog, TASKS.md)
- Supporte le format SemVer standard et étendu avec mention : vX.X.X-MENTION
- Met à jour package.json
- Scelle la section ## [Unreleased] de CHANGELOG.md avec la date du jour
- Crée le tag Git annoté correspondant (vX.Y.Z-MENTION)
- Intégré dans le protocole RSI et le pipeline CI/CD
"""

import sys
import os
import re
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

# UTF-8 pour la console Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
PACKAGE_JSON_PATH = ROOT_DIR / "package.json"
CHANGELOG_PATH = ROOT_DIR / "CHANGELOG.md"
TASKS_PATH = ROOT_DIR / "docs" / "TASKS.md"

def parse_semver(version_str: str) -> tuple[int, int, int, str | None]:
    """
    Extrait les composants SemVer (major, minor, patch, mention optionnelle).
    Accepte les formats '1.1.0', 'v1.1.0', '1.1.1-patch', 'v1.2.0-mobile-ui', etc.
    """
    clean = version_str.lstrip("v").strip()
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9._-]+))?$", clean)
    if not match:
        raise ValueError(f"Format de version invalide : '{version_str}' (attendu X.Y.Z ou X.Y.Z-MENTION)")
    major, minor, patch = int(match.group(1)), int(match.group(2)), int(match.group(3))
    mention = match.group(4)
    return major, minor, patch, mention

def get_current_version() -> str:
    if not PACKAGE_JSON_PATH.exists():
        raise FileNotFoundError(f"package.json introuvable à {PACKAGE_JSON_PATH}")
    with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("version", "0.1.0")

def get_unreleased_changelog() -> str:
    if not CHANGELOG_PATH.exists():
        return ""
    content = CHANGELOG_PATH.read_text(encoding="utf-8")
    match = re.search(r"##\s+\[Unreleased\](.*?)(?=\n##\s+\[|\Z)", content, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""

def get_recent_git_modifications() -> list[str]:
    """Récupère la liste des fichiers récemment modifiés (status + diff stat)."""
    try:
        res = subprocess.run(
            ["git", "--no-pager", "diff", "--name-only", "HEAD~1", "HEAD"],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            check=False
        )
        files = [line.strip() for line in res.stdout.splitlines() if line.strip()]
        if not files:
            status_res = subprocess.run(
                ["git", "--no-pager", "status", "--short"],
                cwd=str(ROOT_DIR),
                capture_output=True,
                text=True,
                check=False
            )
            files = [line[3:].strip() for line in status_res.stdout.splitlines() if line.strip()]
        return files
    except Exception:
        return []

def evaluate_modifications(unreleased_text: str, git_files: list[str]) -> tuple[str, str]:
    """
    Évalue intelligemment les modifications pour déduire à la fois le bump_type (major, minor, patch)
    et une mention représentative (ex: 'patch', 'mobile-ui', 'ui-fix', 'hotfix').
    """
    text_lower = unreleased_text.lower()
    files_str = " ".join(git_files).lower()

    # 1. Détection Breaking Change -> MAJOR
    if "breaking change" in text_lower or "breaking:" in text_lower or "feat!:" in text_lower:
        return "major", "breaking"

    # 2. Détection de composants UI/Mobile ou correctifs UI
    has_ui = any("components" in f or "layout" in f or "globals.css" in f for f in git_files) or "ui" in text_lower or "navbar" in text_lower or "mobile" in text_lower
    has_fix = "fix" in text_lower or "patch" in text_lower or "tactile" in text_lower or "bug" in text_lower or "correctif" in text_lower
    has_feature = "feat:" in text_lower or "feat(" in text_lower or "### added" in text_lower or "### 🚀" in unreleased_text or "nouveau" in text_lower

    if has_ui:
        if has_fix and not has_feature:
            return "patch", "ui-fix"
        elif has_feature:
            return "minor", "mobile-ui"
        else:
            return "patch", "patch"

    # 3. Détection Fonctionnalité Générale -> MINOR
    if has_feature or "sprint" in text_lower or "protocole" in text_lower:
        return "minor", "minor"

    # 4. Par défaut : Correctif standard -> PATCH
    return "patch", "patch"

def compute_new_version(current_version: str, bump_type: str, mention: str | None = None) -> str:
    """
    Calcule la nouvelle version SemVer en appliquant le saut de version et la mention optionnelle.
    Exemples de sortie : '1.1.1-patch', '1.2.0-mobile-ui', '1.1.1'
    """
    major, minor, patch, _ = parse_semver(current_version)

    if bump_type == "major":
        base_version = f"{major + 1}.0.0"
    elif bump_type == "minor":
        base_version = f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        base_version = f"{major}.{minor}.{patch + 1}"
    else:
        raise ValueError(f"Type de saut inconnu : {bump_type}")

    if mention and mention.strip():
        # Nettoyage de la mention (caractères autorisés SemVer)
        clean_mention = re.sub(r"[^a-zA-Z0-9._-]", "-", mention.strip()).strip("-")
        return f"{base_version}-{clean_mention}"

    return base_version

def update_package_json(new_version: str, dry_run: bool = False):
    with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    updated_content = re.sub(
        r'("version"\s*:\s*)"[^"]+"',
        rf'\g<1>"{new_version}"',
        content,
        count=1
    )

    if not dry_run:
        PACKAGE_JSON_PATH.write_text(updated_content, encoding="utf-8")

def update_changelog(new_version: str, dry_run: bool = False) -> bool:
    if not CHANGELOG_PATH.exists():
        return False

    content = CHANGELOG_PATH.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")

    # Trouver le bloc ## [Unreleased]
    pattern = r"(##\s+\[Unreleased\]\s*\n)(.*?)(?=\n##\s+\[|\Z)"
    match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)

    if not match:
        return False

    unreleased_body = match.group(2).strip()
    if not unreleased_body:
        return False

    # Insérer la nouvelle version scellée sous une section [Unreleased] fraîche
    new_release_section = f"## [Unreleased]\n\n## [{new_version}] - {today}\n\n{unreleased_body}\n"

    updated_content = (
        content[:match.start()]
        + new_release_section
        + content[match.end():]
    )

    if not dry_run:
        CHANGELOG_PATH.write_text(updated_content, encoding="utf-8")
    return True

def create_git_tag(version: str, title: str = "", dry_run: bool = False) -> bool:
    tag_name = f"v{version}"
    message = title if title else f"Release {tag_name}"

    if dry_run:
        return True

    try:
        check = subprocess.run(
            ["git", "tag", "-l", tag_name],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            check=False
        )
        if tag_name in check.stdout.strip().splitlines():
            return False

        res = subprocess.run(
            ["git", "tag", "-a", tag_name, "-m", message],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            check=False
        )
        return res.returncode == 0
    except Exception:
        return False

def main():
    parser = argparse.ArgumentParser(description="OfferAnalyst Release & SemVer Manager (avec support vX.X.X-MENTION)")
    parser.add_argument("--bump", choices=["auto", "patch", "minor", "major"], default="auto", help="Type de saut SemVer")
    parser.add_argument("--mention", type=str, default=None, help="Mention personnalisée pour le format vX.X.X-MENTION (ex: patch, mobile-ui, ui-fix)")
    parser.add_argument("--auto-mention", action="store_true", help="Déduit automatiquement la mention par évaluation des modifications")
    parser.add_argument("--dry-run", action="store_true", help="Simule sans écrire sur le disque")
    parser.add_argument("--no-tag", action="store_true", help="Ne pas créer de tag Git")
    parser.add_argument("--title", type=str, default="", help="Message descriptif pour le tag Git")
    args = parser.parse_args()

    current_ver = get_current_version()
    unreleased = get_unreleased_changelog()
    git_files = get_recent_git_modifications()

    detected_bump, detected_mention = evaluate_modifications(unreleased, git_files)

    bump_type = args.bump if args.bump != "auto" else detected_bump

    # Gestion de la mention
    mention = None
    if args.mention is not None:
        mention = args.mention.strip()
    elif args.auto_mention or args.bump == "auto":
        mention = detected_mention

    new_ver = compute_new_version(current_ver, bump_type, mention=mention)
    tag_name = f"v{new_ver}"

    result = {
        "status": "SUCCESS",
        "current_version": current_ver,
        "new_version": new_ver,
        "tag_name": tag_name,
        "bump_type": bump_type,
        "mention": mention,
        "evaluated_context": {
            "detected_bump": detected_bump,
            "detected_mention": detected_mention,
            "modified_files_count": len(git_files)
        },
        "dry_run": args.dry_run,
        "tag_created": False
    }

    if not args.dry_run:
        update_package_json(new_ver, dry_run=False)
        changelog_updated = update_changelog(new_ver, dry_run=False)
        result["changelog_updated"] = changelog_updated

        if not args.no_tag:
            tag_created = create_git_tag(new_ver, title=args.title, dry_run=False)
            result["tag_created"] = tag_created
    else:
        result["changelog_updated"] = bool(unreleased)

    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
