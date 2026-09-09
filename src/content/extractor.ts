/**
 * PageExtractor — DOM Extraction Content Script
 *
 * This module exports `pageExtractorFunction`, a SELF-CONTAINED function
 * designed to be passed directly to `chrome.scripting.executeScript({ func })`.
 *
 * ⚠️  IMPORTANT: The function body must be entirely self-contained.
 *     All helpers must be defined INSIDE the function.
 *     No external imports may be referenced at runtime.
 *
 * Extraction priority (high → low):
 *   1. JSON-LD / schema.org structured data
 *   2. Specification & comparison tables
 *   3. Definition lists (dl/dt/dd)
 *   4. Headings (h1–h3)
 *   5. Key visible body text (paragraphs, price/spec/feature nodes)
 *
 * Scrubbing:
 *   - <script>, <style>, <noscript> content
 *   - <nav>, <header>, <footer>
 *   - Cookie banners, modals, ad containers, tracking iframes
 *
 * Cap: ~3,500 characters, filled in priority order.
 */

export interface PageSnapshot {
  id: string
  url: string
  domain: string
  title: string
  importantText: string
  capturedAt: string
}

/**
 * Self-contained page extraction function.
 * Runs inside the page context via chrome.scripting.executeScript.
 */
export function pageExtractorFunction(): PageSnapshot {
  // ── Constants ─────────────────────────────────────────────────────────────
  const MAX_CHARS = 3500

  // ── Basic Metadata ────────────────────────────────────────────────────────
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

  const url = location.href
  const domain = location.hostname
  const title = document.title
  const capturedAt = new Date().toISOString()

  // ── Internal Helpers ──────────────────────────────────────────────────────

  /** Collapse whitespace and trim */
  function clean(s: string): string {
    return (s || '').replace(/\s+/g, ' ').trim()
  }

  /** Check if element or any ancestor is a junk container */
  function isJunk(el: Element): boolean {
    const junkTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'NAV', 'FOOTER', 'HEADER', 'IFRAME', 'SVG'])
    if (junkTags.has(el.tagName)) return true

    const junkMatchers = [
      /cookie/i, /consent/i, /gdpr/i, /banner/i,
      /^ad[-_]/i, /[-_]ad$/i, /advertisement/i,
      /tracking/i, /analytics/i, /newsletter/i,
      /subscribe/i, /modal/i, /overlay/i, /popup/i,
      /social[-_]share/i, /breadcrumb/i,
    ]

    let cursor: Element | null = el
    while (cursor) {
      const cls = cursor.className || ''
      const id2 = cursor.id || ''
      const tag = cursor.tagName
      if (['NAV', 'FOOTER', 'HEADER'].includes(tag)) return true
      if (cursor.getAttribute('role') === 'navigation') return true
      if (cursor.getAttribute('role') === 'banner') return true
      for (const re of junkMatchers) {
        if (re.test(cls) || re.test(id2)) return true
      }
      cursor = cursor.parentElement
    }
    return false
  }

  /** Check if element is CSS-visible */
  function isVisible(el: Element): boolean {
    try {
      const s = window.getComputedStyle(el)
      return s.display !== 'none'
        && s.visibility !== 'hidden'
        && s.opacity !== '0'
        && (el as HTMLElement).offsetParent !== null
    } catch {
      return true
    }
  }

  /** Recursively flatten a schema.org JSON-LD object to readable text */
  function flattenSchema(obj: unknown, depth = 0): string {
    if (depth > 4) return ''
    if (obj === null || obj === undefined) return ''
    if (typeof obj === 'string') return clean(obj).slice(0, 250)
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
    if (Array.isArray(obj)) {
      return obj
        .map((item) => flattenSchema(item, depth + 1))
        .filter(Boolean)
        .join(' | ')
        .slice(0, 400)
    }
    if (typeof obj === 'object') {
      const SKIP = new Set([
        '@context', '@type', 'url', 'image', 'logo', 'sameAs',
        '@id', 'potentialAction', 'mainEntityOfPage', 'publisher',
        'author', 'datePublished', 'dateModified', 'inLanguage',
      ])
      return Object.entries(obj as Record<string, unknown>)
        .filter(([k]) => !SKIP.has(k))
        .map(([k, v]) => {
          const val = flattenSchema(v, depth + 1)
          return val ? `${k}: ${val}` : ''
        })
        .filter(Boolean)
        .join('\n')
        .slice(0, 800)
    }
    return ''
  }

  // ── Section Collectors ────────────────────────────────────────────────────
  const sections: string[] = []

  // ── 1. JSON-LD / Schema.org Structured Data ───────────────────────────────
  const jsonLdEls = document.querySelectorAll('script[type="application/ld+json"]')
  const schemaLines: string[] = []
  jsonLdEls.forEach((el) => {
    try {
      const data = JSON.parse(el.textContent || '')
      // Handle both single objects and arrays of schema objects
      const items = Array.isArray(data) ? data : [data]
      items.forEach((item) => {
        const type = item['@type'] ? `[${item['@type']}]` : ''
        const body = flattenSchema(item)
        if (body) schemaLines.push(`${type}\n${body}`)
      })
    } catch {
      // Ignore malformed JSON-LD
    }
  })
  if (schemaLines.length > 0) {
    sections.push('=== STRUCTURED DATA ===\n' + schemaLines.join('\n---\n'))
  }

  // ── 2. Specification / Comparison Tables ──────────────────────────────────
  const tableBlocks: string[] = []
  document.querySelectorAll('table').forEach((table) => {
    if (isJunk(table)) return
    if (!isVisible(table)) return

    const rows: string[] = []
    table.querySelectorAll('tr').forEach((row) => {
      const cells = Array.from(row.querySelectorAll('th, td'))
        .map((cell) => clean(cell.textContent || ''))
        .filter((t) => t.length > 0 && t.length < 200)
      if (cells.length >= 2) {
        rows.push(cells.join(' | '))
      }
    })
    if (rows.length >= 2) {
      tableBlocks.push(rows.slice(0, 40).join('\n'))
    }
  })
  if (tableBlocks.length > 0) {
    sections.push('=== SPEC TABLES ===\n' + tableBlocks.join('\n\n'))
  }

  // ── 3. Definition Lists ───────────────────────────────────────────────────
  const dlPairs: string[] = []
  document.querySelectorAll('dl').forEach((dl) => {
    if (isJunk(dl)) return
    if (!isVisible(dl)) return

    const dts = dl.querySelectorAll('dt')
    dts.forEach((dt) => {
      const term = clean(dt.textContent || '')
      if (!term) return
      const sibling = dt.nextElementSibling
      const def = sibling?.tagName === 'DD' ? clean(sibling.textContent || '') : ''
      dlPairs.push(def ? `${term}: ${def}` : term)
    })
  })
  if (dlPairs.length > 0) {
    sections.push('=== KEY SPECS ===\n' + dlPairs.slice(0, 50).join('\n'))
  }

  // ── 4. Headings ───────────────────────────────────────────────────────────
  const headings: string[] = []
  document.querySelectorAll('h1, h2, h3').forEach((el) => {
    if (isJunk(el)) return
    if (!isVisible(el)) return
    const text = clean(el.textContent || '')
    if (text.length > 2 && text.length < 250) {
      headings.push(`${el.tagName}: ${text}`)
    }
  })
  if (headings.length > 0) {
    sections.push('=== HEADINGS ===\n' + headings.slice(0, 20).join('\n'))
  }

  // ── 5. Key Visible Body Text ──────────────────────────────────────────────
  const bodyLines: string[] = []

  // Price/spec/feature elements are high-value — query them first
  const prioritySelectors = [
    '[class*="price"]', '[class*="Price"]', '[id*="price"]',
    '[class*="spec"]', '[class*="feature"]', '[class*="highlight"]',
    '[class*="benefit"]', '[class*="rating"]', '[class*="review"]',
    '[class*="product-detail"]', '[class*="product-info"]',
  ]
  const seen = new Set<string>()

  prioritySelectors.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (isJunk(el) || !isVisible(el)) return
        const text = clean(el.textContent || '')
        if (text.length > 5 && text.length < 400 && !seen.has(text)) {
          seen.add(text)
          bodyLines.push(text)
        }
      })
    } catch {
      // Invalid selector — skip
    }
  })

  // General paragraphs & list items
  document.querySelectorAll('p, li').forEach((el) => {
    if (isJunk(el) || !isVisible(el)) return
    const text = clean(el.textContent || '')
    if (text.length > 25 && text.length < 500 && !seen.has(text)) {
      seen.add(text)
      bodyLines.push(text)
    }
  })

  if (bodyLines.length > 0) {
    sections.push('=== CONTENT ===\n' + bodyLines.slice(0, 60).join('\n'))
  }

  // ── Assemble & Hard-cap at MAX_CHARS ──────────────────────────────────────
  let importantText = ''
  for (const section of sections) {
    const separator = importantText ? '\n\n' : ''
    const candidate = importantText + separator + section
    if (candidate.length <= MAX_CHARS) {
      importantText = candidate
    } else {
      const remaining = MAX_CHARS - importantText.length - separator.length
      if (remaining > 80) {
        importantText += separator + section.slice(0, remaining)
      }
      break
    }
  }

  return { id, url, domain, title, importantText, capturedAt }
}

// When injected directly as a content script, run and store on window
if (typeof window !== 'undefined') {
  (window as any).__compare_page_snapshot = pageExtractorFunction()
}
