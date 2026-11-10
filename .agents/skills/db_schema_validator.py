#!/usr/bin/env python3
"""
Prisma PostgreSQL / Supabase Schema & ORM Hygiene Validator for OfferAnalyst.
Validates:
1. Provider is postgresql.
2. Every model has a valid primary key (@id).
3. No legacy MongoDB artifacts (@db.ObjectId, @map("_id"), @db.String) remain.
4. Checks that codebase uses prisma singleton (@/lib/prisma) instead of direct instantiation.
5. Runs `pnpm exec prisma validate`.
"""

import sys
import json
import re
import subprocess
import os
from pathlib import Path

# Assurer l'encodage UTF-8 pour Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
SCHEMA_PATH = ROOT_DIR / "prisma" / "schema.prisma"
SRC_DIR = ROOT_DIR / "src"

def validate_prisma_schema_content() -> list[dict]:
    issues = []
    if not SCHEMA_PATH.exists():
        return [{"severity": "ERROR", "message": f"Fichier schema.prisma introuvable à {SCHEMA_PATH}"}]

    content = SCHEMA_PATH.read_text(encoding="utf-8")

    # 1. Vérification du provider
    if 'provider  = "postgresql"' not in content and 'provider = "postgresql"' not in content:
        issues.append({
            "severity": "ERROR",
            "message": "Le datasource db doit utiliser le provider 'postgresql'."
        })

    # 2. Vérification des artefacts MongoDB résiduels
    if "@db.ObjectId" in content:
        issues.append({
            "severity": "ERROR",
            "message": "Artefact MongoDB résiduel détecté: '@db.ObjectId' interdit sous PostgreSQL."
        })

    if '@map("_id")' in content:
        issues.append({
            "severity": "ERROR",
            "message": "Artefact MongoDB résiduel détecté: '@map(\"_id\")' interdit sous PostgreSQL."
        })

    if "@db.String" in content:
        issues.append({
            "severity": "WARNING",
            "message": "Type MongoDB '@db.String' détecté. Utilisez le type natif 'String' ou '@db.Text' sous PostgreSQL."
        })

    # 3. Analyse des modèles
    model_regex = re.compile(r"model\s+(\w+)\s+\{([^}]+)\}", re.MULTILINE)
    for match in model_regex.finditer(content):
        model_name = match.group(1)
        body = match.group(2)
        lines = [line.strip() for line in body.splitlines() if line.strip() and not line.strip().startswith("//")]

        # Vérifier l'ID principal
        has_valid_id = any(
            re.search(r"^id\s+String\s+@id", line)
            for line in lines
        )
        if not has_valid_id:
            issues.append({
                "severity": "ERROR",
                "model": model_name,
                "message": f"Le modèle '{model_name}' ne possède pas d'identifiant valide: 'id String @id ...'"
            })

    return issues

def check_prisma_singleton_usage() -> list[dict]:
    issues = []
    if not SRC_DIR.exists():
        return issues

    instantiation_regex = re.compile(r"new\s+PrismaClient\(")
    for ts_file in SRC_DIR.rglob("*.ts*"):
        if "prisma.ts" in ts_file.name:
            continue
        try:
            content = ts_file.read_text(encoding="utf-8")
            if instantiation_regex.search(content):
                issues.append({
                    "severity": "ERROR",
                    "file": str(ts_file.relative_to(ROOT_DIR)),
                    "message": "Instanciation directe 'new PrismaClient()' interdite. Utilisez l'import singleton '@/lib/prisma'."
                })
        except Exception:
            pass

    return issues

def run_prisma_cli_validate() -> dict:
    is_windows = os.name == "nt"
    cmd = "pnpm exec prisma validate" if is_windows else ["pnpm", "exec", "prisma", "validate"]
    try:
        res = subprocess.run(
            cmd,
            shell=is_windows,
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=45
        )
        stdout_clean = (res.stdout or "").strip()
        stderr_clean = (res.stderr or "").strip()
        return {
            "passed": res.returncode == 0,
            "stdout": stdout_clean,
            "stderr": stderr_clean
        }
    except Exception as e:
        return {"passed": False, "stdout": "", "stderr": str(e)}

def main():
    schema_issues = validate_prisma_schema_content()
    singleton_issues = check_prisma_singleton_usage()
    cli_validation = run_prisma_cli_validate()

    all_issues = schema_issues + singleton_issues
    if not cli_validation["passed"]:
        all_issues.append({
            "severity": "ERROR",
            "message": f"Échec de 'pnpm exec prisma validate': {cli_validation['stderr'] or cli_validation['stdout']}"
        })

    has_errors = any(i["severity"] == "ERROR" for i in all_issues)

    report = {
        "status": "PASS" if not has_errors else "FAIL",
        "total_issues": len(all_issues),
        "issues": all_issues,
        "cli_validate": cli_validation["passed"]
    }

    print(json.dumps(report, indent=2, ensure_ascii=False))
    sys.exit(1 if has_errors else 0)

if __name__ == "__main__":
    main()
