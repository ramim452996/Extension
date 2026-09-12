import { useEffect, useState, useCallback } from 'react'
import type { PageSnapshot, CurrentTab } from '../types'
import { getState, addPage, removePage, setGoal, clearAll } from '../storage/compareStorage'
import { pageExtractorFunction } from '../content/extractor'
import PageInfo from './components/PageInfo'
import PageList from './components/PageList'
import GoalInput from './components/GoalInput'
import CompareButton from './components/CompareButton'
import { fetchComparison, sendAnalyticsEvent, ApiError } from '../services/api'

// ── Status ────────────────────────────────────────────────────────────────────
type Status = 'init' | 'ready' | 'extracting' | 'comparing' | 'error'

// ── Helpers ───────────────────────────────────────────────────────────────────
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

interface OpenTabItem {
  id: number
  title: string
  url: string
  domain: string
  isAdded: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Popup() {
  const [pages, setPages] = useState<PageSnapshot[]>([])
  const [goal, setGoalState] = useState('')
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null)
  const [allTabs, setAllTabs] = useState<OpenTabItem[]>([])
  const [tabPickerOpen, setTabPickerOpen] = useState(false)
  const [status, setStatus] = useState<Status>('init')
  const [errorMsg, setErrorMsg] = useState('')
  const [hasSeenPrivacyNotice, setHasSeenPrivacyNotice] = useState<boolean>(true)

  // ── Derived state ────────────────────────────────────────────────────────
  const isBrowserPage = isBrowserInternalUrl(currentTab?.url)
  const isDuplicate = !isBrowserPage && !!currentTab?.url && pages.some((p) => p.url === currentTab.url)
  const isAtMax = pages.length >= 4
  const canAdd = !isBrowserPage && !isDuplicate && !isAtMax && status !== 'extracting' && status !== 'comparing'

