# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Local data (IndexedDB with Dexie)

This project uses IndexedDB via Dexie to store job data on the frontend (no json-server required).

- To install dependencies after this change:

```powershell
npm install
```

- To reset the local jobs DB (for development):

Open the browser devtools console and run:

```javascript
await indexedDB.deleteDatabase('BirukJobsDB')
window.location.reload()
```

The app seeds the DB from `src/jobs.json` on first run if the DB is empty.
