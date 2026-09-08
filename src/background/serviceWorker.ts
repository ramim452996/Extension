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
    if (!existing.installId) {
      // Generate a UUID for anonymous analytics (no PII)
      const installId = crypto.randomUUID()
      await chrome.storage.local.set({ installId })
      console.log('[Compare Anything] New install. ID:', installId)
    }
  }
})

// Keep service worker alive on extension icon click (fallback)
chrome.runtime.onStartup.addListener(() => {
  console.log('[Compare Anything] Service worker started.')
})
