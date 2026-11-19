---
paths:
  - "src/app/**"
  - "src/components/**"
---

# Couche présentation

Périmètre : `src/app/` (routes, layouts, server actions) et `src/components/`.

## Règles

- **N'appelle que la couche service.** Importe depuis `@/services/*`, jamais depuis `@/data/*`, et n'utilise aucun client de base de données.
  Les types métier viennent aussi du service : il les réexporte, comme `Example` dans `example-service.ts`.
  Les services sont déjà reliés à leur dépôt dans `src/services/index.ts` : la présentation ne construit jamais un service elle-même.
- **Pas de logique métier ici.** Le calcul d'une relance ou la validation d'un changement d'étape relèvent du service. La présentation affiche et transmet.
- **Seulement des composants du design system.** On utilise ce qui est dans `src/components/ui/` (shadcn, style `base-nova`, basé sur `@base-ui/react`).
  S'il manque un composant, on l'ajoute avec `pnpm dlx shadcn add <name>`. Pas d'élément HTML stylé à la main quand un équivalent existe (`Button`, `Input`, `Card`, `Badge`…).
  Icônes : `lucide-react` uniquement.
- **Aucune couleur en dur.** Pas d'hexadécimal, de `rgb()`, de `hsl()` ni de `oklch()` dans les composants.
  Pas de palette Tailwind brute (`bg-red-500`, `text-gray-600`), pas de valeur arbitraire (`bg-[#…]`), pas de `style={{ color: … }}`.
  On n'utilise que les tokens du thème définis dans `src/app/globals.css` : `bg-primary`, `text-muted-foreground`, `border-border`, `bg-stage-won`, `text-overdue`…
  Il manque un token ? On l'ajoute dans `globals.css` (en clair et en sombre), pas dans le composant.

## Comment vérifier

```bash
# 1. Aucun import de la couche données ni d'un client de base (doit ne rien renvoyer)
grep -rnE "from ['\"](@/data|.*libsql|.*sqlite)" src/app src/components

# 2. Aucune couleur littérale (doit ne rien renvoyer)
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(" src/app src/components --include='*.tsx'

# 3. Aucune couleur de la palette Tailwind brute ni valeur arbitraire (doit ne rien renvoyer)
grep -rnE "\b(bg|text|border|ring|fill|stroke|outline|from|via|to|shadow|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-[0-9]+)?\b|-\[#" src/app src/components

# 4. Tests et lint au vert
pnpm lint && pnpm test src/__tests__/components
```
