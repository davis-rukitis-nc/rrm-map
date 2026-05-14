export interface Env {
  ASSETS: Fetcher
}

const IMAGE_HOST_ALLOWLIST = new Set(["earth.usercontent.google.com"])

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

async function proxyImage(request: Request) {
  const requestUrl = new URL(request.url)
  const rawUrl = requestUrl.searchParams.get("url")

  if (!rawUrl) {
    return new Response("Missing image URL", { status: 400, headers: corsHeaders() })
  }

  let imageUrl: URL
  try {
    imageUrl = new URL(rawUrl)
  } catch {
    return new Response("Invalid image URL", { status: 400, headers: corsHeaders() })
  }

  if (imageUrl.protocol !== "https:" || !IMAGE_HOST_ALLOWLIST.has(imageUrl.hostname)) {
    return new Response("Image host not allowed", { status: 403, headers: corsHeaders() })
  }

  const fetchUpstream = (target: URL) =>
    fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RRMMap/2026)",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 60 * 60 * 24 * 14,
      },
    })

  let upstream = await fetchUpstream(imageUrl)

  // Some Google Earth exports include /e/*/. If the image host rejects that path
  // in a normal fetch, retry the alternate hosted-image path Google sometimes accepts.
  if (!upstream.ok && imageUrl.pathname.includes("/e/*/")) {
    const alternate = new URL(imageUrl.toString())
    alternate.pathname = alternate.pathname.replace("/e/*/", "/e/-/")
    upstream = await fetchUpstream(alternate)
  }

  if (!upstream.ok) {
    return new Response("Image unavailable", {
      status: upstream.status,
      headers: {
        ...corsHeaders(),
        "Cache-Control": "public, max-age=300",
      },
    })
  }

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.set("Access-Control-Allow-Origin", "*")
  responseHeaders.set("Cache-Control", "public, max-age=1209600, immutable")

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    if (url.pathname === "/image-proxy") {
      return proxyImage(request)
    }

    return env.ASSETS.fetch(request)
  },
}
