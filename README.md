# Drop

Tap a button, get a project you can actually finish. Field and difficulty are rolled for you.
Installs to your home screen and works offline for everything except rolling.

## What's here

```
public/index.html          the whole app — no build step, no bundler
public/manifest.webmanifest
public/sw.js               offline cache
public/icon-*.png
server.js                  static host + Anthropic proxy
Dockerfile
```

No Babel, no CDN React. One HTML file, plain JS. Nothing to break when a CDN bumps a version on you.

## Run it locally

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
# http://localhost:3000
```

## Deploy on Coolify

1. New resource → Application → your Git repo.
2. Build pack: **Dockerfile**. Pick it explicitly — left on Nixpacks it will guess wrong.
3. Port: `3000`.
4. Environment variable: `ANTHROPIC_API_KEY` = your key. Optional: `MODEL`.
5. Set a domain and let Coolify issue the certificate. **HTTPS is required** — no service worker and no install prompt without it.
6. Health check path: `/healthz`.

## Put it on your phone

- **Android / Chrome:** open the URL, menu → Add to Home screen. You'll usually get an install banner instead.
- **iOS / Safari:** open the URL, Share → Add to Home Screen. Has to be Safari; Chrome on iOS can't install PWAs.

It launches without browser chrome, keeps its own icon, and holds your bench on the device.

## Where the API key lives

Two modes:

- **Server holds it** (default, recommended). The app posts to `/api/generate` and the server adds the key. Nothing sensitive on the phone. Leave the key field in settings empty.
- **Phone holds it.** Paste a key into "Your kit & connection" and the app calls Anthropic directly. Only worth it if you host the `public/` folder statically with no backend — the key then sits in local storage on the device.

## Notes

- Bench and archive live in `localStorage`, per device. Clearing site data wipes them. Syncing across devices needs a database — Postgres plus two endpoints on top of `server.js`.
- The field roll skips whatever came up in the last two rolls, so you won't get three CAD cards in a row.
- Edit your kit in settings whenever your bench changes. It goes into every prompt and it's the biggest single lever on how good the ideas are.
- Bump `CACHE` in `sw.js` when you deploy a new version, or phones will keep serving the old one.
