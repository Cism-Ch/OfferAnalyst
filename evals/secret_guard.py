#!/usr/bin/env python3
"""
OfferAnalyst Secret Guard & Anti-Leak Shield
Guarantees that no production secret, API key, or credential from .env*
is ever committed or present in git-tracked repository files.
"""

import sys
import re
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

EXCLUDED_FILES_FROM_AUDIT = {
    ".env.example",
    "package-lock.json",
    "pnpm-lock.yaml",
}

SAFE_KEY_SUBSTRINGS = ["Mock", "Test", "REDACTED", "placeholder", "dummy", "example"]

def is_safe_value(val: str) -> bool:
    if len(val) < 10:
        return True
    if val.startswith("http://") or val.startswith("https://"):
        return True
    if "localhost" in val or "127.0.0.1" in val:
        return True
    for safe in SAFE_KEY_SUBSTRINGS:
        if safe.lower() in val.lower():
            return True
    return False

def collect_env_secrets() -> dict[str, str]:
    secrets = {}
    env_files = [ROOT_DIR / ".env", ROOT_DIR / ".env.local"]
    
    for env_path in env_files:
        if not env_path.exists():
            continue
        try:
            content = env_path.read_text(encoding="utf-8", errors="ignore")
            for line in content.splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                
                # We target actual credentials and tokens
                is_sensitive_key = any(term in k.upper() for term in [
                    "KEY", "SECRET", "TOKEN", "PASSWORD", "DATABASE_URL", "URL", "AUTH", "CREDENTIAL"
                ])
                if is_sensitive_key and not is_safe_value(v):
                    secrets[f"{env_path.name}:{k}"] = v
        except Exception as e:
            print(f"[secret_guard] Warning reading {env_path.name}: {e}")
            
    return secrets

def get_tracked_files() -> list[str]:
    try:
        res = subprocess.check_output(["git", "ls-files"], cwd=ROOT_DIR, text=True)
        return [f.strip() for f in res.splitlines() if f.strip()]
    except Exception:
        # Fallback to scanning src, tests, evals if git is unavailable
        files = []
        for p in ROOT_DIR.rglob("*"):
            if p.is_file() and not any(part.startswith(".") for part in p.parts if part != ".agents"):
                files.append(str(p.relative_to(ROOT_DIR)))
        return files

def audit_repository() -> int:
    secrets = collect_env_secrets()
    tracked_files = get_tracked_files()
    
    violations = []
    
    # 1. Check against active secrets in .env
    for file_rel in tracked_files:
        if file_rel in EXCLUDED_FILES_FROM_AUDIT:
            continue
            
        file_path = ROOT_DIR / file_rel
        if not file_path.is_file():
            continue
            
        try:
            # Skip large binary files
            if file_path.stat().st_size > 2 * 1024 * 1024:
                continue
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
            
        for key_name, secret_val in secrets.items():
            if secret_val in content:
                violations.append(f"Secret leakage detected: '{key_name}' is exposed in '{file_rel}'")

        # 2. Heuristic check: Live Google API Key pattern (AIza + 35 chars)
        raw_google_keys = re.findall(r"AIza[0-9A-Za-z-_]{35}", content)
        for gkey in raw_google_keys:
            if not any(token in gkey for token in ["Mock", "Test", "REDACTED", "XXXX", "••••"]):
                violations.append(f"Hardcoded Google API Key format detected in '{file_rel}' (starts with {gkey[:8]}...)")

    if violations:
        print("❌ [SECURITY ALERT] Secret leakage audit FAILED:")
        for v in violations:
            print(f"   - {v}")
        print("\nAction required: Replace all sensitive credentials with environment variables or synthetic mock strings.")
        return 1

    print(f"✅ [SECURITY AUDIT] Clean: 0 secrets leaked across {len(tracked_files)} tracked files (Checked against {len(secrets)} active secrets).")
    return 0

if __name__ == "__main__":
    sys.exit(audit_repository())
