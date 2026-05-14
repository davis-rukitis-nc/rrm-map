import { rmSync } from 'node:fs'

// Cloudflare Workers assets rejects the SPA-style `/* /index.html 200` redirect as an infinite loop.
// `not_found_handling = "single-page-application"` in wrangler.toml handles `/lv` and direct URLs instead.
rmSync('out/_redirects', { force: true })
rmSync('out/_headers', { force: true })
