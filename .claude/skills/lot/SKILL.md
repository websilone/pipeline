---
name: lot
description: Traiter un lot de lots.md selon le process du projet : plan validé, TDD, preuves, puis proposition de PR. Utiliser quand l'utilisateur tape « /lot N » ou demande de traiter un lot.
---

# lot · notre façon de développer un lot

Ce skill définit le process du projet. Il s'applique à chaque lot, sans le redire.
Argument : le numéro du lot ($ARGUMENTS).

## 1. Préparer
- Travaille sur la branche dev, à jour avec main : `git checkout dev && git pull origin main`.
- Lis le lot $ARGUMENTS dans lots.md, puis INTENT.md et les règles de .claude/rules/.

## 2. Planifier, puis attendre ma validation
- Les tâches, couche par couche : présentation, service, données.
- Pour chaque critère d'acceptation : le ou les tests qui le prouvent, et la couche testée.
- Si un critère est flou ou impossible à tester, signale-le.
- STOP : attends ma validation du plan et des critères avant d'écrire.

## 3. Exécuter en TDD
- Écris d'abord les tests. Ils couvrent les trois couches : service, présentation, données.
- Lance `pnpm test` : ils échouent. Garde cette sortie rouge.
- Écris le code, couche par couche, jusqu'à ce que `pnpm test` passe.
- Un seul commit pour le lot : `feat(lot-$ARGUMENTS): <titre du lot>`.

## 4. Vérifier
- `pnpm test` passe en entier.
- Chaque critère a son test.
- La sortie rouge a été vue avant le code.
- Les règles de .claude/rules/ sont respectées.

## 5. Ouvrir la PR
- Une fois tous les tests verts, ouvre la PR de dev vers main (`gh pr create`) et donne-moi le lien.
- Dans le corps : les critères cochés, le test de chaque critère, la sortie rouge puis la sortie verte de `pnpm test`.

## Nomenclature des commits
- `feat(lot-N): <titre du lot>` : un lot.
- `fix(lot-N): <ce qui est corrigé>` : une correction.
- `chore: <quoi>` : mise en place, outillage.
- `docs: <quoi>` : documentation.

## Règles
- Ne sors pas du lot. Une idée hors lot : signale-la, ne la code pas.
- Ne fusionne jamais : la fusion est à moi.
