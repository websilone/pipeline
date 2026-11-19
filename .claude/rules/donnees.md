---
paths:
  - "src/data/**"
  - "src/__tests__/data/**"
---

# Couche données

Périmètre : `src/data/`. Tests dans `src/__tests__/data/`.

## Règles

- **Seule couche qui parle à la base.** Le client de base de données (`@libsql/client`, qui sert pour SQLite en local comme pour Turso en production) n'est importé et instancié que dans `src/data/`.
  Les variables d'environnement de connexion (identifiants Turso) ne sont lues que là, et sont documentées dans `.env.example`.
- **Expose des interfaces de dépôt** (`XxxRepository`) et leurs implémentations. Le service dépend de l'interface, pas de l'implémentation.
- **Aucune règle métier.** La couche lit, écrit et convertit les lignes en objets. Elle ne décide ni de l'étape initiale, ni de ce qui est « à relancer ».
- **Le passage de SQLite à Turso ne touche que cette couche.** Si un changement de base oblige à modifier `src/services` ou `src/app`, l'abstraction est mal découpée : il faut la corriger ici.
- Le schéma et les migrations vivent dans `src/data/`.
- Pas d'import de `next`, de `react` ni de `@/services`, pour éviter toute dépendance remontante.

## Comment vérifier

```bash
# 1. Aucun client de base hors de src/data (doit ne rien renvoyer)
grep -rniE "libsql|sqlite|turso" src --include='*.ts' --include='*.tsx' | grep -vE "^src/(data|__tests__/data)/"

# 2. Variables de connexion lues uniquement ici (doit ne rien renvoyer)
grep -rn "process.env" src | grep -v "^src/data/"

# 3. Pas de dépendance remontante (doit ne rien renvoyer)
grep -rnE "from ['\"](next|react|@/services)" src/data

# 4. Tests des dépôts au vert
pnpm test src/__tests__/data
```
