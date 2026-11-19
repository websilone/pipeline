# Intention · Pipeline

## Produit

Un mini CRM de prospection pour une seule personne.
Je note mes contacts, je les fais avancer d'étape en étape, je sais qui relancer aujourd'hui.

- Un contact : nom, entreprise, email, notes.
- Étapes fixes : À contacter → Contacté → En discussion → Gagné / Perdu.
- Chaque contact a une date de prochaine relance, saisie à la main.
- « À relancer aujourd'hui » : contacts ni gagnés ni perdus dont la date de relance est aujourd'hui ou dépassée.

## Architecture

Une architecture en 3 couches : présentation, service, données.
Seule la couche données parle à la base.
SQLite en local, Turso en production : les données doivent survivre aux redéploiements Vercel.
Les règles métier (changement d'étape, calcul des relances) ont des tests unitaires.

## Contraintes

Next.js, composants shadcn, déploiement sur Vercel.
Un seul utilisateur.

## Hors périmètre

Pas d'authentification, pas de gestion de droits, pas de multi-utilisateur.
L'URL publique n'est pas protégée : accepté pour l'exercice.
Pas d'envoi d'emails ni de notifications.

## Critères d'acceptation

- J'ajoute un contact, il apparaît dans l'étape « À contacter ».
- Je change l'étape d'un contact, il apparaît dans la nouvelle étape.
- Un contact dont la date de relance est aujourd'hui ou dépassée apparaît dans « À relancer aujourd'hui ».
- Après redémarrage ou redéploiement de l'app, mes contacts sont toujours là.
- Passer à une base managée ne modifie que la couche données.
