---
paths:
  - "src/services/**"
  - "src/__tests__/services/**"
---

# Couche service

Périmètre : `src/services/`. Tests dans `src/__tests__/services/`.

## Règles

- **Porte toutes les règles métier** définies dans `INTENT.md` :
  - un nouveau contact démarre dans « À contacter » ;
  - les étapes sont fixes : À contacter → Contacté → En discussion → Gagné / Perdu ;
  - « À relancer aujourd'hui » regroupe les contacts ni gagnés ni perdus dont la date de relance est aujourd'hui ou dépassée.
- **Les tests sont écrits avant le code.** Pour chaque règle :
  1. écrire le test dans `src/__tests__/services/` ;
  2. lancer `pnpm test` et constater qu'il échoue pour la bonne raison ;
  3. écrire le code minimal qui le fait passer ;
  4. refactorer, tests au vert.
  Aucune fonction exportée sans test qui la couvre.
- **Accède aux données uniquement via les interfaces de dépôt** de `@/data/*` (par exemple `ExampleRepository`). Le dépôt est injecté (`createXxxService(repository)`), donc les tests utilisent un faux dépôt en mémoire.
- **Point d'assemblage : `src/services/index.ts`.** C'est le seul fichier qui instancie les dépôts concrets et les relie aux services. Il exporte des services prêts à l'emploi pour la présentation.
- **Indépendante du framework et de la base.** Pas d'import de `next`, `react` ni d'un client de base de données. Pas de SQL.
- **Testable dans le temps.** « Aujourd'hui » est injecté (un paramètre `today` ou une horloge), jamais lu directement via `new Date()` dans une règle métier.
- Le service réexporte les types dont la présentation a besoin, pour qu'elle n'importe jamais `@/data`.

## Comment vérifier

```bash
# 1. Pas de framework, de client de base ni de SQL (doit ne rien renvoyer)
grep -rnE "from ['\"](next|react|.*libsql|.*sqlite)|\b(SELECT|INSERT|UPDATE|DELETE)\b" src/services

# 2. Pas de date système dans les règles (doit ne rien renvoyer)
grep -rn "new Date()" src/services

# 3. Chaque fichier de service a son fichier de test (hors index.ts, simple assemblage)
for f in src/services/*.ts; do [ "$(basename "$f")" = "index.ts" ] && continue; t="src/__tests__/services/$(basename "${f%.ts}").test.ts"; [ -f "$t" ] || echo "MANQUANT : $t"; done

# 4. Tests au vert
pnpm test src/__tests__/services

# 5. Test d'abord : dans l'historique, le test arrive avec ou avant le code (indicatif, pas une preuve)
git log --stat -- src/services src/__tests__/services
```
