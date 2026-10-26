#!/usr/bin/env python3
"""
Orchestrateur de Cycle RSI & Git Guardrail pour OfferAnalyst
Supervise l'exécution du protocole d'amélioration récursive :
- Vérifie la conformité des règles (Playbook <= 150 lignes, System Core intact)
- Enregistre et analyse les trajectoires d'échec / succès
- Fournit un guardrail déterministe pour les agents IA
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
PLAYBOOK_PATH = ROOT_DIR / ".agents" / "rules" / "fullstack_playbook.md"
SYSTEM_CORE_PATH = ROOT_DIR / ".agents" / "rules" / "system_core.md"
LOG_PATH = ROOT_DIR / "evals" / "logs" / "trajectory_latest.json"
HISTORY_PATH = ROOT_DIR / "evals" / "logs" / "trajectory_history.jsonl"
EVAL_SCRIPT = ROOT_DIR / "evals" / "run_fullstack_eval.py"

MAX_PLAYBOOK_LINES = 150

def check_guardrails() -> dict:
    issues = []
    
    # 1. Vérifier existence de system_core.md
    if not SYSTEM_CORE_PATH.exists():
        issues.append(f"Fichier critique manquant : {SYSTEM_CORE_PATH}")

    # 2. Vérifier existence et taille de fullstack_playbook.md
    if not PLAYBOOK_PATH.exists():
        issues.append(f"Playbook manquant : {PLAYBOOK_PATH}")
    else:
        lines = PLAYBOOK_PATH.read_text(encoding="utf-8").splitlines()
        line_count = len(lines)
        if line_count > MAX_PLAYBOOK_LINES:
            issues.append(
                f"Contrainte de taille violée : fullstack_playbook.md fait {line_count} lignes (maximum autorisé : {MAX_PLAYBOOK_LINES}). Compaction requise !"
            )

    return {
        "passed": len(issues) == 0,
        "playbook_line_count": len(PLAYBOOK_PATH.read_text(encoding="utf-8").splitlines()) if PLAYBOOK_PATH.exists() else 0,
        "max_allowed": MAX_PLAYBOOK_LINES,
        "issues": issues
    }

def run_eval(quick: bool = False) -> dict:
    is_windows = os.name == "nt"
    python_executable = sys.executable
    cmd = f'"{python_executable}" "{EVAL_SCRIPT}"' + (" --quick" if quick else "")
    res = subprocess.run(
        cmd,
        shell=True if is_windows else False,
        cwd=str(ROOT_DIR),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    try:
        report = json.loads(res.stdout) if res.stdout.strip() else {}
    except Exception:
        report = {"status": "FAIL", "total_score": 0, "raw_output": res.stdout, "stderr": res.stderr}
    return report

def get_git_status() -> dict:
    try:
        status_res = subprocess.run(["git", "--no-pager", "status", "--short"], cwd=str(ROOT_DIR), capture_output=True, text=True, timeout=15)
        diff_stat = subprocess.run(["git", "--no-pager", "diff", "--stat"], cwd=str(ROOT_DIR), capture_output=True, text=True, timeout=15)
        return {
            "modified_files": [l.strip() for l in status_res.stdout.splitlines() if l.strip()],
            "diff_stat": diff_stat.stdout.strip()
        }
    except Exception:
        return {"modified_files": [], "diff_stat": ""}

def record_trajectory(report: dict, attempt: int, note: str = ""):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "attempt": attempt,
        "note": note,
        "eval_report": report,
        "git": get_git_status(),
        "guardrail": check_guardrails()
    }
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def main():
    parser = argparse.ArgumentParser(description="Orchestrateur RSI OfferAnalyst")
    parser.add_argument("--eval", action="store_true", help="Lancer l'évaluation et enregistrer la trajectoire")
    parser.add_argument("--quick", "-q", action="store_true", help="Mode rapide sans build Next.js")
    parser.add_argument("--guardrail", action="store_true", help="Vérifier uniquement les contraintes architecturales (playbook <= 150 lignes)")
    parser.add_argument("--attempt", type=int, default=1, help="Numéro de tentative courante (1, 2 ou 3)")
    args = parser.parse_args()

    # Si vérification des guardrails uniquement
    if args.guardrail:
        gr = check_guardrails()
        print(json.dumps(gr, indent=2, ensure_ascii=False))
        sys.exit(0 if gr["passed"] else 1)

    # Exécution standard ou évaluation
    gr = check_guardrails()
    if not gr["passed"]:
        print(f"❌ [RSI GUARDRAIL VIOLATION] : {gr['issues']}", file=sys.stderr)
        sys.exit(1)

    print(f"🚀 [RSI ORCHESTRATOR] Démarrage de l'évaluation (Tentative #{args.attempt}, Mode: {'QUICK' if args.quick else 'FULL'})...")
    eval_result = run_eval(quick=args.quick)
    record_trajectory(eval_result, attempt=args.attempt)

    score = eval_result.get("total_score", 0)
    print(f"\n📊 Résultat : Score={score}/100 | Statut={eval_result.get('status')}")

    if score == 100:
        if args.attempt == 1:
            print("✨ SUCCÈS DÈS LA TENTATIVE 1 : Le playbook actuel a suffi. Aucune méta-mutation nécessaire.")
        else:
            print("⚠️ SUCCÈS APRÈS RÉFLEXION : Mutation requise ! Exécutez le rôle Méta-Optimiseur pour enrichir le playbook.")
        sys.exit(0)
    else:
        print(f"❌ ÉCHEC À LA TENTATIVE #{args.attempt} : Consultez evals/logs/trajectory_latest.json pour les détails.")
        for failed in eval_result.get("failed_steps", []):
            print(f"   - Étape en échec : {failed.get('step')}")
            print(f"     Erreur : {failed.get('error_log')[:300]}...")
        sys.exit(1)

if __name__ == "__main__":
    main()
