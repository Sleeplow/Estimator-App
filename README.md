# PBI Estimateur

A **Progressive Web App** for generating Power BI consulting estimates. Build task-based quotes with hourly rates, save them to history, and access everything offline from your phone or desktop.

Live at → **[estimator.sleeplow.ca](https://estimator.sleeplow.ca)**

---

## Installation (PWA)

**iOS**: Open the URL in Safari, tap the Share button, then select "Add to Home Screen" for full-screen standalone mode.

**Android**: Launch in Chrome, access the menu (three dots), and choose "Install app" or "Add to home screen."

---

## Key Features

- **Estimation board** — Add tasks from a catalog or create custom ad-hoc tasks. Edit hours per task; tasks with hours that differ from the catalog default are highlighted in amber with a one-click reset.
- **Flexible hourly rate** — Set a base rate in Configuration. Override it per-estimation directly on the dashboard without touching the default.
- **Auto-save** — Once an estimation is saved, every change (tasks, hours, rate, title, client, description) is persisted automatically after a short pause.
- **Estimation history** — Every saved estimation stores its own snapshot: title, client, description, hourly rate, and task hours. Reloading an old estimate restores the exact values it had at save time, even if defaults have since changed.
- **Creation & modification dates** — Each history card shows when the estimate was first created and when it was last updated.
- **Mobile-first navigation** — Bottom tab bar on mobile (Estimation / Historique / Config) with SVG icons; full top nav on desktop.
- **Offline capable** — Service worker caches all assets for use without network.

---

## Workflow

1. Open the app and optionally set your base hourly rate in **Configuration**.
2. On the **Estimation** tab, enter a title, client name, and optional description.
3. Add tasks from the catalog or create custom ones. Adjust hours as needed.
4. Click **Enregistrer** (green) to save the estimate for the first time — it then auto-saves on every change.
5. Browse past estimates in **Historique**: load any of them to restore the full snapshot, or delete them.

---

## Technical Foundation

The stack is **React 18 + TypeScript + Vite 6** with CSS Modules and the **vite-plugin-pwa** / Workbox for service worker generation. All data is stored in `localStorage` as a versioned JSON document with automatic migration between schema versions. No backend, no database, no authentication required.

---

## Development & Deployment

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

Deployment is fully automated via **GitHub Actions** on every push to `main`. The workflow builds the project and publishes the `dist/` folder to the `gh-pages` branch, served under the custom domain `estimator.sleeplow.ca`.
