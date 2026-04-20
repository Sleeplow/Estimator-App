# PBI Estimateur — CLAUDE.md

## Skills obligatoires

### Toute modification UI / visuelle
Invoquer **`ui-ux-pro-max`** avant d'implémenter :
- Nouveaux composants, pages ou layouts
- Changements de couleurs, typographie, espacement
- Navigation, boutons, formulaires, cartes
- Responsive / mobile
- Animations ou transitions

### Toute modification du README
Invoquer **`readme-format`** pour garder le style maison cohérent.

---

## Stack

- **React 18 + TypeScript + Vite 6**
- CSS Modules (pas de Tailwind, pas de styled-components)
- React Router v6 — HashRouter — base `/`
- PWA via `vite-plugin-pwa` + Workbox
- Persistence : `localStorage` uniquement — pas de backend

## Conventions

- Langue de l'UI : **français (fr-CA)**
- Icônes : **SVG inline uniquement** — pas d'emojis, pas de librairie d'icônes externe
- Touch targets : **minimum 44×44px** sur mobile
- Transitions : **150–300ms** pour les micro-interactions

## Architecture

```
src/
├── types/index.ts          # Tous les types + CURRENT_VERSION + DEFAULT_CATALOG
├── hooks/useLocalStorage.ts # État global + persistence + toutes les actions
├── pages/
│   ├── Dashboard/          # Estimation courante (auto-save si ID présent)
│   ├── History/            # Liste des estimations sauvegardées
│   └── Configuration/      # Taux de base + catalogue de tâches
└── components/
    ├── Navigation/         # Top bar desktop + bottom tab bar mobile
    └── AddTaskMenu/        # Ajout de tâches (catalogue ou personnalisée)
```

## Données

- Clé localStorage : `powerbi-estimator`
- Version actuelle du schéma : **v3**
- Migration automatique v1 → v2 → v3 dans `migrateData()`
- `SavedEstimation` stocke son propre `hourlyRate` + `tasks` snapshot — les valeurs sauvegardées ne changent pas si les défauts du catalogue changent

## Déploiement

- CI/CD : GitHub Actions sur push `main` → GitHub Pages
- Domaine custom : **estimator.sleeplow.ca**
- `base` Vite : `/` (domaine custom = pas de sous-répertoire)
- PWA `scope` et `start_url` : `/`
