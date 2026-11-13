#!/usr/bin/env python3
"""
Static Security Audit & Secret Leak Detector
- Checks for hardcoded API keys, tokens, private certificates, and secrets
- Validates .gitignore airtightness (.env*, private keys, caches)
- Enforces strict ASCII & Emoji Hygiene to prevent terminal/encoding crashes
- Inspects permissions and conformance to RSI security guardrails
"""

import sys
import re
import os
from pathlib import Path

# Fix Windows console UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent

SECRET_PATTERNS = [
    (re.compile(r'-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'), "Private Key (RSA/EC/SSH)"),
    (re.compile(r'sk-[a-zA-Z0-9]{20,}'), "Secret Key (OpenAI/Stripe style)"),
    (re.compile(r'AKIA[0-9A-Z]{16}'), "AWS Access Key ID"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36}'), "GitHub Personal Access Token"),
    (re.compile(r'xox[baprs]-[0-9a-zA-Z]{10,48}'), "Slack API Token"),
    (re.compile(r'(?:postgres|postgresql|mysql|mongodb\+srv):\/\/[^\s:]+:[^\s@]+@[^\s\/]+'), "Database URI with hardcoded password"),
    (re.compile(r'(?i)(?:api_key|secret_key|private_key|auth_token)\s*=\s*["\'][a-zA-Z0-9_\-\.]{16,}["\']'), "Hardcoded Auth Secret")
]

IGNORE_DIRS = {
    '.git', 'node_modules', '__pycache__', '.venv', 'venv',
    'dist', 'build', '.next', 'playwright-report', 'test-results',
    '.playwright-mcp', 'backups', '.vercel'
}
BINARY_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.zip', '.tar', '.gz',
    '.pdf', '.pyc', '.exe', '.dll', '.so', '.dylib', '.db', '.sqlite'
}

def _iter_project_files():
    """Walks ROOT_DIR while pruning IGNORE_DIRS early for fast traversal."""
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        root_path = Path(root)
        for name in files:
            yield root_path / name

def audit_gitignore() -> list[str]:
    issues = []
    gitignore = ROOT_DIR / ".gitignore"
    if not gitignore.exists():
        issues.append("Missing .gitignore file!")
        return issues

    content = gitignore.read_text(encoding="utf-8", errors="replace")
    essential_rules = [".env", "*.pem", "*.key", "node_modules"]
    for rule in essential_rules:
        if rule not in content:
            issues.append(f"Missing essential security rule in .gitignore: '{rule}'")
    return issues

PLACEHOLDER_MARKERS = (
    "your_password", "your-key-here", "<user>", "<password>", "<username>",
    "[votre-", "user:pass", "username:password", "%s:%s", "example.com"
)

def audit_secrets() -> list[dict]:
    findings = []
    for path in _iter_project_files():
        # Skip local gitignored .env files, lockfiles, and this audit script
        if path.name in {"security_audit.py", "pnpm-lock.yaml", "package-lock.json", ".env.example"}:
            continue
        if path.name == ".env" or path.name.startswith(".env."):
            continue
        if path.suffix.lower() in BINARY_EXTENSIONS:
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
            for idx, line in enumerate(lines, start=1):
                lower_line = line.lower()
                if any(marker in lower_line for marker in PLACEHOLDER_MARKERS):
                    continue
                for pattern, label in SECRET_PATTERNS:
                    if pattern.search(line):
                        findings.append({
                            "file": str(path.relative_to(ROOT_DIR)),
                            "line": idx,
                            "type": label,
                            "sample": line.strip()[:60]
                        })
        except Exception as e:
            findings.append({
                "file": str(path.relative_to(ROOT_DIR)),
                "line": 0,
                "type": "Read Error",
                "sample": str(e)
            })
    return findings

def audit_ascii_hygiene() -> list[dict]:
    """Ensures that eval Python scripts are 100% pure ASCII to prevent Windows cp1252 console crashes."""
    violations = []
    check_patterns = ["evals/**/*.py"]
    scanned_files = set()

    for pat in check_patterns:
        for path in ROOT_DIR.glob(pat):
            if path.is_file() and path not in scanned_files:
                if any(part in IGNORE_DIRS for part in path.parts):
                    continue
                scanned_files.add(path)
                try:
                    content = path.read_text(encoding="utf-8", errors="ignore")
                    for idx, line in enumerate(content.splitlines(), start=1):
                        non_ascii_chars = [ch for ch in line if ord(ch) > 127]
                        if non_ascii_chars:
                            violations.append({
                                "file": str(path.relative_to(ROOT_DIR)),
                                "line": idx,
                                "type": "Non-ASCII / Emoji Character",
                                "sample": line.strip()[:60]
                            })
                except Exception as e:
                    violations.append({
                        "file": str(path.relative_to(ROOT_DIR)),
                        "line": 0,
                        "type": "Read Error",
                        "sample": str(e)
                    })
    return violations