  // ── Refresh Open Tabs List ───────────────────────────────────────────────
  const refreshOpenTabs = useCallback((currentPages: PageSnapshot[]) => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const list: OpenTabItem[] = []
        for (const t of tabs) {
          if (t.id && t.url && !isBrowserInternalUrl(t.url)) {
            let domain = ''
            try {
              domain = new URL(t.url).hostname
            } catch {
              domain = t.url
            }
            list.push({
              id: t.id,
              title: t.title || 'Untitled',
              url: t.url,
              domain,
              isAdded: currentPages.some((p) => p.url === t.url),
            })
          }
        }
        setAllTabs(list)
      })
    }
  }, [])

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      // Load persisted state
      const state = await getState()
      setPages(state.pages)
      setGoalState(state.goal)

      const stored = await chrome.storage.local.get(['hasSeenPrivacyNotice'])
      if (stored.hasSeenPrivacyNotice === undefined || stored.hasSeenPrivacyNotice === false) {
        setHasSeenPrivacyNotice(false)
      } else {
        setHasSeenPrivacyNotice(true)
      }

      if (!state.installId) {
        state.installId = 'install-' + Math.random().toString(36).substr(2, 9)
        await chrome.storage.local.set({ installId: state.installId })
      }

      // Query active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        if (tab && tab.id) {
          setCurrentTab({
            id: tab.id,
            url: tab.url ?? '',
            title: tab.title ?? 'Untitled',
          })
        }
        setStatus('ready')
      })

      refreshOpenTabs(state.pages)
    }
    init()
  }, [refreshOpenTabs])

  // Keep allTabs sync'd when pages change
  useEffect(() => {
    refreshOpenTabs(pages)
  }, [pages, refreshOpenTabs])

  // ── Core capture function for any tab ID ─────────────────────────────────
  const captureTabById = useCallback(async (tabId: number, tabUrl?: string) => {
    if (pages.length >= 4) {
      setErrorMsg('Maximum 4 pages reached.')
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 3500)
      return
    }

    if (tabUrl && pages.some((p) => p.url === tabUrl)) {
      setErrorMsg('This page is already in your comparison.')
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 3500)
      return
    }

    setStatus('extracting')
    setErrorMsg('')

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: pageExtractorFunction,
      })

      const snapshot = results[0]?.result
      if (!snapshot) throw new Error('Could not extract page text.')

      const { pages: currentPages } = await getState()
      if (currentPages.some((p) => p.url === snapshot.url)) {
        setErrorMsg('This page is already in your comparison.')
        setStatus('error')
        setTimeout(() => {
          setStatus('ready')
          setErrorMsg('')
        }, 3500)
        return
      }

      const updated = await addPage(snapshot)
      setPages(updated)
      setStatus('ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(`Could not capture page: ${message}`)
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 3500)
    }
  }, [pages])

  // ── Add current page ─────────────────────────────────────────────────────
  const handleAddPage = useCallback(async () => {
    if (!currentTab?.id) return

    if (isBrowserPage) {
      setErrorMsg('Browser system pages (chrome://, edge://) cannot be added.')
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 4000)
      return
    }

    await captureTabById(currentTab.id, currentTab.url)
  }, [currentTab, isBrowserPage, captureTabById])

  // ── Remove a page ────────────────────────────────────────────────────────
  const handleRemove = useCallback(async (id: string) => {
    const updated = await removePage(id)
    setPages(updated)
  }, [])

  // ── Goal update ──────────────────────────────────────────────────────────
  const handleGoalChange = useCallback(async (value: string) => {
    setGoalState(value)
    await setGoal(value)
  }, [])

  // ── Clear workspace ──────────────────────────────────────────────────────
  const handleClear = useCallback(async () => {
    await clearAll()
    setPages([])
    setGoalState('')
  }, [])

  // ── Compare ──────────────────────────────────────────────────────────────
  const handleCompare = useCallback(async () => {
    if (pages.length < 2) return

    setStatus('comparing')
    setErrorMsg('')

    try {
      const state = await getState()
      const installId = state.installId || 'fallback-install-id'

      sendAnalyticsEvent('comparison_started', {
        installId,
        numberOfPages: pages.length,
      })

      const result = await fetchComparison(installId, goal, pages)
      await chrome.storage.local.set({ latestComparison: result })
      chrome.tabs.create({ url: chrome.runtime.getURL('results.html') })
      setStatus('ready')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setErrorMsg(`Failed to compare: ${message}`)
      }
      setStatus('error')
    }
  }, [pages, goal])

  // ── Add button label / disabled logic ────────────────────────────────────
  function addButtonLabel(): string {
    if (status === 'extracting') return 'Extracting page…'
    if (status === 'comparing') return 'Comparing pages…'
    if (isBrowserPage) return 'Cannot add system page'
    if (isAtMax) return 'Maximum 4 pages reached'
    if (isDuplicate) return 'Already in comparison ✓'
    return '+ ADD CURRENT TAB'
  }

  function addButtonClass(): string {
    if (isAtMax || isBrowserPage) return 'add-btn add-btn-disabled'
    if (isDuplicate) return 'add-btn add-btn-duplicate'
    return 'add-btn add-btn-active'
  }

  const unaddedTabs = allTabs.filter((t) => !t.isAdded && t.id !== currentTab?.id)

  if (status === 'init') {
    return (
      <div className="popup-loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="popup-scroll">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="popup-header">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <h1 className="text-[15px] font-bold gradient-text leading-none">
              Compare Anything
            </h1>
            <p className="text-[10px] text-white/40 mt-0.5 font-medium tracking-wide">
              Instant Tab & Web Comparison
            </p>
          </div>
          {pages.length > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-white/10 rounded-full px-2 py-0.5 text-white/70">
              {pages.length}/4
            </span>
          )}
        </div>
      </header>

      {/* ── Current Page Info ────────────────────────────────────────────── */}
      <PageInfo currentTab={currentTab} isBrowserPage={isBrowserPage} />

      {/* ── First-Use Privacy Disclosure Notice ─────────────────────────── */}
      {!hasSeenPrivacyNotice && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-left text-xs text-white/90 shadow-lg">
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-base leading-none">🛡️</span>
            <div className="font-semibold text-indigo-200">How Your Data is Handled</div>
          </div>
          <p className="text-[11px] leading-relaxed text-indigo-100/80 mb-2">
            Compare Anything extracts relevant text from webpages you explicitly add. When you click <strong>Compare</strong>, that extracted information is securely sent via HTTPS to our server and AI provider to generate the comparison.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-indigo-500/20">
            <a
              href="https://ramim452996.github.io/Extension/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-300 hover:text-white underline"
            >
              Privacy Policy
            </a>
            <button
              onClick={async () => {
                await chrome.storage.local.set({ hasSeenPrivacyNotice: true })
                setHasSeenPrivacyNotice(true)
              }}
              className="px-2.5 py-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Status Alerts ───────────────────────────────────────────────── */}
      <div className="px-4 pt-3 space-y-2">
        {status === 'error' && errorMsg && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {isBrowserPage && (
          <div className="alert alert-info">
            <span>🔒</span>
            <span>Browser system pages (chrome://, edge://) cannot be added.</span>
          </div>
        )}
        {isDuplicate && !isBrowserPage && (
          <div className="alert alert-warning">
            <span>⚠️</span>
            <span>This page is already in your comparison.</span>
          </div>
        )}

        {/* ── Add Button ──────────────────────────────────────────────── */}
        <button
          id="add-to-comparison-btn"
          className={addButtonClass()}
          onClick={handleAddPage}
          disabled={!canAdd}
          aria-label="Add current page to comparison"
        >
          {status === 'extracting' ? (
            <>
              <span className="spinner" />
              <span>Extracting page…</span>
            </>
          ) : status === 'comparing' ? (
            <>
              <span className="spinner" />
              <span>Comparing pages…</span>
            </>
          ) : (
            addButtonLabel()
          )}
        </button>

        {/* ── Professional Quick Tip / Shortcut Badge ────────────────────── */}
        <div className="flex items-center justify-between text-[10px] text-white/40 px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <span>💡</span> Pro Tip:
          </span>
          <span className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-indigo-300 font-mono font-medium">
            Alt + C
          </span>
          <span className="text-white/30">adds current tab from anywhere</span>
        </div>

        {/* ── 1-CLICK TAB PICKER: Add any other open tab directly without switching! ── */}
        {unaddedTabs.length > 0 && !isAtMax && (
          <div className="pt-1.5">
            <button
              onClick={() => setTabPickerOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-indigo-950/50 to-blue-950/40 hover:from-indigo-900/60 hover:to-blue-900/50 border border-indigo-500/25 rounded-xl text-xs font-semibold text-indigo-200 transition-all shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">📑</span>
                <span>Add from Open Tabs</span>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unaddedTabs.length}
                </span>
              </span>
              <span className="text-[11px] font-medium text-indigo-400">
                {tabPickerOpen ? '▲ Hide' : '▼ Quick Pick'}
              </span>
            </button>

            {tabPickerOpen && (
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {unaddedTabs.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/30 transition-all gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-medium text-white/95 truncate">
                        {t.title}
                      </p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">
                        {t.domain}
                      </p>
                    </div>
                    <button
                      onClick={() => captureTabById(t.id, t.url)}
                      disabled={status === 'extracting'}
                      className="shrink-0 px-2.5 py-1 text-[10.5px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-sm active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Page List ───────────────────────────────────────────────────── */}
      <PageList pages={pages} onRemove={handleRemove} />

      {/* ── Goal Input ──────────────────────────────────────────────────── */}
      {pages.length > 0 && (
        <GoalInput value={goal} onChange={handleGoalChange} />
      )}

      {/* ── Compare Button ──────────────────────────────────────────────── */}
      <CompareButton pages={pages} onClick={handleCompare} />

      {/* ── Footer: Clear & Privacy ─────────────────────────────────────── */}
      <div className="px-4 pb-3 pt-1 flex flex-col items-center gap-1.5">
        {pages.length > 0 && (
          <button
            id="clear-comparison-btn"
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear all pages from comparison"
          >
            Clear Comparison
          </button>
        )}
        <div className="text-[10px] text-white/30 text-center">
          Pages accessed only on your click &bull;{' '}
          <a
            href="https://ramim452996.github.io/Extension/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 underline"
          >
            Privacy
          </a>
          {' '}&bull;{' '}
          <a
            href="https://ramim452996.github.io/Extension/support.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 underline"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  )
}
