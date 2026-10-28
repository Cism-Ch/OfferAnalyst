# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish (Cycle 5)

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 5)  
> **Objectif :** Examiner les points d'entrée utilisateurs : Authentification, Onboarding, Landing Page et gestion des erreurs 404.

---

## 📋 Synthèse Exécutive (Itération 5)

| Domaine | Problème Détecté | Impact Utilisateur | Priorité |
| :--- | :--- | :--- | :--- |
| **Gestion des Erreurs (404)** | Absence de `not-found.tsx` et `error.tsx` dans `src/app/` | Écran brut et austère en cas d'URL erronée, impasse de navigation | 🔴 Haute |
| **Landing Page (FAQ)** | Inexactitude technique majeure : mention de "bcrypt" pour les clés API | Perte de crédibilité technique (AES-256-GCM est le vrai chiffrement) | 🟡 Moyenne |
| **Onboarding (BYOK)** | Saisie libre du nom de fournisseur sans normalisation de casse | Risque de non-reconnaissance des clés lors des analyses | 🟡 Moyenne |
| **Accessibilité (Landing)** | Imbrication `<Link><Button>` sans `asChild` sur les boutons CTA | Avertissements DOM et violations d'accessibilité | 🟢 Polish |

---

## 🛠️ Diagnostics Détaillés

### 1. Absence de Pages 404 (`not-found.tsx`) et Segment Error (`error.tsx`)
* **Fichiers concernés :** `src/app/not-found.tsx`, `src/app/error.tsx` (Absents)
* **Constat :** Lorsqu'un utilisateur tente d'accéder à une route inexistante ou qu'une erreur de segment survient, Next.js bascule sur son rendu minimaliste par défaut sans header, sans thème et sans lien de retour évident.
* **Remède :** Créer une page 404 (`not-found.tsx`) élégante, avec logo Offan, message bienveillant et bouton guidé vers l'accueil ou le tableau de bord.

---

### 2. FAQ Marketing Erronée sur la Sécurité des Clés API
* **Fichier concerné :** [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx#L142)
* **Constat :** La FAQ indique *"Your API keys are encrypted with bcrypt before storage"*. Or, `bcrypt` est un hachage irréversible (impossibilité de déchiffrer pour appeler l'API). Le vrai protocole de l'application est **AES-256-GCM** (symétrique réversible sécurisé).
* **Remède :** Rectifier la formulation dans la FAQ et mettre à jour la liste des modèles gratuits (Gemini 3.5 Flash Lite et Nemotron 3.5 Lightning).

---

### 3. Normalisation des Fournisseurs BYOK dans l'Onboarding
* **Fichier concerné :** [`src/components/onboarding/APIKeysStep.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/onboarding/APIKeysStep.tsx#L134)
* **Constat :** L'utilisateur tape à la main le nom du provider. Si la casse diffère ("OpenAI" au lieu de "openai"), la clé ne sera pas trouvée lors de la résolution dans `AnalysisContext.tsx`.
* **Remède :** Normaliser systématiquement via `.trim().toLowerCase()` lors de l'enregistrement.

---

## 📌 Propositions de TASKs candidates (Cycle 5)

* **`TASK-UX-08` (Priorité 🔴 Haute) :** Implémentation de la Page 404 (`not-found.tsx`) & Gestionnaire Segment Error (`error.tsx`) dans le design system Offan.
* **`TASK-CONTENT-01` (Priorité 🟡 Moyenne) :** Rectification de la FAQ de sécurité de la Landing Page (AES-256-GCM vs bcrypt) et normalisation des providers dans l'Onboarding.
