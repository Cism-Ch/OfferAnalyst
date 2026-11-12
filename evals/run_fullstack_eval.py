#!/usr/bin/env python3
"""
RSI Adaptive & Agnostic Deterministic Judge
- Automatic detection of package manager (pnpm, npm, yarn, bun)
- Execution of typecheck and linter if configured
- Adaptive validation of DB schemas (Prisma, Drizzle, etc.) when present
- RSI modular memory hygiene verification
- Static security audit & secret leak detection
- Compact error filtering (max 10 significant lines) to protect AI agent context windows
"""

import sys
import os
import time
import subprocess
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone

# Configure Windows console encoding
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

def run_cmd(name: str, cmd_or_list: str | list[str], weight: int, timeout_sec: int = 180) -> dict:
    use_shell = isinstance(cmd_or_list, str)
    cmd_repr = " ".join(cmd_or_list) if isinstance(cmd_or_list, list) else cmd_or_list
    start_ts = time.perf_counter()
    try:
        res = subprocess.run(
            cmd_or_list,
            shell=use_shell,
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            encoding="utf-8",
            errors="replace"
        )
        duration_ms = int(round((time.perf_counter() - start_ts) * 1000))
        passed = res.returncode == 0
        error_output = ""
        if not passed:
            raw_err = (res.stderr.strip() or res.stdout.strip())
            lines = [l for l in raw_err.split("\n") if l.strip()]
            error_output = "\n".join(lines[-10:]) if len(lines) > 10 else "\n".join(lines)
        return {
            "step": name,
            "passed": passed,
            "score": weight if passed else 0,
            "max_score": weight,
            "duration_ms": duration_ms,
            "error_log": error_output.strip()
        }
    except subprocess.TimeoutExpired:
        duration_ms = int(round((time.perf_counter() - start_ts) * 1000))
        return {
            "step": name,
            "passed": False,
            "score": 0,
            "max_score": weight,
            "duration_ms": duration_ms,
            "error_log": f"Timeout exceeded ({timeout_sec}s) while executing: {cmd_repr}"
        }
    except Exception as e:
        duration_ms = int(round((time.perf_counter() - start_ts) * 1000))
        return {
            "step": name,
            "passed": False,
            "score": 0,
            "max_score": weight,
            "duration_ms": duration_ms,
            "error_log": str(e)
        }

def build_adaptive_checks(quick: bool) -> list[dict]:
    pm = detect_package_manager()
    py = sys.executable
    checks = []

    # 1. Typecheck (if TypeScript is configured)
    if (ROOT_DIR / "tsconfig.json").exists():
        checks.append({
            "name": "typecheck",
            "cmd": f"{pm} exec tsc --noEmit",
            "weight": 30 if quick else 25,
            "timeout": 120
        })

    # 2. Linter (if configured in package.json)
    has_lint_script = False
    pkg_json = ROOT_DIR / "package.json"
    if pkg_json.exists():
        try:
            with open(pkg_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                has_lint_script = "lint" in data.get("scripts", {})
        except Exception:
            pass

    if has_lint_script:
        checks.append({
            "name": "lint",
            "cmd": f"{pm} run lint",
            "weight": 30 if quick else 25,
            "timeout": 240
        })

    # 3. Database / ORM Validation (Optional & Adaptive)
    prisma_schema = ROOT_DIR / "prisma" / "schema.prisma"
    db_validator = ROOT_DIR / ".agents" / "skills" / "db_schema_validator.py"

    if prisma_schema.exists() and db_validator.exists():
        checks.append({
            "name": "prisma_hygiene",
            "cmd": [py, str(db_validator)],
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
            "cmd": [py, str(memory_engine), "--audit"],
            "weight": 15 if quick else 10,
            "timeout": 30
        })

    # 5. Static Security Audit (Secrets & .gitignore)
    sec_audit = ROOT_DIR / "evals" / "security_audit.py"
    if sec_audit.exists():
        checks.append({
            "name": "security_audit",
            "cmd": [py, str(sec_audit)],
            "weight": 15 if quick else 10,
            "timeout": 30
        })

    # 6. Production Build (Full mode only)
    if not quick and has_lint_script:
        pkg_has_build = False
        try:
            with open(pkg_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                pkg_has_build = "build" in data.get("scripts", {})
        except Exception:
            pass

        if pkg_has_build:
            checks.append({
                "name": "prod_build",
                "cmd": f"{pm} run build",
                "weight": 25,
                "timeout": 180
            })

    return checks

def main():
    parser = argparse.ArgumentParser(description="Adaptive & Agnostic RSI Deterministic Judge")
    parser.add_argument("--quick", "-q", action="store_true", help="Skip production build for fast reflexive loops")
    parser.add_argument("--no-telemetry", action="store_true", help="Skip automatic telemetry_hook invocation (used when orchestrated)")
    args = parser.parse_args()

    check_configs = build_adaptive_checks(args.quick)
    executed_checks = []
    eval_start_ts = time.perf_counter()

    for cfg in check_configs:
        res = run_cmd(cfg["name"], cfg["cmd"], weight=cfg["weight"], timeout_sec=cfg["timeout"])
        executed_checks.append(res)
        # Fast exit on critical syntax/typecheck errors
        if not res["passed"] and cfg["name"] in ["typecheck", "rsi_memory_hygiene", "security_audit"]:
            break

    total_duration_ms = int(round((time.perf_counter() - eval_start_ts) * 1000))
    total_score = 0
    max_score = sum(c["weight"] for c in check_configs)
    raw_score = sum(r["score"] for r in executed_checks)

    if max_score > 0:
        total_score = int((raw_score / max_score) * 100)
    else:
        total_score = 100

    failed_steps = [r for r in executed_checks if not r["passed"]]
    status = "PASS" if total_score == 100 and not failed_steps else "FAIL"

    trajectory = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "QUICK" if args.quick else "FULL",
        "total_score": total_score,
        "raw_score": raw_score,
        "max_score": max_score,
        "total_duration_ms": total_duration_ms,
        "status": status,
        "checks": executed_checks,
        "failed_steps": failed_steps,
        "summary": {r["step"]: ("PASSED" if r["passed"] else "FAILED") for r in executed_checks}
    }

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(trajectory, f, indent=2, ensure_ascii=False)

    # Optional Cognitive-RSI-Ops telemetry hook
    hook_script = ROOT_DIR / "evals" / "telemetry_hook.py"
    if hook_script.exists() and not args.no_telemetry:
        try:
            subprocess.run([sys.executable, str(hook_script)], cwd=str(ROOT_DIR), timeout=10, capture_output=True)
        except Exception:
            pass

    print(json.dumps(trajectory, indent=2, ensure_ascii=False))

    if status != "PASS":
        sys.exit(1)

if __name__ == "__main__":
    main()
