---
name: backlog
description: Gérer le backlog dans GitHub Issues avec gh. Utiliser quand l'utilisateur dit « crée une issue », « ajoute au backlog », « envoie les lots sur GitHub », ou quand un bug ou une correction apparaît pendant le travail.
---

# backlog · le backlog vit dans GitHub

Principe : un sujet = une issue, créée tout de suite avec `gh issue create`.

## Avant de commencer
- `gh auth status` doit être connecté.

## Labels (crée-les s'ils manquent, n'en invente pas d'autres)
| Label | Usage |
|---|---|
| `lot` | Un lot de lots.md : une chose que l'utilisateur fait de bout en bout |
| `bug` | Un comportement incorrect, avec les étapes pour le reproduire |
| `relecture` | Un constat de relecture à corriger |

Création : `gh label create lot 2>/dev/null || true`

## Titre
- Un lot : « Lot N · <titre avec un verbe> ».
- Les autres : le problème, en français, factuel. Pas la solution.

## Corps
- Lot : le parcours, les critères d'acceptation en cases à cocher `- [ ]`.
- Bug : ce qui a été observé, et comment le reproduire.
- Lier ce qui est lié : `Bloqué par #3`, `Découvert pendant #5`.

## PR
- La PR qui traite une issue contient `Closes #N` : l'issue se ferme à la fusion.

## Règles
1. Cherche les doublons avant de créer : `gh issue list --search "<mots-clés>"`.
2. Ne ferme jamais une issue sans preuve (PR fusionnée) ou demande explicite.
3. Une issue = un sujet.
4. Donne à l'utilisateur le numéro et le lien de chaque issue créée.
