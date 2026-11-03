#!/usr/bin/env python3
"""
Adaptive & Agnostic Deterministic Judge for OfferAnalyst and Universal RSI Projects.

Automatically adapts to the target repository stack:
1. Detects Package Manager (pnpm, bun, yarn, npm).
2. Runs Typecheck if tsconfig.json is present.
3. Runs Linter if eslint, biome, or ruff is present.
4. Detects ORM / DB: runs Prisma validator if prisma exists, Drizzle if drizzle exists, or gracefully bypasses without false failure.
5. Verifies RSI Modular Memory compliance (evals/memory_engine.py --audit).
6. Optional production build check (--full).

Usage:
  python evals/run_fullstack_eval.py [--quick | -q]
"""

import subprocess
import json
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime

# Force UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
LOG_PATH = ROOT_DIR / "evals" / "logs" / "trajectory_latest.json"

def detect_package_manager() -> str:
    if (ROOT_DIR / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (ROOT_DIR / "bun.lockb").exists() or (ROOT_DIR / "bun.lock").exists():
        return "bun"
    if (ROOT_DIR / "yarn.lock").exists():
        return "yarn"
    if (ROOT_DIR / "package-lock.json").exists():
        return "npm"
    return "pnpm"

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

def build_adaptive_checks(quick: bool) -> list[dict]:
    pm = detect_package_manager()
    py = sys.executable
    checks = []

    # 1. Typecheck (if tsconfig.json exists)
    if (ROOT_DIR / "tsconfig.json").exists():
        tc_cmd = f"{pm} exec tsc --noEmit" if pm in ["pnpm", "bun"] else f"npx tsc --noEmit"
        checks.append({
            "name": "typecheck",
            "cmd": tc_cmd,
            "weight": 30 if quick else 25,
            "timeout": 150
        })

    # 2. Linting (if ESLint, Biome or package.json has lint)
    pkg_json = ROOT_DIR / "package.json"
    has_lint_script = False
    if pkg_json.exists():
        try:
            pkg_data = json.loads(pkg_json.read_text(encoding="utf-8"))
            has_lint_script = "lint" in pkg_data.get("scripts", {})
        except Exception:
            pass

    if has_lint_script:
        checks.append({
            "name": "lint",
            "cmd": f"{pm} run lint",
            "weight": 30 if quick else 25,
            "timeout": 240
        })

    # 3. ORM & Database Schema Hygiene (Adaptive)
    prisma_schema = ROOT_DIR / "prisma" / "schema.prisma"
    db_validator = ROOT_DIR / ".agents" / "skills" / "db_schema_validator.py"

    if prisma_schema.exists() and db_validator.exists():
        checks.append({
            "name": "prisma_hygiene",
            "cmd": f'"{py}" "{db_validator}"',
            "weight": 25 if quick else 15,
            "timeout": 60
        })
    elif (ROOT_DIR / "drizzle.config.ts").exists() or (ROOT_DIR / "drizzle.config.js").exists():
        checks.append({
            "name": "drizzle_check",
            "cmd": f"{pm} exec drizzle-kit check",
            "weight": 25 if quick else 15,
            "timeout": 60
        })

    # 4. RSI Modular Memory Hygiene
    memory_engine = ROOT_DIR / "evals" / "memory_engine.py"
    if memory_engine.exists():
        checks.append({
            "name": "rsi_memory_hygiene",
            "cmd": f'"{py}" "{memory_engine}" --audit',
            "weight": 15 if quick else 10,
            "timeout": 30
        })

    # 5. Production Build (Full mode only)
    if not quick and has_lint_script:
        checks.append({
            "name": "prod_build",
            "cmd": f"{pm} run build",
            "weight": 25,
            "timeout": 180
        })

    return checks

def main():
    parser = argparse.ArgumentParser(description="Juge Déterministe RSI Adaptatif & Agnostique")
    parser.add_argument("--quick", "-q", action="store_true", help="Ignorer le build de production pour une boucle rapide")
    args = parser.parse_args()

    check_configs = build_adaptive_checks(args.quick)
    executed_checks = []

    for cfg in check_configs:
        res = run_cmd(cfg["name"], cfg["cmd"], weight=cfg["weight"], timeout_sec=cfg["timeout"])
        executed_checks.append(res)

    total_score = sum(c["score"] for c in executed_checks)
    max_possible = sum(c["max_score"] for c in executed_checks)
    normalized_score = int((total_score / max_possible) * 100) if max_possible > 0 else 100

    failed_steps = [c for c in executed_checks if not c["passed"]]

    report = {
        "timestamp": datetime.now().isoformat(),
        "mode": "QUICK" if args.quick else "FULL",
        "total_score": normalized_score,
        "raw_score": total_score,
        "max_score": max_possible,
        "status": "PASS" if normalized_score == 100 else "FAIL",
        "failed_steps": failed_steps,
        "summary": {c["step"]: "PASSED" if c["passed"] else "FAILED" for c in executed_checks}
    }

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))

    sys.exit(0 if normalized_score == 100 else 1)

if __name__ == "__main__":
    main()
