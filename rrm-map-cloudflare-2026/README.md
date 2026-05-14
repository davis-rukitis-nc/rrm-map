# Rimi Riga Marathon 2026 Map

Cloudflare-ready static Next.js export of the Rimi Riga Marathon route map.

## What changed

- Updated all route KML files to the 2026 KML files in `public/kml`.
- Removed the old hardcoded 2025 GitHub raw KML URLs.
- Added English and Latvian KML sets:
  - `/kml/en/marathon.kml`
  - `/kml/en/half-marathon.kml`
  - `/kml/en/10km.kml`
  - `/kml/en/6km.kml`
  - `/kml/en/mile.kml`
  - `/kml/lv/marathon.kml`
  - `/kml/lv/half-marathon.kml`
  - `/kml/lv/10km.kml`
  - `/kml/lv/6km.kml`
  - `/kml/lv/mile.kml`
- Changed the app to a static export so it can run cleanly on Cloudflare Pages or as a Cloudflare Workers static asset deployment.
- Added SPA fallback support for `/lv`, query links, and refreshes.

## URLs / embed options

Default English map:

```html
<iframe src="https://YOUR-MAP-DOMAIN/" style="width:100%;height:720px;border:0;display:block;" loading="lazy"></iframe>
```

Latvian:

```html
<iframe src="https://YOUR-MAP-DOMAIN/lv" style="width:100%;height:720px;border:0;display:block;" loading="lazy"></iframe>
```

Specific distance:

```html
<iframe src="https://YOUR-MAP-DOMAIN/?distance=21km" style="width:100%;height:720px;border:0;display:block;" loading="lazy"></iframe>
```

Supported distance values: `42km`, `21km`, `10km`, `6km`, `mile`.

## Cloudflare Workers static-assets deployment

Use these settings if Cloudflare asks for build/deploy commands:

- Build command: `pnpm build`
- Deploy command: `npx wrangler deploy`
- Output directory: `out`

The included `wrangler.toml` points Wrangler at `./out`.

## Cloudflare Pages deployment

Use these settings:

- Build command: `pnpm build`
- Build output directory: `out`

No server runtime is needed.
