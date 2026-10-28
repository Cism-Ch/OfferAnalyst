#!/usr/bin/env python3
"""
Juge Déterministe Fullstack pour OfferAnalyst (Next.js 16 / React 19 / Prisma / TypeScript)
Remplace le jugement subjectif du LLM par des vérifications binaires automatisées :
1. Typecheck strict : `npx tsc --noEmit` (Poids : 30)
2. Linting ESLint : `npm run lint` (Poids : 25)
3. Hygiène & Schéma Prisma MongoDB : `python .agents/skills/db_schema_validator.py` (Poids : 20)
4. Build de production Next.js : `npm run build` (Poids : 25)

Option :
--quick / -q : Exécute uniquement les vérifications rapides (types, lint, prisma) sans le build complet Next.js.
"""

import subprocess
import json
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime

# Assurer l'encodage UTF-8 pour Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
LOG_PATH = ROOT_DIR / "evals" / "logs" / "trajectory_latest.json"

def run_cmd(name: str, cmd_str: str, weight: int, timeout_sec: int = 180) -> dict:
    is_windows = os.name == "nt"
    try:
        res = subprocess.run(
            cmd_str,
            shell=True if is_windows else False,
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            encoding="utf-8",
            errors="replace"
        )
        passed = res.returncode == 0
        error_output = "" if passed else f"STDERR:\n{res.stderr[-1500:]}\nSTDOUT:\n{res.stdout[-1500:]}"
        return {
            "step": name,
            "passed": passed,
            "score": weight if passed else 0,
            "max_score": weight,
            "error_log": error_output.strip()
        }
    except subprocess.TimeoutExpired:
        return {
            "step": name,
            "passed": False,
            "score": 0,
            "max_score": weight,
            "error_log": f"Timeout dépassé ({timeout_sec}s) lors de l'exécution de: {cmd_str}"
        }
    except Exception as e:
        return {
            "step": name,
            "passed": False,
            "score": 0,
            "max_score": weight,
            "error_log": str(e)
        }

def main():
    parser = argparse.ArgumentParser(description="Juge Déterministe RSI OfferAnalyst")
    parser.add_argument("--quick", "-q", action="store_true", help="Ignorer le build de production pour une boucle rapide")
    args = parser.parse_args()

    python_executable = sys.executable

    checks = [
        # 1. Vérification du typage statique TypeScript strict
        run_cmd("typecheck", "npx tsc --noEmit", weight=35 if args.quick else 30, timeout_sec=150),
        # 2. Vérification ESLint React 19
        run_cmd("lint", "npm run lint", weight=35 if args.quick else 25, timeout_sec=150),
        # 3. Validation Prisma MongoDB & Singletons
        run_cmd("prisma_hygiene", f'"{python_executable}" .agents/skills/db_schema_validator.py', weight=30 if args.quick else 20, timeout_sec=60),
    ]

    if not args.quick:
        # 4. Build de production complet Next.js
        checks.append(run_cmd("prod_build", "npm run build", weight=25, timeout_sec=180))

    total_score = sum(c["score"] for c in checks)
    max_possible = sum(c["max_score"] for c in checks)
    normalized_score = int((total_score / max_possible) * 100) if max_possible > 0 else 0

    failed_steps = [c for c in checks if not c["passed"]]

    report = {
        "timestamp": datetime.now().isoformat(),
        "mode": "QUICK" if args.quick else "FULL",
        "total_score": normalized_score,
        "raw_score": total_score,
        "max_score": max_possible,
        "status": "PASS" if normalized_score == 100 else "FAIL",
        "failed_steps": failed_steps,
        "summary": {c["step"]: "PASSED" if c["passed"] else "FAILED" for c in checks}
    }

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))

    sys.exit(0 if normalized_score == 100 else 1)

if __name__ == "__main__":
    main()
