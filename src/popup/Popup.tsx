import { useEffect, useState, useCallback } from 'react'
import type { PageSnapshot, CurrentTab } from '../types'
import { getState, addPage, removePage, setGoal, clearAll } from '../storage/compareStorage'
import { pageExtractorFunction } from '../content/PageExtractor'
import PageInfo from './components/PageInfo'
import PageList from './components/PageList'
import GoalInput from './components/GoalInput'
import CompareButton from './components/CompareButton'
import { fetchComparison, ApiError } from '../services/api'

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
    return '+ ADD TO COMPARISON'
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

      {/* ── Footer: Clear ───────────────────────────────────────────────── */}
      {pages.length > 0 && (
        <div className="px-4 pb-4 flex justify-center">
          <button
            id="clear-comparison-btn"
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear all pages from comparison"
          >
            Clear Comparison
          </button>
        </div>
      )}
    </div>
  )
}
