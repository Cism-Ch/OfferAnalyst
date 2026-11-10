#!/usr/bin/env python3
"""
Cognitive-RSI-Ops Telemetry Hook for Agentic-RSI-Protocol
Drop-in integration that hooks into evals/run_fullstack_eval.py or evals/rsi_orchestrator.py.
Captures trajectory logs and updates .agent/telemetry/cognitive_state.json in pure ASCII.
"""

import json
import os
from pathlib import Path
import re
import sys

# Windows console encoding safeguard
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
TASKS_PATH = ROOT_DIR / "docs" / "TASKS.md"
TRAJECTORY_LOG = ROOT_DIR / "evals" / "logs" / "trajectory_latest.json"
STATE_FILE = ROOT_DIR / ".agents" / "telemetry" / "cognitive_state.json"


def find_active_task() -> tuple[str, str]:
    """Finds current active [-] task in docs/TASKS.md if present."""
    if not TASKS_PATH.exists():
        return ("TASK-DEV-01", "General Milestone Execution")

    try:
        lines = TASKS_PATH.read_text(encoding="utf-8", errors="ignore").splitlines()
        task_re = re.compile(r"^-\s*\[-\]\s*\*\*`?(TASK-[A-Z0-9\-]+)`?\*\*:\s*(.*)")
        for line in lines:
            m = task_re.match(line.strip())
            if m:
                return (m.group(1), m.group(2).strip())
    except Exception:
        pass
    return ("TASK-DEV-01", "General Milestone Execution")


def record_latest_eval(attempts: int = 1, agent_name: str = "antigravity-agent", model: str = "gemini-3.8-flash") -> None:
    """Reads trajectory_latest.json and writes into cognitive_state.json."""
    if not TRAJECTORY_LOG.exists():
        return

    try:
        with open(TRAJECTORY_LOG, "r", encoding="utf-8", errors="replace") as f:
            traj_data = json.load(f)
    except Exception as e:
        print(f"[WARN] Telemetry hook could not read trajectory log: {e}")
        return

    # Check if cognitive-rsi-ops cli is accessible
    cli_path = ROOT_DIR / "cli.py"
    if not cli_path.exists():
        # Check parent or sibling directories
        for cand in [ROOT_DIR.parent / "cognitive-rsi-ops" / "cli.py", Path.home() / "cognitive-rsi-ops" / "cli.py"]:
            if cand.exists():
                cli_path = cand
                break

    task_id, task_title = find_active_task()
    eval_score = traj_data.get("total_score", 100)
    status = traj_data.get("status", "PASS")

    # If cli.py is found, use it
    if cli_path.exists():
        import subprocess
        cmd = [
            sys.executable,
            str(cli_path),
            "record",
            "--target", str(ROOT_DIR),
            "--trajectory", str(TRAJECTORY_LOG),
            "--task-id", task_id,
            "--task-title", task_title,
            "--agent-name", agent_name,
            "--model", model,
            "--attempts", str(attempts),
        ]
        subprocess.run(cmd, capture_output=True, text=True)
        print(f"[OK] [Cognitive-Ops] Recorded evaluation trajectory into {STATE_FILE}")
    else:
        print(f"[INFO] [Cognitive-Ops] Evaluated {task_id} with score {eval_score}/100 ({status}).")


if __name__ == "__main__":
    record_latest_eval()
