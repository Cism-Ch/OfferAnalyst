# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish (Cycle 4)

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 4)  
> **Objectif :** Examiner les formulaires de configuration du compte (`/dashboard/settings`), de l'espace de travail (`/dashboard/workspace`) et de la page support (`/dashboard/support`).

---

## 📋 Synthèse Exécutive (Itération 4)

| Domaine | Problème Détecté | Impact Utilisateur | Priorité |
| :--- | :--- | :--- | :--- |
| **Paramètres (`/dashboard/settings`)** | 5 boutons clés d'action sans aucun handler (Save Profile, Change Password, Delete, etc.) | Frustration utilisateur : formulaire passif sans feedback | 🔴 Haute |
| **Espace de Travail (`/dashboard/workspace`)** | Éléments `<select>` bruts non stylisés & boutons "Save" inactifs + `confirm()` natif | Rupture du design system et dialogues bloquants | 🟡 Moyenne |
| **Support (`/dashboard/support`)** | Boutons de donation et de contact non reliés (clic inopérant) | Impossibilité de contacter le support ou de contribuer | 🟢 Polish |

---

## 🛠️ Diagnostics Détaillés

### 1. Boutons Factices et Entrées Brutes dans `/dashboard/settings`
* **Fichier concerné :** [`src/app/dashboard/settings/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/settings/page.tsx)
* **Constat :** Les boutons *"Save Profile"*, *"Change Password"*, *"Download My Data"*, *"Disconnect"* et *"Delete Account"* ne disposent d'aucun gestionnaire d'événement `onClick`. Les champs utilisent de simples balises HTML `<input>` avec valeurs en dur (`"John Doe"`).
* **Remède :** Connecter les boutons à des toasts d'information ou des Server Actions simples, remplacer les balises brutes par le composant design system `Input`, et brancher la lecture du profil sur la session Better-Auth.

---

### 2. Rupture de Design System & Boutons Orphelins dans `/dashboard/workspace`
* **Fichier concerné :** [`src/app/dashboard/workspace/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/workspace/page.tsx)
* **Constat :** Les sélecteurs Theme, Language et Region utilisent des balises HTML natives `<select>` qui ignorent les thèmes Tailwind. Les boutons *"Save Changes"*, *"Save Preferences"* et *"Invite Member"* sont inactifs. La suppression utilise le `confirm()` natif du navigateur.
* **Remède :** Migrer vers `Select` de shadcn, ajouter un dialogue d'invitation ou toast de sauvegarde, et remplacer le `confirm()` par une modale ou un toast d'annulation.

---

### 3. Boutons Non Connectés dans `/dashboard/support`
* **Fichier concerné :** [`src/app/dashboard/support/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/support/page.tsx#L118-L223)
* **Constat :** Les boutons *"Support with $5"* et *"Contact Support"* n'ont aucun lien d'action.
* **Remède :** Ajouter un lien `mailto:support@offeranalyst.com` sur le bouton de contact et ouvrir une modale de contribution ou lien Stripe sur le bouton de soutien.

---

## 📌 Propositions de TASKs candidates (Cycle 4)

* **`TASK-UX-06` (Priorité 🟡 Moyenne) :** Dynamisation des formulaires Settings & Workspace (Design System `Input`/`Select`, Toasts interactifs, élimination de `confirm()`).
* **`TASK-UX-07` (Priorité 🟢 Polish) :** Activation des liens de support et contact (`mailto:` & dialogues explicatifs).
