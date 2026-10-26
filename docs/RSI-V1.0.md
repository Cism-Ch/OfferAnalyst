# Architecture Technique : Protocole RSI (Recursive Self-Improvement) Fullstack sur Antigravity

## 1. Arborescence du Système dans le Projet

```text
mon-projet-fullstack/
├── .agents/
│   ├── rules/
│   │   ├── system_core.md            # Règles immuables (Stack, Sécurité, Conventions)
│   │   └── fullstack_playbook.md     # RÈGLES ÉVOLUTIVES (Modifiées par le Méta-Agent)
│   ├── prompts/
│   │   ├── worker_fullstack.md       # Prompt de l'Agent Développeur Fullstack
│   │   └── meta_optimizer.md         # Prompt du Méta-Agent Optimiseur (RSI)
│   ├── skills/                       # Outils & scripts auto-générés par l'agent (Niveau 3)
│   │   └── db_schema_validator.py
│   └── workflows/
│       └── rsi-feature.md            # Slash command (/rsi-feature) pour Antigravity
├── evals/
│   ├── run_fullstack_eval.py         # Juge déterministe (Types + Build + API + E2E)
│   ├── rsi_orchestrator.py           # Gestionnaire du cycle RSI et du Git Guardrail
│   └── logs/
│       └── trajectory_latest.json    # Trace de la dernière exécution (Essais & Erreurs)
└── src/                              # Code source de l'application Fullstack
```

---

## 2. Configuration des Fichiers Mémoire et Prompts (`.agents/`)

### 2.1. Le Playbook Évolutif (`.agents/rules/fullstack_playbook.md`)
Ce fichier contient les leçons apprises par l'agent sur votre stack. Il démarre presque vide et s'enrichit automatiquement après chaque bug résolu.

```markdown
# Fullstack Playbook (Mémoire Évolutive RSI)
> CONTRAINTE STRICTE : Maximum 150 lignes. Chaque règle doit être atomique, actionnable et liée à une couche précise.

## [DATABASE & ORM]
- [R-DB-01] Toujours générer et vérifier la migration après chaque modification du schéma avant de toucher aux routes API.

## [BACKEND & API]
- [R-API-01] Valider systématiquement le body et les query params avec un schéma strict (Zod/Pydantic) et retourner des codes HTTP explicites (400, 401, 404, 500).

## [FRONTEND & UI]
- [R-UI-01] Gérer explicitement les 3 états asynchrones sur chaque composant connecté : `isLoading`, `isError`, et `EmptyState`.

## [INTEGRATION & TYPES]
- [R-INT-01] Ne jamais utiliser `any`. Importer les types de réponse directement depuis les schémas partagés ou le client généré.
```

### 2.2. Prompt du Méta-Agent Optimiseur (`.agents/prompts/meta_optimizer.md`)

```markdown
# Rôle : Méta-Agent Optimiseur RSI (Fullstack)

Tu es l'architecte méta-cognitif du système. Tu n'écris pas le code métier de la fonctionnalité actuelle : tu analyses POURQUOI l'Agent Worker a échoué lors de sa première tentative afin qu'il ne reproduise plus jamais cette erreur sur ce projet.

## Entrées à analyser
1. `evals/logs/trajectory_latest.json` : Contient l'erreur exacte de la Tentative 1 et le diff qui a permis de réparer le bug en Tentative 2 ou 3.
2. `.agents/rules/fullstack_playbook.md` : Les règles actuelles de l'agent.

## Procédure de Mutation
1. **Diagnostic Causal :** Identifie si l'erreur provient de la DB, du Backend, du Frontend ou du Typage partagé.
2. **Abstraction :** Transforme le bug spécifique en une règle préventive générale d'une à deux lignes maximum.
3. **Vérification de non-redondance :** Si une règle similaire existe déjà dans `fullstack_playbook.md`, reformule-la pour la rendre plus stricte au lieu d'en créer une nouvelle.
4. **Compaction (Anti-Bloat) :** Si `fullstack_playbook.md` dépasse 140 lignes, fusionne les règles les plus proches avant d'insérer la nouvelle règle.
5. **Application :** Édite `.agents/rules/fullstack_playbook.md` avec la nouvelle règle numérotée.
```

---

## 3. Le Juge Déterministe (`evals/run_fullstack_eval.py`)

Ce script remplace le jugement subjectif du LLM par des vérifications binaires sur l'application Fullstack :

