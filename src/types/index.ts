// ─── Shared Types for Compare Anything Extension ─────────────────────────────

/**
 * A captured snapshot of a single web page.
 * Stored in chrome.storage.local and sent to the backend for comparison.
 */
export interface PageSnapshot {
  /** UUID generated at extraction time */
  id: string
  /** Full page URL */
  url: string
  /** Hostname (e.g. "www.ryans.com.bd") */
  domain: string
  /** document.title at time of capture */
  title: string
  /**
   * Prioritised extracted text (≤ 3,500 chars):
   * structured data → tables → headings → body text
   */
  importantText: string
  /** ISO-8601 timestamp */
  capturedAt: string
}

/**
 * Full workspace state persisted in chrome.storage.local.
 */
export interface CompareState {
  /** Selected pages (2–4) */
  pages: PageSnapshot[]
  /** Optional user goal / comparison criteria */
  goal: string
  /** Anonymous UUID generated once on install */
  installId: string
}

/** Tab metadata queried from chrome.tabs */
export interface CurrentTab {
  id: number
  url: string
  title: string
}
