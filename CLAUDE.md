# CLAUDE.md

Ce fichier guide Claude Code (claude.ai/code) lorsqu'il travaille sur le code de ce dépôt.

@AGENTS.md

## Langue

Sur ce projet, tout échange se fait en français (réponses, documentation, `CLAUDE.md`). Seul le code reste en anglais : identifiants, commentaires, messages de commit.

## Projet

Pipeline est un mini CRM de prospection mono-utilisateur. **`INTENT.md` fait office de spécification** (règles produit, architecture, critères d'acceptation) : à lire avant tout développement de fonctionnalité. Le dépôt n'est pour l'instant qu'un squelette : seuls une page d'accueil provisoire et un smoke test existent.

Règles métier clés tirées d'`INTENT.md` :
- Contact : nom, entreprise, email, notes, date de prochaine relance saisie à la main.
- Étapes fixes : À contacter → Contacté → En discussion → Gagné / Perdu. Un nouveau contact démarre dans « À contacter ».
- « À relancer aujourd'hui » = contacts ni gagnés ni perdus dont la date de relance est aujourd'hui ou dépassée.
- Hors périmètre : authentification, multi-utilisateur, emails et notifications.

## Commandes

```bash
pnpm dev                                   # http://localhost:3000
pnpm build
pnpm lint                                  # ESLint 9 flat config (next core-web-vitals + typescript)
pnpm test                                  # vitest run (tous les tests)
pnpm test src/__tests__/smoke.test.tsx     # un seul fichier
pnpm test -t "home page renders"           # un seul test, par son nom
```

## Architecture cible (définie dans INTENT.md, pas encore construite)

Trois couches : **présentation → service → données**.
- Seule la couche données parle à la base. Passer de SQLite (local) à Turso (production, pour que les données survivent aux redéploiements Vercel) ne doit toucher que la couche données.
- Les règles métier (changement d'étape, calcul des relances) vivent dans la couche service et doivent avoir des tests unitaires.
- Déploiement sur Vercel.

## Particularités de la stack

- **Next.js 16.4 + React 19.3**, avec `cacheComponents: true` et `partialPrefetching: true` dans `next.config.ts`. Les API diffèrent des versions précédentes de Next : consulter `node_modules/next/dist/docs/` avant d'écrire du code spécifique à Next (voir AGENTS.md). Les props des routes sont typées avec les types globaux comme `LayoutProps<"/">` plutôt qu'à la main.
- **Tailwind v4** passe par un loader Turbopack (règle `@tailwindcss/turbopack` dans `next.config.ts`), pas par PostCSS. Pas de `tailwind.config` : les tokens du thème sont dans `src/app/globals.css`.
- **shadcn/ui en style `base-nova`** : les composants reposent sur `@base-ui/react`, pas sur Radix. Ajouter un composant avec `pnpm dlx shadcn add <name>` ; il arrive dans `src/components/ui`. Icônes : `lucide-react`.
- `cn()` dans `src/lib/utils.ts` réexporte le paquet `cn` (pas de clsx ni de tailwind-merge).
- Alias de chemin `@/*` → `src/*` (repris dans `vitest.config.mts`).
- Vitest tourne en environnement `node` (pas de jsdom) : les composants se testent via `renderToStaticMarkup`. Les tests sont dans `src/__tests__/`.
- L'interface est en français (`<html lang="fr">`).

## Git

- Branches : `main` = production, `dev` = branche de travail. On travaille sur `dev`, jamais directement sur `main`.
- Sur ce projet, Claude peut commiter et pousser sans demander d'accord explicite.
- Un seul commit par lot : `feat(lot-N): <titre du lot>`. Les autres commits suivent Conventional Commits (`fix:`, `chore:`…), avec des messages courts en anglais.
- Les PR vont de `dev` vers `main`.
- Les tests passent (`pnpm test`) avant toute PR.
- Jamais de secrets dans un commit (`.env`, tokens Turso…) ; seul `.env.example` est versionné.
- Le bloc ajouté dans `AGENTS.md` par `next dev` peut être commité avec le reste du travail, pour garder l'arbre propre.

## Environnement

- `.env.example` documente les variables d'environnement (aucune pour l'instant ; les identifiants Turso iront ici).