```python
import subprocess
import json
import sys
from pathlib import Path

LOG_PATH = Path("evals/logs/trajectory_latest.json")

def run_cmd(name: str, cmd: list[str], weight: int) -> dict:
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        passed = res.returncode == 0
        return {
            "step": name,
            "passed": passed,
            "score": weight if passed else 0,
            "max_score": weight,
            "error_log": "" if passed else (res.stderr or res.stdout)[-1500:]
        }
    except Exception as e:
        return {"step": name, "passed": False, "score": 0, "max_score": weight, "error_log": str(e)}

def main():
    checks = [
        # 1. Vérification du typage statique (Frontend + Backend)
        run_cmd("typecheck", ["npx", "tsc", "--noEmit"], weight=30),
        # 2. Vérification du Linter
        run_cmd("lint", ["npm", "run", "lint"], weight=15),
        # 3. Tests Unitaires & API
        run_cmd("api_tests", ["npm", "run", "test:ci"], weight=30),
        # 4. Build de production complet
        run_cmd("prod_build", ["npm", "run", "build"], weight=25),
    ]

    total_score = sum(c["score"] for c in checks)
    failed_steps = [c for c in checks if not c["passed"]]

    report = {
        "total_score": total_score,
        "status": "PASS" if total_score == 100 else "FAIL",
        "failed_steps": failed_steps
    }

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    sys.exit(0 if total_score == 100 else 1)

if __name__ == "__main__":
    main()
```

---

## 4. Le Workflow Exécutable dans Antigravity (`.agents/workflows/rsi-feature.md`)

En plaçant ce fichier dans `.agents/workflows/rsi-feature.md`, vous pouvez taper `/rsi-feature` directement dans Antigravity pour lancer le développement d'une fonctionnalité avec auto-amélioration intégrée :

```markdown
---
description: Développe une fonctionnalité Fullstack complète avec cycle d'auto-amélioration RSI en 4 phases.
---

# Workflow : /rsi-feature

Suis rigoureusement ces 4 phases séquentielles sans en sauter aucune :

## PHASE 1 : Exécution Fullstack Initiale
1. Lis intégralement `.agents/rules/system_core.md` et `.agents/rules/fullstack_playbook.md`.
2. Implémente la fonctionnalité demandée par l'utilisateur de bout en bout (Schéma DB -> API Backend -> Composants Frontend -> Tests associés).

## PHASE 2 : Évaluation & Boucle Reflexion (Max 3 tentatives)
1. Exécute `python evals/run_fullstack_eval.py` dans le terminal.
2. **Si le score est de 100/100 dès la tentative 1 :** Passe directement à la conclusion (aucune mutation nécessaire car les règles actuelles ont suffi).
3. **Si le score est inférieur à 100/100 :**
   - Note mentalement la cause exacte de l'échec initial affiché dans `evals/logs/trajectory_latest.json`.
   - Corrige le code source de l'application et relance `python evals/run_fullstack_eval.py` (maximum 3 tentatives).
   - Si après 3 tentatives le score est toujours inférieur à 100, arrête-toi et demande l'arbitrage humain.

## PHASE 3 : Mutation Méta-Cognitive (Déclenchée si Tentative > 1)
Puisque tu as eu besoin de plusieurs tentatives en Phase 2 pour atteindre 100/100, tu dois améliorer ta mémoire procédurale :
1. Adopte le rôle décrit dans `.agents/prompts/meta_optimizer.md`.
2. Formule la règle générique qui t'aurait permis d'éviter l'erreur de la Tentative 1 dès le premier coup.
3. Mets à jour `.agents/rules/fullstack_playbook.md` (ou crée un script utilitaire dans `.agents/skills/` si l'erreur est outillable).

## PHASE 4 : Validation & Git Guardrail
1. Vérifie que `.agents/rules/fullstack_playbook.md` fait moins de 150 lignes (`wc -l .agents/rules/fullstack_playbook.md`). Si ce n'est pas le cas, compacte les règles redondantes.
2. Relance `python evals/run_fullstack_eval.py` pour garantir que l'application est toujours à 100/100.
3. Affiche un résumé structuré à l'utilisateur :
   - Fonctionnalité livrée
   - Nombre de tentatives nécessaires
   - Nouvelle règle ajoutée dans `fullstack_playbook.md` (diff exact)
```