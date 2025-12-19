# Ticket : Amélioration du bouton "Sauvegarder" (Ranked Offers)

## Description du problème
Le bouton de sauvegarde sur les cartes d'offres classées dans le Dashboard présente des défauts de design et d'intégration :
1. **Contenu** : Le bouton n'affiche qu'une icône (`Wallet` ou `CheckCircle2`) sans texte descriptif, ce qui peut être peu intuitif.
2. **Positionnement** : Il est positionné de manière absolue (`absolute top-0 right-0`), mais la carte parente `Card` n'a pas la classe `relative`, ce qui peut causer des problèmes d'affichage si la carte n'est pas le premier ancêtre positionné. De plus, cela nécessite un `pr-20` sur le titre pour éviter l'overlap.
3. **Visibilité** : Le style "ghost" avec un fond semi-transparent peut le rendre difficile à voir sur certains fonds ou images futures.

## Objectifs
- [ ] Ajouter un label textuel au bouton (ex: "Sauvegarder" ou "Enregistré").
- [ ] Harmoniser le positionnement dans le footer de la carte ou dans une zone d'action dédiée.
- [ ] Améliorer l'accessibilité (aria-label).
- [ ] S'assurer que le bouton reflète clairement l'état "déjà sauvegardé" avec un feedback visuel fort.

## Fichiers concernés
- `src/components/dashboard/dashboard-page.tsx` (Lignes 357-366)

## Critères d'acceptation
- Le bouton contient du texte et une icône.
- Le bouton n'est plus positionné en `absolute` s'il peut être intégré dans la structure flex/grid de la carte.
- Le design est cohérent avec les standards `shadcn/ui` utilisés dans le reste du projet.
