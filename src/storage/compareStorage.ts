/**
 * compareStorage — Typed chrome.storage.local wrapper
 *
 * Manages:
 *  - pages: PageSnapshot[]   (max 4)
 *  - goal: string            (optional comparison criteria)
 *  - installId: string       (anonymous UUID from service worker)
 */

import type { CompareState, PageSnapshot } from '../types'

const MAX_PAGES = 4

// ── Default State ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: CompareState = {
  pages: [],
  goal: '',
  installId: '',
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** Load the full workspace state from chrome.storage.local */
export async function getState(): Promise<CompareState> {
  const result = await chrome.storage.local.get(['pages', 'goal', 'installId'])
  return {
    pages: (result.pages as PageSnapshot[]) ?? DEFAULT_STATE.pages,
    goal: (result.goal as string) ?? DEFAULT_STATE.goal,
    installId: (result.installId as string) ?? DEFAULT_STATE.installId,
  }
}

// ── Pages ─────────────────────────────────────────────────────────────────────

/**
 * Add a page snapshot to the list (enforces max 4, no duplicates by URL).
 * Returns the updated pages array.
 */
export async function addPage(snapshot: PageSnapshot): Promise<PageSnapshot[]> {
  const { pages } = await getState()

  // Guard: max 4 pages
  if (pages.length >= MAX_PAGES) return pages

  // Guard: no duplicate URLs
  if (pages.some((p) => p.url === snapshot.url)) return pages

  const updated = [...pages, snapshot]
  await chrome.storage.local.set({ pages: updated })
  return updated
}

/**
 * Remove a page by its id.
 * Returns the updated pages array.
 */
export async function removePage(id: string): Promise<PageSnapshot[]> {
  const { pages } = await getState()
  const updated = pages.filter((p) => p.id !== id)
  await chrome.storage.local.set({ pages: updated })
  return updated
}

// ── Goal ──────────────────────────────────────────────────────────────────────

/** Persist the optional comparison goal string */
export async function setGoal(goal: string): Promise<void> {
  await chrome.storage.local.set({ goal })
}

// ── Clear & Reset ─────────────────────────────────────────────────────────────

/**
 * Wipe all workspace state (pages + goal).
 * Preserves installId — it is permanent and anonymous.
 * Also clears cached comparison results as required by SPEC Section 24.
 */
export async function clearAll(): Promise<void> {
  await chrome.storage.local.set({ pages: [], goal: '' })
  await chrome.storage.local.remove(['selectedPages', 'comparisonResult', 'userGoal', 'latestComparison'])
}

/**
 * Explicitly remove comparison payloads on user reset/start new.
 */
export async function resetStorage(): Promise<void> {
  await chrome.storage.local.remove([
    'pages',
    'goal',
    'selectedPages',
    'comparisonResult',
    'userGoal',
    'latestComparison',
  ])
}
