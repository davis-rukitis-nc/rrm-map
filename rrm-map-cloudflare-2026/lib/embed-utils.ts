// Utility functions for handling embedded mode

/**
 * Checks if the current page is embedded in an iframe
 */
export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false

  try {
    return window.self !== window.top
  } catch (e) {
    // If we can't access window.top due to same-origin policy,
    // we're likely in an iframe
    return true
  }
}

/**
 * Checks if the device is a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Checks if the current page was opened from an iframe
 * This helps prevent showing the "open in new tab" button when already in a new tab
 */
export function isOpenedFromEmbed(): boolean {
  if (typeof window === "undefined") return false

  // Check if there's a URL parameter or referrer that indicates it was opened from an embed
  return (
    window.location.search.includes("from=embed") ||
    document.referrer.includes("iframe") ||
    sessionStorage.getItem("openedFromEmbed") === "true"
  )
}

/**
 * Marks the current session as opened from an embed
 */
export function markAsOpenedFromEmbed(): void {
  if (typeof window === "undefined") return

  sessionStorage.setItem("openedFromEmbed", "true")
}

/**
 * Opens the current URL in a new tab with a parameter to indicate it came from an embed
 */
export function openInNewTab(): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  url.searchParams.set("from", "embed")
  window.open(url.toString(), "_blank")
}

/**
 * Checks if fullscreen is supported by the browser
 */
export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false

  return !!(
    document.documentElement.requestFullscreen ||
    // @ts-ignore - Safari
    document.documentElement.webkitRequestFullscreen ||
    // @ts-ignore - Firefox
    document.documentElement.mozRequestFullScreen ||
    // @ts-ignore - IE/Edge
    document.documentElement.msRequestFullscreen
  )
}
