# SmartRecruit Frontend — Docs

Quick start

1. Install dependencies

```bash
npm install
```

2. (Optional) Set API host in `.env` at project root:

```
VITE_API_HOST=http://192.168.1.79:8080
```

3. Run dev server

```bash
npm run dev
```

Translations

- UI strings live in `src/i18n/en.json` and `src/i18n/ro.json`.
- The app defaults to English. To change language at runtime use the `useI18n()` composable and set `locale.value = 'ro'`.

API

See `docs/api-integration.md` for endpoint descriptions and sample payloads.
