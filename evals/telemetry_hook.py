#!/usr/bin/env python3
"""
RSI Native Telemetry Hook (v2.1 Telemetry-Native & Zero-Estimation)
- Extracts real token counts, active LLM model, and tool actions from local IDE transcripts
- Records trajectory metrics into Cognitive-RSI-Ops CLI (when installed)
- Falls back autonomously to direct .agents/telemetry/cognitive_state.json updates when standalone
- Marks telemetry_source explicitly as LIVE_TRANSCRIPT vs ESTIMATED_FALLBACK
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Optional

# Windows console encoding safeguard
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

CURRENT_EVALS_DIR = Path(__file__).resolve().parent
if str(CURRENT_EVALS_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_EVALS_DIR))

ROOT_DIR = CURRENT_EVALS_DIR.parent
TASKS_PATH = ROOT_DIR / "docs" / "TASKS.md"
MODULES_DIR = ROOT_DIR / ".agents" / "rules" / "modules"
TRAJECTORY_LOG = ROOT_DIR / "evals" / "logs" / "trajectory_latest.json"
ACTIVE_SESSION_FILE = ROOT_DIR / ".agents" / "telemetry" / "active_session.json"
STATE_FILE = ROOT_DIR / ".agents" / "telemetry" / "cognitive_state.json"

FALLBACK_PRICING = {
    "gemini-3.8-flash": {"in": 0.00000015, "out": 0.0000006, "cache": 0.0000000375},
    "gemini-2.5-flash": {"in": 0.00000015, "out": 0.0000006, "cache": 0.0000000375},
    "gemini-4-argon": {"in": 0.00000125, "out": 0.000005, "cache": 0.0000003125},
    "gemini-2.5-pro": {"in": 0.00000125, "out": 0.000005, "cache": 0.0000003125},
    "claude-3-5-sonnet": {"in": 0.000003, "out": 0.000015, "cache": 0.0000003},
    "gpt-4o": {"in": 0.0000025, "out": 0.00001, "cache": 0.00000125},
}


def _parse_iso_utc(raw_ts: Optional[str]) -> Optional[datetime]:
    if not raw_ts or not isinstance(raw_ts, str):
        return None
    try:
        dt = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def find_active_task() -> tuple[str, str]:
    """Finds current active [-] task (or topmost closed [x] sprint task) in docs/TASKS.md."""
    if not TASKS_PATH.exists():
        return ("TASK-DEV-01", "General Milestone Execution")

    try:
        lines = TASKS_PATH.read_text(encoding="utf-8", errors="ignore").splitlines()
        active_re = re.compile(r"^-\s*\[-\]\s*\*\*`?(TASK-[A-Z0-9\-]+)`?\*{0,2}(?:\s*[-:]\s*(.*))?")
        closed_re = re.compile(r"^-\s*\[[xX]\]\s*\*\*`?(TASK-[A-Z0-9\-]+)`?\*{0,2}(?:\s*[-:]\s*(.*))?")
        in_sprint = False
        first_closed: Optional[tuple[str, str]] = None

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("## Active Sprint"):
                in_sprint = True
                continue
            if stripped.startswith("## ") and not stripped.startswith("## Active Sprint"):
                in_sprint = False
                continue

            m_act = active_re.match(stripped)
            if m_act:
                title = (m_act.group(2) or "").strip(" *:-")
                return (m_act.group(1), title or m_act.group(1))

            if in_sprint and first_closed is None:
                m_cls = closed_re.match(stripped)
                if m_cls:
                    title = (m_cls.group(2) or "").strip(" *:-")
                    first_closed = (m_cls.group(1), title or m_cls.group(1))

        if first_closed:
            return first_closed
    except Exception:
        pass
    return ("TASK-DEV-01", "General Milestone Execution")


def _normalize_model_label(raw_segment: str) -> str:
    clean = raw_segment.lower().strip()
    if "argon" in clean or "gemini 4" in clean or "gemini-4" in clean:
        return "gemini-4-argon"
    if "3.8" in clean:
        return "gemini-3.8-flash"
    if "2.5-pro" in clean or "pro" in clean:
        return "gemini-2.5-pro"
    if "2.5" in clean or "flash" in clean:
        return "gemini-2.5-flash" if "2.5" in clean else "gemini-3.8-flash"
    if "claude" in clean:
        return "claude-3-5-sonnet"
    if "gpt-4" in clean:
        return "gpt-4o"
    return clean


def _detect_model_from_events(events: list[dict]) -> Optional[str]:
    for ev in reversed(events):
        if ev.get("type") != "USER_INPUT":
            continue
        content = str(ev.get("content", ""))
        if "USER_SETTINGS_CHANGE" in content and "Model Selection" in content:
            block = content[content.find("USER_SETTINGS_CHANGE"):]
            idx_from = block.find(" from ")
            if idx_from != -1:
                idx_to = block.find(" to ", idx_from)
                if idx_to != -1:
                    end_idx = block.find(". No need", idx_to)
                    if end_idx == -1:
                        end_idx = block.find(".", idx_to + 4)
                    seg = block[idx_to + 4 : end_idx if end_idx != -1 else len(block)]
                    return _normalize_model_label(seg)
    return None


def _collect_candidate_transcripts() -> list[Path]:
    brain_dir = Path.home() / ".gemini" / "antigravity" / "brain"
    if not brain_dir.exists():
        return []

    by_conv: dict[str, Path] = {}
    for pattern in ("*/.system_generated/logs/transcript.jsonl", "*/.system_generated/logs/transcript_full.jsonl"):
        for p in brain_dir.glob(pattern):
            try:
                conv_id = p.parent.parent.parent.name
                existing = by_conv.get(conv_id)
                if existing is None or p.stat().st_mtime > existing.stat().st_mtime:
                    by_conv[conv_id] = p
            except Exception:
                continue

    ordered = sorted(by_conv.values(), key=lambda x: x.stat().st_mtime, reverse=True)
    proj_name = ROOT_DIR.name
    root_posix = str(ROOT_DIR).replace("\\", "/").lower()

    exact_matches: list[Path] = []
    name_matches: list[Path] = []
    for t_file in ordered[:10]:
        try:
            raw_lines = t_file.read_text(encoding="utf-8", errors="ignore").splitlines()
            if not raw_lines:
                continue
            sample_blob = "\n".join(raw_lines[:15] + raw_lines[-40:])
            sample_lower = sample_blob.replace("\\", "/").lower()
            if root_posix in sample_lower:
                exact_matches.append(t_file)
            elif proj_name in sample_blob:
                name_matches.append(t_file)
        except Exception:
            continue

    return exact_matches + name_matches


def detect_active_model() -> str:
    """Detects active LLM model from environment or local Antigravity transcript logs."""
    for env_key in ("AGENT_MODEL", "LLM_MODEL", "GEMINI_MODEL", "MODEL_NAME", "ANTIGRAVITY_MODEL"):
        val = os.environ.get(env_key)
        if val:
            return val.strip()

    for t_file in _collect_candidate_transcripts()[:3]:
        try:
            raw_lines = t_file.read_text(encoding="utf-8", errors="ignore").splitlines()
            events = []
            for ln in raw_lines:
                if "Model Selection" in ln:
                    try:
                        events.append(json.loads(ln))
                    except Exception:
                        pass
            found = _detect_model_from_events(events)
            if found:
                return found
        except Exception:
            continue

    return "gemini-3.8-flash"


def extract_real_session_metrics(since_iso: Optional[str] = None) -> Optional[dict]:
    """
    Extracts real prompt/cached/output tokens, tool counts, and active model from
    the most recent Antigravity session transcript matching this repository.
    Returns None when no live transcript data is accessible (e.g., CI/headless runner).
    """
    since_dt = _parse_iso_utc(since_iso)
    now_utc = datetime.now(timezone.utc)
    candidates = _collect_candidate_transcripts()

    for t_file in candidates[:5]:
        try:
            raw_lines = t_file.read_text(encoding="utf-8", errors="ignore").splitlines()
            if not raw_lines:
                continue

            parsed_events: list[dict] = []
            for ln in raw_lines:
                try:
                    ev = json.loads(ln)
                    if isinstance(ev, dict):
                        parsed_events.append(ev)
                except Exception:
                    continue

            if not parsed_events:
                continue

            selected: list[dict] = []
            if since_dt is not None:
                scoped = []
                for ev in parsed_events:
                    ev_dt = _parse_iso_utc(ev.get("created_at"))
                    if ev_dt is not None and ev_dt >= since_dt:
                        scoped.append(ev)
                has_tokens = any(
                    (ev.get("input_tokens") or ev.get("cache_read_tokens") or ev.get("output_tokens"))
                    for ev in scoped
                )
                if has_tokens:
                    selected = scoped

            if not selected:
                # Tight fallback when run immediately after --pulse before next turn flushes
                latest_token_dt = None
                for ev in reversed(parsed_events):
                    if ev.get("input_tokens") or ev.get("cache_read_tokens") or ev.get("output_tokens"):
                        latest_token_dt = _parse_iso_utc(ev.get("created_at"))
                        break
                if latest_token_dt is not None and abs((now_utc - latest_token_dt).total_seconds()) <= 900:
                    selected = parsed_events[-12:]
                else:
                    continue

            uncached_in_tok = 0
            cache_tok = 0
            out_tok = 0
            useful_calls = 0
            wasted_calls = 0

            for ev in selected:
                uncached_in_tok += int(ev.get("input_tokens") or 0)
                cache_tok += int(ev.get("cache_read_tokens") or 0)
                out_tok += int(ev.get("output_tokens") or 0)

                tcs = ev.get("tool_calls") or []
                if isinstance(tcs, list) and tcs:
                    for tc in tcs:
                        tc_err = isinstance(tc, dict) and tc.get("status") == "ERROR"
                        if ev.get("status") == "ERROR" or tc_err:
                            wasted_calls += 1
                        elif ev.get("status") == "DONE":
                            useful_calls += 1
                        else:
                            useful_calls += 1
                elif ev.get("status") == "ERROR" and ev.get("type") != "USER_INPUT":
                    wasted_calls += 1
                elif ev.get("type") == "GENERIC" and re.search(
                    r"Command exited with code [1-9]\d*", str(ev.get("content", ""))
                ):
                    wasted_calls += 1
                    useful_calls = max(0, useful_calls - 1)

            total_prompt = uncached_in_tok + cache_tok
            if total_prompt == 0 and out_tok == 0:
                continue

            detected_model = _detect_model_from_events(parsed_events) or detect_active_model()
            return {
                "telemetry_source": "LIVE_TRANSCRIPT",
                "conversation_id": t_file.parent.parent.parent.name,
                "model": detected_model,
                "prompt_tokens": total_prompt,
                "cached_tokens": cache_tok,
                "uncached_input_tokens": uncached_in_tok,
                "output_tokens": out_tok,
                "useful_actions": max(1, useful_calls),
                "wasted_actions": wasted_calls,
            }
        except Exception:
            continue

    return None


def _estimate_run_cost(model: str, prompt_tokens: int, output_tokens: int, cached_tokens: int) -> float:
    rates = FALLBACK_PRICING.get(model, FALLBACK_PRICING["gemini-3.8-flash"])
    uncached = max(0, prompt_tokens - cached_tokens)
    cost = (uncached * rates["in"]) + (cached_tokens * rates["cache"]) + (output_tokens * rates["out"])
    return round(cost, 6)


def _sync_standalone_rules(data: dict) -> None:
    if not MODULES_DIR.exists():
        return
    existing_map = {r["rule_id"]: r for r in data.get("active_rules_for_agents", []) if isinstance(r, dict) and "rule_id" in r}
    rule_re = re.compile(r"-\s*\[(R-[A-Z0-9\-]+)\]\s*(.*)")
    updated_rules = []
    idx = 0
    for mod_file in sorted(MODULES_DIR.glob("*.md")):
        category = mod_file.stem.upper().replace("_", "-")
        try:
            lines = mod_file.read_text(encoding="utf-8", errors="ignore").splitlines()
        except Exception:
            continue
        for line in lines:
            m = rule_re.match(line.strip())
            if not m:
                continue
            idx += 1
            rid = m.group(1)
            inst = m.group(2).strip()
            if rid in existing_map:
                entry = existing_map[rid]
                entry["instruction"] = inst
                entry["category"] = category
                entry["file"] = f".agents/rules/modules/{mod_file.name}"
                updated_rules.append(entry)
            else:
                updated_rules.append({
                    "rule_id": rid,
                    "category": category,
                    "instruction": inst,
                    "created_at_run": f"run_{idx:03d}",
                    "prevented_errors_count": 0,
                    "status": "PROVEN" if "security" in category.lower() else "PROBATION",
                    "file": f".agents/rules/modules/{mod_file.name}",
                })
    data["active_rules_for_agents"] = updated_rules


def _record_standalone_state(
    traj_data: dict,
    task_id: str,
    task_title: str,
    sprint_id: str,
    agent_name: str,
    model: str,
    attempts: int,
    duration_sec: float,
    useful_actions: int,
    wasted_actions: int,
    prompt_tokens: int,
    output_tokens: int,
    cached_tokens: int,
    injected_rules: list[str],
    telemetry_source: str,
) -> None:
    """Updates .agents/telemetry/cognitive_state.json autonomously when cognitive-rsi-ops is absent."""
    if STATE_FILE.exists():
        try:
            data = json.loads(STATE_FILE.read_text(encoding="utf-8", errors="ignore"))
        except Exception:
            data = {}
    else:
        data = {}

    if not isinstance(data, dict):
        data = {}

    meta = data.setdefault("project_meta", {})
    meta.setdefault("project_name", ROOT_DIR.name)
    meta.setdefault("playbook_version", "v1.0")
    meta["target_path"] = str(ROOT_DIR.resolve())
    meta["last_updated"] = datetime.now(timezone.utc).isoformat()

    _sync_standalone_rules(data)
    runs = data.setdefault("runs_history", [])
    run_num = len(runs) + 1
    eval_score = float(traj_data.get("total_score", 100))
    status = traj_data.get("status", "PASS")
    is_success = (status == "PASS" and eval_score >= 100)
    first_pass = (is_success and attempts == 1)

    steps = [
        {"step": 1, "type": "REASONING", "label": "Contextual rule resolution & repo mapping", "status": "OK", "ms": 450},
        {"step": 2, "type": "TOOL_CALL", "label": f"Execution of actions for {task_id}", "status": "OK", "ms": int(duration_sec * 600)},
    ]
    for idx, chk in enumerate(traj_data.get("checks", []), start=3):
        steps.append({
            "step": idx,
            "type": "EVALUATION",
            "label": f"Judge check {chk.get('step', 'check')}",
            "status": "OK" if chk.get("passed") else "FAIL",
            "ms": int(chk.get("duration_ms", 0)),
        })

    new_run = {
        "run_id": f"run_{run_num:03d}",
        "sprint_id": sprint_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "task_id": task_id,
        "task_title": task_title,
        "agent_name": agent_name,
        "model": model,
        "status": "SUCCESS" if is_success else "FAIL",
        "first_pass_success": first_pass,
        "attempts_count": attempts,
        "eval_score": eval_score,
        "duration_sec": duration_sec,
        "estimated_cost_usd": _estimate_run_cost(model, prompt_tokens, output_tokens, cached_tokens),
        "failure_category": "CLEAN_PASS" if is_success else "UNKNOWN_FAILURE",
        "telemetry_source": telemetry_source,
        "injected_rule_ids": injected_rules,
        "metrics": {
            "useful_actions": useful_actions,
            "wasted_actions": wasted_actions,
            "prompt_tokens": prompt_tokens,
            "reasoning_tokens": prompt_tokens,
            "output_tokens": output_tokens,
            "cached_tokens": cached_tokens,
        },
        "cognitive_steps": steps,
        "rsi_mutation_triggered": {
            "mutated": attempts > 1 and is_success,
            "rule_added": f"R-AUTO-{run_num:02d}" if (attempts > 1 and is_success) else None,
            "reason": f"Reflexive fix on {task_id}" if (attempts > 1 and is_success) else None,
        },
    }
    if traj_data.get("scope_report") is not None:
        new_run["scope_report"] = traj_data["scope_report"]
    runs.append(new_run)

    # Credit prevented_errors_count on injected rules when evaluation passed
    if is_success and injected_rules:
        inj_set = {r.strip().upper() for r in injected_rules if r.strip()}
        for rule_entry in data.get("active_rules_for_agents", []):
            if str(rule_entry.get("rule_id", "")).upper() in inj_set:
                rule_entry["prevented_errors_count"] = int(rule_entry.get("prevented_errors_count", 0)) + 1

    # Recompute summary KPIs
    total_runs = len(runs)
    fp_ok = sum(1 for r in runs if r.get("first_pass_success") is True)
    t_useful = sum(int(r.get("metrics", {}).get("useful_actions", 0)) for r in runs)
    t_wasted = sum(int(r.get("metrics", {}).get("wasted_actions", 0)) for r in runs)
    t_actions = t_useful + t_wasted
    t_prompt = sum(int(r.get("metrics", {}).get("prompt_tokens", r.get("metrics", {}).get("reasoning_tokens", 0))) for r in runs)
    t_output = sum(int(r.get("metrics", {}).get("output_tokens", 0)) for r in runs)
    t_cached = sum(int(r.get("metrics", {}).get("cached_tokens", 0)) for r in runs)
    t_cost = sum(float(r.get("estimated_cost_usd", 0.0)) for r in runs)
    t_dur = sum(float(r.get("duration_sec", 0.0)) for r in runs)

    data["summary_kpis"] = {
        "first_pass_yield_pct": round((fp_ok / max(1, total_runs)) * 100.0, 1),
        "action_efficiency_ratio": round((t_useful / max(1, t_actions)) * 100.0, 1) if t_actions else 100.0,
        "cognitive_friction_index": round(t_wasted / max(1, t_actions), 2) if t_actions else 0.0,
        "total_runs": total_runs,
        "total_mutations_applied": len(data.get("active_rules_for_agents", [])),
        "avg_duration_sec": round(t_dur / max(1, total_runs), 1),
        "total_reasoning_tokens": t_prompt,
        "total_output_tokens": t_output,
        "total_prompt_tokens": t_prompt,
        "total_cached_tokens": t_cached,
        "cache_hit_ratio_pct": round((t_cached / max(1, t_prompt)) * 100.0, 1),
        "total_estimated_cost_usd": round(t_cost, 4),
        "failure_taxonomy": {},
    }

    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = STATE_FILE.with_suffix(".tmp")
    tmp_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp_path, STATE_FILE)
    print(f"[OK] [RSI Telemetry] Recorded run_{run_num:03d} ({telemetry_source}) into {STATE_FILE}")


def record_latest_eval(attempts: int = 1, agent_name: str = "antigravity-agent", model: Optional[str] = None) -> None:
    """Reads trajectory_latest.json + active_session.json + live transcript and persists cognitive telemetry."""
    if not TRAJECTORY_LOG.exists():
        return

    try:
        traj_data = json.loads(TRAJECTORY_LOG.read_text(encoding="utf-8", errors="replace"))
    except Exception as e:
        print(f"[WARN] Telemetry hook could not read trajectory log: {e}")
        return

    active_session = {}
    if ACTIVE_SESSION_FILE.exists():
        try:
            active_session = json.loads(ACTIVE_SESSION_FILE.read_text(encoding="utf-8", errors="ignore"))
        except Exception:
            active_session = {}

    fallback_tid, fallback_title = find_active_task()
    task_id = traj_data.get("task_id") or active_session.get("task_id") or fallback_tid
    task_title = traj_data.get("task_title") or active_session.get("task_title") or fallback_title
    sprint_id = traj_data.get("sprint_id") or active_session.get("sprint_id") or "SPRINT-01"

    injected_rules = traj_data.get("injected_rule_ids") or active_session.get("injected_rule_ids") or []
    scope_report = traj_data.get("scope_report")
    scope_drift_count = len(scope_report.get("out_of_scope_files", [])) if isinstance(scope_report, dict) else 0

    duration_sec = float(
        traj_data.get("task_elapsed_sec")
        or round(float(traj_data.get("total_duration_ms", 12000)) / 1000.0, 2)
    )

    real_metrics = extract_real_session_metrics(active_session.get("session_started_at"))
    if real_metrics is not None:
        telemetry_source = "LIVE_TRANSCRIPT"
        prompt_tokens = real_metrics["prompt_tokens"]
        cached_tokens = real_metrics["cached_tokens"]
        output_tokens = real_metrics["output_tokens"]
        useful_actions = real_metrics["useful_actions"]
        wasted_actions = real_metrics["wasted_actions"] + scope_drift_count
        active_model = model or real_metrics["model"]
    else:
        telemetry_source = "ESTIMATED_FALLBACK"
        prompt_tokens = 1200
        cached_tokens = 0
        output_tokens = 600
        useful_actions = max(1, len(traj_data.get("checks", [])) or 4)
        wasted_actions = len(traj_data.get("failed_steps", [])) + scope_drift_count
        active_model = model or detect_active_model()

    # Check if cognitive-rsi-ops cli is accessible
    cli_path = ROOT_DIR / "cli.py"
    if not cli_path.exists():
        for cand in [ROOT_DIR.parent / "cognitive-rsi-ops" / "cli.py", Path.home() / "cognitive-rsi-ops" / "cli.py"]:
            if cand.exists():
                cli_path = cand
                break

    if cli_path.exists():
        cmd = [
            sys.executable,
            str(cli_path),
            "record",
            "--target", str(ROOT_DIR),
            "--trajectory", str(TRAJECTORY_LOG),
            "--task-id", task_id,
            "--task-title", task_title,
            "--sprint-id", sprint_id,
            "--agent-name", agent_name,
            "--model", active_model,
            "--attempts", str(attempts),
            "--duration", str(duration_sec),
            "--useful", str(useful_actions),
            "--wasted", str(wasted_actions),
            "--prompt-tokens", str(prompt_tokens),
            "--output-tokens", str(output_tokens),
            "--cached-tokens", str(cached_tokens),
            "--source", telemetry_source,
        ]
        if injected_rules:
            cmd.extend(["--injected-rules", ",".join(str(r) for r in injected_rules)])

        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if res.returncode == 0:
            print(f"[OK] [Cognitive-Ops] Recorded telemetry ({telemetry_source}, scope_drift={scope_drift_count}) into {STATE_FILE}")
            return
        print(f"[WARN] [Cognitive-Ops] CLI fallback triggered (rc={res.returncode}): {res.stderr.strip()[:120]}")

    _record_standalone_state(
        traj_data=traj_data,
        task_id=task_id,
        task_title=task_title,
        sprint_id=sprint_id,
        agent_name=agent_name,
        model=active_model,
        attempts=attempts,
        duration_sec=duration_sec,
        useful_actions=useful_actions,
        wasted_actions=wasted_actions,
        prompt_tokens=prompt_tokens,
        output_tokens=output_tokens,
        cached_tokens=cached_tokens,
        injected_rules=[str(r) for r in injected_rules],
        telemetry_source=telemetry_source,
    )


if __name__ == "__main__":
    record_latest_eval()
