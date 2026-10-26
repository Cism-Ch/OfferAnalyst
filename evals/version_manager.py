#!/usr/bin/env python3
"""
OfferAnalyst — Release & Versioning Manager
Gère automatiquement le cycle de vie des versions SemVer (Semantic Versioning) :
- Analyse les modifications (Changelog, Git log) pour déterminer le type de saut (major, minor, patch)
- Met à jour package.json
- Scelle la section ## [Unreleased] de CHANGELOG.md avec la date du jour
- Crée le tag Git annoté correspondant (vX.Y.Z)
- Intégrable dans le protocole RSI et le pipeline CI/CD GitHub Actions
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

def detect_bump_type(unreleased_text: str) -> str:
    """
    Détermine si le saut doit être 'major', 'minor' ou 'patch'
    selon les conventions SemVer et les types de changements présents.
    """
    text_lower = unreleased_text.lower()
    
    # Détection Breaking Change -> MAJOR
    if "breaking change" in text_lower or "breaking:" in text_lower or "feat!:" in text_lower:
        return "major"
    
    # Détection de Nouvelles Fonctionnalités -> MINOR
    if (
        "### 🚀" in unreleased_text
        or "### ✨" in unreleased_text
        or "### added" in text_lower
        or "feat(" in text_lower
        or "feat:" in text_lower
        or "sprint" in text_lower
        or "protocole" in text_lower
    ):
        return "minor"
    
    # Tout le reste (correctifs, refactorings, sécurité, docs) -> PATCH
    return "patch"

def compute_new_version(current_version: str, bump_type: str) -> str:
    parts = current_version.split(".")
    if len(parts) != 3:
        raise ValueError(f"Format de version invalide : {current_version} (attendu X.Y.Z)")
    
    major, minor, patch = map(int, parts)
    
    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    else:
        raise ValueError(f"Type de saut inconnu : {bump_type}")

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
        
    unreleased_header = match.group(1)
    unreleased_body = match.group(2).strip()
    
    if not unreleased_body:
        # Pas de contenu non publié
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
        # Vérifier si le tag existe déjà
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
    parser = argparse.ArgumentParser(description="OfferAnalyst Release & SemVer Manager")
    parser.add_argument("--bump", choices=["auto", "patch", "minor", "major"], default="auto", help="Type de saut SemVer")
    parser.add_argument("--dry-run", action="store_true", help="Simule sans écrire sur le disque")
    parser.add_argument("--no-tag", action="store_true", help="Ne pas créer de tag Git")
    parser.add_argument("--title", type=str, default="", help="Message descriptif pour le tag Git")
    args = parser.parse_args()

    current_ver = get_current_version()
    unreleased = get_unreleased_changelog()
    
    bump_type = args.bump
    if bump_type == "auto":
        bump_type = detect_bump_type(unreleased)
        
    new_ver = compute_new_version(current_ver, bump_type)
    
    result = {
        "status": "SUCCESS",
        "current_version": current_ver,
        "new_version": new_ver,
        "bump_type": bump_type,
        "dry_run": args.dry_run,
        "unreleased_items_count": len(unreleased.splitlines()) if unreleased else 0,
        "tag_created": False
    }

    if not args.dry_run:
        update_package_json(new_ver, dry_run=False)
        changelog_updated = update_changelog(new_ver, dry_run=False)
        result["changelog_updated"] = changelog_updated
        
        if not args.no_tag:
            tag_created = create_git_tag(new_ver, title=args.title, dry_run=False)
            result["tag_created"] = tag_created
            result["tag_name"] = f"v{new_ver}"
    else:
        result["changelog_updated"] = bool(unreleased)
        result["tag_name"] = f"v{new_ver}"

    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
