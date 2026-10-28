# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish (Cycle 8)

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 8)  
> **Objectif :** Examiner les utilitaires d'exportation (CSV, PDF), le système de Toasts et la robustesse des données.

---

## 📋 Synthèse Exécutive (Itération 8)

| Domaine | Problème Détecté | Impact Utilisateur / Sécurité | Priorité |
| :--- | :--- | :--- | :--- |
| **Sécurité Export CSV** | Absence d'échappement Anti-Formula Injection (`=`, `+`, `-`, `@`) dans `csv.ts` | Risque d'exécution de formules Excel lors de l'ouverture du CSV (CWE-1236) | 🔴 Haute |
| **Typage Strict PDF** | Emploi de `any` avec désactivation ESLint dans `pdf.ts` | Dérogation au typage strict TypeScript du projet | 🟢 Qualité |

---

## 🛠️ Diagnostics Détaillés

### 1. Vulnérabilité CSV Formula Injection (CWE-1236)
* **Fichier concerné :** [`src/lib/export/csv.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/export/csv.ts#L7-L20)
* **Constat :** La fonction `escapeCSVValue` gère les séparateurs et quotes RFC 4180 mais ne neutralise pas les caractères introductifs de formules Excel (`=`, `+`, `-`, `@`, `\t`, `\r`).
* **Risque :** Les offres collectées automatiquement depuis le web (`autoFetch`) pourraient contenir des charges utiles de type `=1+1` ou macros qui s'exécuteraient à l'ouverture du fichier dans Excel.
* **Remède :** Ajouter un contrôle `if (/^[=+\-@\t\r]/.test(str)) str = '\'' + str;`.

---

### 2. Typage Strict du Moteur PDF
* **Fichier concerné :** [`src/lib/export/pdf.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/export/pdf.ts#L65-L66)
* **Constat :** Présence de `any` bypassant le linter TypeScript dans le mapping des offres vers les sections PDF.
* **Remède :** Typer strictement avec `ScoredOffer | Offer`.

---

## 📌 Proposition de TASK candidate (Cycle 8)

* **`TASK-SEC-03` (Priorité 🔴 Haute) :** Neutralisation du risque CSV Formula Injection (CWE-1236) dans `csv.ts` et typage strict sans `any` dans `pdf.ts`.
