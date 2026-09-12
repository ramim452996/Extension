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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Popup() {
  const [pages, setPages] = useState<PageSnapshot[]>([])
  const [goal, setGoalState] = useState('')
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null)
  const [status, setStatus] = useState<Status>('init')
  const [errorMsg, setErrorMsg] = useState('')
  const [hasSeenPrivacyNotice, setHasSeenPrivacyNotice] = useState<boolean>(true)

  // ── Derived state ────────────────────────────────────────────────────────
  const isBrowserPage = isBrowserInternalUrl(currentTab?.url)
  const isDuplicate = !isBrowserPage && !!currentTab?.url && pages.some((p) => p.url === currentTab.url)
  const isAtMax = pages.length >= 4
  const canAdd = !isBrowserPage && !isDuplicate && !isAtMax && status !== 'extracting' && status !== 'comparing'

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

      // Get installId (should be set by background script or generated on init)
      // Since it's required for the API, ensure it exists in state
      if (!state.installId) {
        // Fallback in case background hasn't set it yet
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
    }
    init()
  }, [])

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

    if (pages.some((p) => p.url === currentTab.url)) {
      setErrorMsg('This page is already in your comparison.')
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 4000)
      return
    }

    if (pages.length >= 4) {
      setErrorMsg('Maximum 4 pages reached.')
      setStatus('error')
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 4000)
      return
    }

    setStatus('extracting')
    setErrorMsg('')

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: pageExtractorFunction,
      })

      const snapshot = results[0]?.result
      if (!snapshot) throw new Error('Extractor returned no data.')

      // Double-check duplicates against storage state
      const { pages: currentPages } = await getState()
      if (currentPages.some((p) => p.url === snapshot.url)) {
        setErrorMsg('This page is already in your comparison.')
        setStatus('error')
        setTimeout(() => {
          setStatus('ready')
          setErrorMsg('')
        }, 4000)
        return
      }

      const updated = await addPage(snapshot)
      setPages(updated)
      setStatus('ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(`Could not capture page: ${message}`)
      setStatus('error')
      // Auto-clear error after 4s
      setTimeout(() => {
        setStatus('ready')
        setErrorMsg('')
      }, 4000)
    }
  }, [currentTab, isBrowserPage, pages])

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

      // Fire non-blocking anonymous product metric
      sendAnalyticsEvent('comparison_started', {
        installId,
        numberOfPages: pages.length,
      })

      const result = await fetchComparison(installId, goal, pages)
      
      // Save result to storage
      await chrome.storage.local.set({ latestComparison: result })
      
      // Open results page
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
    return '+ ADD TO COMPARISON (Alt+C)'
  }

  function addButtonClass(): string {
    if (isAtMax || isBrowserPage) return 'add-btn add-btn-disabled'
    if (isDuplicate) return 'add-btn add-btn-duplicate'
    return 'add-btn add-btn-active'
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
            <p className="text-[10px] text-white/30 mt-0.5 font-medium tracking-wide">
              AI-powered page comparison
            </p>
          </div>
          {pages.length > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-white/10 rounded-full px-2 py-0.5 text-white/60">
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
          {status === 'extracting' || status === 'comparing' ? (
            <>
              <span className="spinner" />
              {status === 'extracting' ? 'Extracting page…' : 'Comparing pages…'}
            </>
          ) : (
            addButtonLabel()
          )}
        </button>
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
