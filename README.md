# Rimi Riga Marathon 2026 Map — Cloudflare Worker Assets

Cloudflare-ready static Next.js export for the Rimi Riga Marathon map embed.

## Cloudflare settings

- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy`
- Assets/output directory: handled by `wrangler.toml` → `out`

`wrangler.toml` uses Cloudflare Worker Assets with:

```toml
[assets]
directory = "./out"
not_found_handling = "single-page-application"
```

Do not add a `/* /index.html 200` `_redirects` file. Cloudflare Workers Assets rejects that rule as an infinite-loop redirect. The SPA fallback above is what keeps `/lv` and direct URLs working.

## URLs

- English: `/`
- Latvian: `/lv`
- Preselect distance: `/?distance=21km` or `/lv?distance=10km`

Accepted distance values: `42km`, `21km`, `10km`, `6km`, `mile`.

## Embed examples

```html
<iframe src="https://YOUR-MAP-DOMAIN/" style="width:100%;height:720px;border:0;display:block;" loading="lazy"></iframe>
```

```html
<iframe src="https://YOUR-MAP-DOMAIN/lv" style="width:100%;height:720px;border:0;display:block;" loading="lazy"></iframe>
```

## Notes

- KML files live in `public/kml/en/` and `public/kml/lv/`.
- The build script clears old `out`/`.next` output before each build and removes any accidental `_redirects`/`_headers` from `out` after export.
- The map handles responsive iframe resizing and direct `/lv` loads through the Worker Assets SPA fallback.
