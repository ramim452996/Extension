/**
 * Background Service Worker — Compare Anything Extension
 *
 * Responsibilities:
 *  1. Generate a persistent anonymous installId on first install.
 *  2. Register Right-Click Context Menu item: "⚡ Add Tab to Compare Anything".
 *  3. Handle Keyboard Shortcut: Alt+C to add current tab instantly.
 *  4. Update Chrome action badge (e.g. "1", "2", "3", "4") reflecting count.
 *  5. Provide visual notifications when a tab is successfully captured.
 */

// Function to check if url is a browser internal page
function isBrowserInternalUrl(url: string | undefined): boolean {
  if (!url) return true
  const lower = url.toLowerCase().trim()
  return (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('moz-extension://') ||
    lower.startsWith('view-source:') ||
    lower.startsWith('devtools://')
  )
}

// Inlined self-contained DOM extractor for direct execution by background script
function backgroundExtractorFunction() {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

  const url = location.href
  const domain = location.hostname
  const title = document.title
  const capturedAt = new Date().toISOString()

  function clean(s: string): string {
    return (s || '').replace(/\s+/g, ' ').trim()
  }

  function isJunk(el: Element): boolean {
    const junkTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'NAV', 'FOOTER', 'HEADER', 'IFRAME', 'SVG'])
    if (junkTags.has(el.tagName)) return true
    let curr: Element | null = el
    let depth = 0
    while (curr && depth < 4) {
      const cls = (curr.className && typeof curr.className === 'string') ? curr.className : ''
      const idStr = curr.id || ''
      if (/cookie|consent|gdpr|banner|advertisement|newsletter|subscribe|modal|overlay|popup/i.test(cls + ' ' + idStr)) {
        return true
      }
      curr = curr.parentElement
      depth++
    }
    return false
  }

  const sections: string[] = []

  // Headings
  const headings: string[] = []
  document.querySelectorAll('h1, h2, h3').forEach((h) => {
    if (isJunk(h)) return
    const text = clean(h.textContent || '')
    if (text && text.length > 2 && text.length < 200) {
      headings.push(`${h.tagName}: ${text}`)
    }
  })
  if (headings.length > 0) {
    sections.push('=== HEADINGS ===\n' + headings.slice(0, 10).join('\n'))
  }

  // Tables / Specs
  const tables: string[] = []
  document.querySelectorAll('table').forEach((tbl) => {
    if (isJunk(tbl)) return
    const rows: string[] = []
    tbl.querySelectorAll('tr').forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('th, td'))
        .map((c) => clean(c.textContent || ''))
        .filter(Boolean)
      if (cells.length >= 2) rows.push(cells.join(' | '))
    })
    if (rows.length > 0) tables.push(rows.slice(0, 15).join('\n'))
  })
  if (tables.length > 0) {
    sections.push('=== SPECS & TABLES ===\n' + tables.slice(0, 3).join('\n---\n'))
  }

  // Key visible text
  const bodyLines: string[] = []
  document.querySelectorAll('p, li').forEach((el) => {
    if (isJunk(el)) return
    const text = clean(el.textContent || '')
    if (text.length > 30 && text.length < 400) {
      bodyLines.push(text)
    }
  })
  if (bodyLines.length > 0) {
    sections.push('=== CONTENT ===\n' + bodyLines.slice(0, 35).join('\n'))
  }

  let importantText = ''
  for (const s of sections) {
    const sep = importantText ? '\n\n' : ''
    if ((importantText + sep + s).length <= 4000) {
      importantText += sep + s
    } else {
      break
    }
  }

  return { id, url, domain, title, importantText, capturedAt }
}

// Update Extension Action Badge based on number of saved pages
async function updateActionBadge() {
  try {
    const { pages = [] } = await chrome.storage.local.get('pages')
    const count = Array.isArray(pages) ? pages.length : 0
    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count) })
      chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' }) // Indigo
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  } catch (err) {
    console.error('Failed to update action badge:', err)
  }
}

// Universal Add-Tab Handler (Invoked via Right-Click or Shortcut)
async function captureTabToComparison(tab: chrome.tabs.Tab) {
  if (!tab.id || !tab.url || isBrowserInternalUrl(tab.url)) {
    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
    setTimeout(updateActionBadge, 2500)
    return
  }

  try {
    const { pages = [] } = await chrome.storage.local.get('pages')
    if (pages.length >= 4) {
      chrome.action.setBadgeText({ text: 'MAX' })
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' })
      setTimeout(updateActionBadge, 2500)
      return
    }

    if (pages.some((p: any) => p.url === tab.url)) {
      chrome.action.setBadgeText({ text: '✓' })
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' })
      setTimeout(updateActionBadge, 2000)
      return
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: backgroundExtractorFunction,
    })

    const snapshot = results[0]?.result
    if (!snapshot) return

    const updated = [...pages, snapshot]
    await chrome.storage.local.set({ pages: updated })
    await updateActionBadge()

    // Show temporary checkmark badge on successful addition
    chrome.action.setBadgeText({ text: `+${updated.length}` })
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }) // Emerald Green
    setTimeout(updateActionBadge, 1800)
  } catch (e) {
    console.error('Failed to capture tab to comparison:', e)
  }
}

// ── Extension Lifecycle ────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  // 1. Initialize anonymous ID
  const existing = await chrome.storage.local.get('installId')
  let installId = existing.installId
  if (!installId) {
    installId = crypto.randomUUID()
    await chrome.storage.local.set({ installId })
  }

  // 2. Register Right-Click Context Menu item
  chrome.contextMenus.create({
    id: 'compare_add_tab',
    title: '⚡ Add This Tab to Compare Anything (Alt+C)',
    contexts: ['page', 'link', 'selection'],
  })

  await updateActionBadge()
})

// Listen for context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'compare_add_tab' && tab) {
    await captureTabToComparison(tab)
  }
})

// Listen for keyboard command (Alt+C)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'add_to_comparison') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]) {
      await captureTabToComparison(tabs[0])
    }
  }
})

// Listen for storage changes to keep badge synced
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pages) {
    updateActionBadge()
  }
})

chrome.runtime.onStartup.addListener(() => {
  updateActionBadge()
})