OPERATIONAL_ANTI_PATTERNS = [
    (
        re.compile(r'(?:NEXT_PUBLIC_|VITE_|PUBLIC_|REACT_APP_)[A-Z0-9_]*(?:SECRET|PRIVATE_KEY|SERVICE_ROLE|DATABASE_URL)'),
        "Public Frontend Secret Exposure ([R-PAT-04])"
    ),
    (
        re.compile(r'new\s+PrismaClient\s*\('),
        "Non-Singleton PrismaClient Instantiation ([R-DB-02] / [R-PAT-04])"
    ),
    (
        re.compile(r'\b(?:eval|new\s+Function)\s*\('),
        "Unsafe Dynamic Code Execution ([R-PAT-04])"
    )
]

SINGLETON_ALLOWED_FILES = {"db.ts", "db.js", "prisma.ts", "prisma.js", "client.ts", "client.js"}
APP_CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"}

def audit_operational_patterns() -> list[dict]:
    """Detects operational security anti-patterns (public secret vars, non-singleton DB clients, dynamic eval)."""
    violations = []
    for path in _iter_project_files():
        # Skip RSI harness, skills/validators, standalone CLI scripts, and test files
        if any(part in {"evals", ".agents", "scripts", "tests"} for part in path.parts):
            continue
        is_env = path.name.startswith(".env")
        if path.suffix not in APP_CODE_EXTENSIONS and not is_env:
            continue

        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
            for idx, line in enumerate(lines, start=1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("#"):
                    continue
                for pattern, label in OPERATIONAL_ANTI_PATTERNS:
                    if "PrismaClient" in label and path.name in SINGLETON_ALLOWED_FILES:
                        continue
                    if pattern.search(line):
                        violations.append({
                            "file": str(path.relative_to(ROOT_DIR)),
                            "line": idx,
                            "type": label,
                            "sample": stripped[:60]
                        })
        except Exception as e:
            violations.append({
                "file": str(path.relative_to(ROOT_DIR)),
                "line": 0,
                "type": "Read Error",
                "sample": str(e)
            })
    return violations

def run_security_audit() -> bool:
    print("[RSI Security Audit] Running static security, secret leak, operational pattern, and ASCII guard audit...")
    gitignore_issues = audit_gitignore()
    secret_findings = audit_secrets()
    ascii_violations = audit_ascii_hygiene()
    operational_violations = audit_operational_patterns()

    success = True
    if gitignore_issues:
        print("\n[FAIL] .gitignore configuration vulnerabilities:")
        for issue in gitignore_issues:
            print(f"  - {issue}")
        success = False
    else:
        print("  [OK] .gitignore configuration is airtight and compliant.")

    if secret_findings:
        print(f"\n[FAIL] {len(secret_findings)} potential secret leak(s) detected:")
        for finding in secret_findings:
            print(f"  - [{finding['type']}] {finding['file']}:{finding['line']} -> {finding['sample']}")
        success = False
    else:
        print("  [OK] No exposed secrets, private keys, or credentials found.")

    if operational_violations:
        print(f"\n[FAIL] {len(operational_violations)} operational anti-pattern(s) detected:")
        for ov in operational_violations:
            print(f"  - [{ov['type']}] {ov['file']}:{ov['line']} -> {ov['sample']}")
        success = False
    else:
        print("  [OK] Operational Pattern Guard: 0 runtime anti-patterns found.")

    if ascii_violations:
        print(f"\n[FAIL] {len(ascii_violations)} non-ASCII / emoji violation(s) detected:")
        for v in ascii_violations:
            print(f"  - [{v['type']}] {v['file']}:{v['line']} -> {v['sample']}")
        success = False
    else:
        print("  [OK] Pure ASCII & Emoji Hygiene: 0 non-ASCII or emoji characters found.")

    # Check for real uncommitted .env files
    env_files = list(ROOT_DIR.glob(".env*"))
    real_envs = [f.name for f in env_files if f.name != ".env.example"]
    if real_envs:
        print(f"  [INFO] Local .env files present: {real_envs} (must stay ignored by git)")
    else:
        print("  [OK] No unencrypted plaintext .env files in directory.")

    if success:
        print("\n[SUCCESS] SECURITY & HYGIENE AUDIT: PASSED (0 issues detected)")
    else:
        print("\n[FAIL] SECURITY & HYGIENE AUDIT: FAILED")

    return success

if __name__ == "__main__":
    passed = run_security_audit()
    sys.exit(0 if passed else 1)
