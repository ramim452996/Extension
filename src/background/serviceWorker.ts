/**
 * Background Service Worker — Compare Anything Extension
 *
 * Responsibilities:
 *  1. Generate a persistent anonymous installId on first install.
 *  2. Serve as the MV3 service worker entry point (required by manifest).
 *
 * Intentionally minimal — no shared imports (must be standalone for MV3).
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const existing = await chrome.storage.local.get('installId')
    let installId = existing.installId
    if (!installId) {
      // Generate an anonymous UUID (no PII)
      installId = crypto.randomUUID()
      await chrome.storage.local.set({ installId })
      console.log('[Compare Anything] New install. ID:', installId)
    }

    // Ping anonymous installation event to backend (best-effort, non-blocking)
    try {
      fetch('https://compare-backend.test/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'extension_installed',
          installId,
        }),
      }).catch(() => {})
    } catch {
      // Ignore network errors on install
    }
  }
})

// Keep service worker alive on extension icon click (fallback)
chrome.runtime.onStartup.addListener(() => {
  console.log('[Compare Anything] Service worker started.')
})
