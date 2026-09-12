import { useEffect, useRef, useState, useMemo } from 'react'
import { toPng } from 'html-to-image'
import { copyAsMarkdown, downloadCSV } from '../utils/export'

// ── Render Protection Helpers ──────────────────────────────────────────────────
function isMissingOrInvalid(val: unknown): boolean {
  if (val === undefined || val === null) return true
  if (typeof val === 'number' && Number.isNaN(val)) return true
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase()
    return (
      lower === '' ||
      lower === 'nan' ||
      lower === 'null' ||
      lower === 'undefined' ||
      lower === 'not stated' ||
      lower === 'none' ||
      lower === 'n/a'
    )
  }
  return false
}

function safeText(val: unknown, fallback = 'Not stated'): string {
  if (isMissingOrInvalid(val)) return fallback
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val)
    } catch {
      return fallback
    }
  }
  return String(val)
}

function renderFallbackMuted(text = 'Not stated', isLight = false) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${
        isLight
          ? 'text-gray-500 bg-gray-100 border-gray-200'
          : 'text-gray-400 bg-gray-800/80 border-gray-700/50'
      }`}
    >
      {text}
    </span>
  )
}

function renderValue(value: unknown, isLight = false) {
  if (isMissingOrInvalid(value)) {
    return renderFallbackMuted('Not stated', isLight)
  }
  return <span className="break-words whitespace-normal leading-relaxed">{safeText(value)}</span>
}

/**
 * Domain-specific priority scoring dictionary.
 * Keywords matched against criterion names to assign priority weights.
 */
const DOMAIN_PRIORITY_KEYWORDS: { pattern: RegExp; weight: number }[] = [
  // High critical differentiators across domains
  { pattern: /price|cost|salary|compensation|tuition|rate|fee/i, weight: 100 },
  { pattern: /display|screen|resolution|panel/i, weight: 90 },
  { pattern: /processor|chipset|cpu|gpu|hardware/i, weight: 85 },
  { pattern: /camera|lens|sensor|megapixels|video/i, weight: 80 },
  { pattern: /battery|charging|endurance|runtime/i, weight: 80 },
  { pattern: /ram|memory|storage|capacity|disk/i, weight: 75 },
  { pattern: /role|responsibilities|experience|skills|stack/i, weight: 75 },
  { pattern: /work arrangement|remote|hybrid|location/i, weight: 75 },
  { pattern: /core features|integrations|api|security/i, weight: 70 },
  { pattern: /curriculum|duration|credential|accreditation/i, weight: 70 },
  { pattern: /operating system|software|updates|os/i, weight: 65 },
  { pattern: /build quality|materials|durability|water resistance|ip rating/i, weight: 60 },
  { pattern: /warranty|guarantee|return policy|support/i, weight: 55 },
  { pattern: /dimensions|weight|size|weight & size/i, weight: 50 },
  { pattern: /connectivity|ports|bluetooth|wifi|5g|nfc/i, weight: 45 },
]

export default function Results() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copyToast, setCopyToast] = useState(false)
  const [exportingImage, setExportingImage] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  // Light / Dark Theme State (Defaults to Light View per user request, persists in chrome.storage/localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const comparisonContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load persisted theme preference if set; default to 'light'
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['resultsTheme', 'latestComparison', 'comparisonResult'], (result) => {
        if (result.resultsTheme === 'dark' || result.resultsTheme === 'light') {
          setTheme(result.resultsTheme)
        } else {
          // Default to light mode
          setTheme('light')
        }
        const active = result.latestComparison || result.comparisonResult
        if (active) {
          setData(active)
        }
        setLoading(false)
      })
    } else {
      const savedTheme = localStorage.getItem('resultsTheme') as 'light' | 'dark' | null
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme)
      } else {
        setTheme('light')
      }
      setLoading(false)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ resultsTheme: next })
    } else {
      localStorage.setItem('resultsTheme', next)
    }
  }

  const isLight = theme === 'light'

  const handleCopyMarkdown = async () => {
    const success = await copyAsMarkdown(data)
    if (success) {
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2500)
    }
  }

  const handleDownloadImage = async () => {
    if (!comparisonContentRef.current) return
    try {
      setExportingImage(true)
      const dataUrl = await toPng(comparisonContentRef.current, {
        cacheBust: true,
        backgroundColor: isLight ? '#f8fafc' : '#030712',
        pixelRatio: 2,
      })
      setGeneratedImageUrl(dataUrl)

      // Download PNG file directly
      const a = document.createElement('a')
      const sanitizedTitle = (data?.comparisonTitle || data?.title || 'comparison')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      a.href = dataUrl
      a.download = `${sanitizedTitle || 'comparison'}.png`
      a.click()
    } catch (err) {
      console.error('Failed to export comparison as image:', err)
      alert('Unable to generate image. Please try again.')
    } finally {
      setExportingImage(false)
    }
  }

  const handleOpenShareModal = async () => {
    setShareModalOpen(true)
    if (!generatedImageUrl && comparisonContentRef.current) {
      try {
        setExportingImage(true)
        const dataUrl = await toPng(comparisonContentRef.current, {
          cacheBust: true,
          backgroundColor: isLight ? '#f8fafc' : '#030712',
          pixelRatio: 2,
        })
        setGeneratedImageUrl(dataUrl)
      } catch (e) {
        console.error('Could not pre-render image:', e)
      } finally {
        setExportingImage(false)
      }
    }
  }

  const getShareText = () => {
    const title = safeText(data?.comparisonTitle || data?.title, 'Web Comparison')
    const winner = data?.bestOverall?.itemId
      ? (data?.items?.find((i: any) => i.id === data.bestOverall.itemId)?.displayName || data.bestOverall.itemId)
      : null
    return winner
      ? `Check out this comparison: ${title}. Best Overall: ${winner} ⚡ Generated with Compare Anything.`
      : `Check out this side-by-side comparison: ${title} ⚡ Generated with Compare Anything.`
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent('https://compareanything.com')
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=450')
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent('https://compareanything.com')
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=550')
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent('https://compareanything.com')
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleStartNew = async () => {
    await chrome.storage.local.remove([
      'pages',
      'goal',
      'selectedPages',
      'comparisonResult',
      'userGoal',
      'latestComparison',
    ])
    window.close()
  }

  // ── Items and Dynamic Priority Criteria ──────────────────────────────────────
  const items = Array.isArray(data?.items) ? data.items : []
  const rawCriteria = Array.isArray(data?.criteria) ? data.criteria : []
  const itemCount = items.length || 2
  const tableMinWidth = Math.max(700, itemCount * 210 + 220)

  // Determine key priority according to comparable items:
  // Sorts criteria so High importance & domain-critical differentiators appear at the top.
  const prioritizedCriteria = useMemo(() => {
    const getImportanceScore = (c: any) => {
      let score = 0
      const imp = String(c.importance || 'medium').toLowerCase()
      if (imp === 'high') score += 1000
      else if (imp === 'medium') score += 500
      else score += 100

      // Winner decider boost (criteria with definitive differentiated winner)
      if (Array.isArray(c.winnerItemIds) && c.winnerItemIds.length > 0) {
        score += 200
      }

      // Keyword domain relevance matching
      const name = String(c.name || '').trim()
      for (const kw of DOMAIN_PRIORITY_KEYWORDS) {
        if (kw.pattern.test(name)) {
          score += kw.weight
          break
        }
      }

      // Penalize criteria where all items are unstated/missing
      const allMissing = c.values?.every((v: any) => isMissingOrInvalid(v.value))
      if (allMissing) {
        score -= 300
      }

      return score
    }

    return [...rawCriteria].sort((a, b) => getImportanceScore(b) - getImportanceScore(a))
  }, [rawCriteria])

  // Filtered criteria based on user filter chips
  const filteredCriteria = useMemo(() => {
    if (priorityFilter === 'all') return prioritizedCriteria
    return prioritizedCriteria.filter((c: any) => {
      const imp = String(c.importance || 'medium').toLowerCase()
      return imp === priorityFilter
    })
  }, [prioritizedCriteria, priorityFilter])

  // Best For items list
  const bestForList = Array.isArray(data?.bestFor) ? data.bestFor : []

  // Key Differences list
  const differencesList = Array.isArray(data?.keyDifferences)
    ? data.keyDifferences
    : Array.isArray(data?.importantDifferences)
    ? data.importantDifferences
    : []

  // Missing Information list
  const missingInfoList = Array.isArray(data?.missingInformation) ? data.missingInformation : []

  // Source Links list
  const sourceLinksList = Array.isArray(data?.sourceLinks) ? data.sourceLinks : []

  // Evaluate Best Overall data & Final Verdict Engine
  const bestOverallObj = data?.bestOverall
  const winnerItem = bestOverallObj?.itemId
    ? items.find((i: any) => i.id === bestOverallObj.itemId)
    : null
  const winnerTitle = winnerItem
    ? winnerItem.displayName
    : bestOverallObj?.itemId
    ? bestOverallObj.itemId
    : 'No Single Winner (Tied / Incomparable Trade-offs)'
  const verdictSummary = bestOverallObj?.verdictSummary
    ? safeText(bestOverallObj.verdictSummary)
    : null
  const decisionConfidence: string = bestOverallObj?.decisionConfidence || (winnerItem ? 'high' : 'cautious')

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-gray-950 text-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Handle Error States
  if (!data) {
    return (
      <div className={`flex flex-col h-screen items-center justify-center p-8 text-center ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-gray-950 text-white'}`}>
        <span className="text-4xl mb-4">⚠️</span>
        <h1 className="text-2xl font-bold mb-2">No Comparison Data Found</h1>
        <p className={`mb-6 max-w-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Please select 2 to 4 pages and start a comparison from the extension popup.
        </p>
        <button
          onClick={handleStartNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Return to Extension
        </button>
      </div>
    )
  }

  if (data.error) {
    let errorMsg = "Comparison couldn't be generated. Please try again."
    if (data.status === 429) {
      errorMsg = "Today's free comparison limit has been reached. Please try again later."
    } else if (data.status === 503) {
      errorMsg = 'Compare Anything is temporarily unavailable.'
    }
    return (
      <div className={`flex flex-col h-screen items-center justify-center p-8 text-center ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-gray-950 text-white'}`}>
        <span className="text-4xl mb-4">❌</span>
        <h1 className="text-2xl font-bold mb-2">Error Generating Comparison</h1>
        <p className="text-red-500 max-w-md mb-6">{errorMsg}</p>
        <button
          onClick={handleStartNew}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${
            isLight
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
              : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
          }`}
        >
          Start New Comparison
        </button>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-900'
          : 'bg-gray-950 text-gray-100'
      } p-5 md:p-8`}
    >
      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* ── 1. HEADER BLOCK (SPEC Section 21.1) ────────────────────────── */}
        <header
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5 ${
            isLight ? 'border-slate-200' : 'border-gray-800'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight break-words ${
                  isLight
                    ? 'text-slate-900'
                    : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400'
                }`}
              >
                {safeText(data.comparisonTitle || data.title, 'Comparison Matrix')}
              </h1>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                  : 'bg-gray-900 border-gray-800 text-gray-300'
              }`}
            >
              <span className="font-semibold text-blue-500">Goal:</span>
              <span className="truncate max-w-md">{safeText(data.goal, 'Objective Comparison')}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border flex items-center gap-1.5 shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-gray-800 hover:bg-gray-700 text-amber-300 border-gray-700'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <span>{isLight ? '🌙' : '☀️'}</span>
              <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button 
              onClick={handleCopyMarkdown}
              className={`relative px-3 py-2 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1.5 shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
              }`}
              title="Copy comparison as formatted Markdown table"
            >
              <span>📋</span>
              <span>Markdown</span>
              {copyToast && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-fade-in">
                  Copied!
                </span>
              )}
            </button>

            <button 
              onClick={() => downloadCSV(data)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download comparison as RFC-4180 CSV"
            >
              <span>📥</span>
              <span>CSV</span>
            </button>

            <button 
              onClick={handleDownloadImage}
              disabled={exportingImage}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Export comparison matrix as a shareable PNG image"
            >
              <span>🖼️</span>
              <span>{exportingImage ? 'Generating...' : 'Save Image'}</span>
            </button>

            <button 
              onClick={handleOpenShareModal}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Share comparison directly"
            >
              <span>🚀</span>
              <span>Share</span>
            </button>

            <button 
              onClick={handleStartNew}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1.5 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border-gray-800'
              }`}
              title="Clear workspace and return to tab selection"
            >
              <span>🔄</span>
              <span>Start New</span>
            </button>
          </div>
        </header>

        {/* ── EXPORTABLE COMPARISON AREA ─────────────────────────────────── */}
        <div
          ref={comparisonContentRef}
          className={`space-y-7 p-3 sm:p-5 rounded-2xl transition-colors duration-200 ${
            isLight
              ? 'bg-white border border-slate-200/80 shadow-md'
              : 'bg-gray-950 border border-gray-800/80'
          }`}
        >
          {/* Comparison watermark banner */}
          <div
            className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-100' : 'border-gray-800/80'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                isLight ? 'text-slate-700' : 'text-gray-400'
              }`}
            >
              <span className="text-blue-500">⚡</span> Compare Anything
            </div>
            <div className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
              Objective Zero-Hallucination Comparison
            </div>
          </div>

          {/* ── 2. FINAL DECISION VERDICT ───── */}
          <section
            className={`relative overflow-hidden rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 border ${
              isLight
                ? 'bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 border-indigo-200 text-slate-900'
                : 'bg-gradient-to-br from-indigo-950/60 via-gray-900 to-purple-950/40 border-indigo-500/40 text-white'
            }`}
          >
            {/* Header / Badges */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
                isLight ? 'border-indigo-100' : 'border-indigo-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-xl text-lg shadow-sm ${
                    isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  🏆
                </span>
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      isLight ? 'text-indigo-600' : 'text-indigo-400'
                    }`}
                  >
                    Decision Engine Verdict
                  </span>
                  <h2
                    className={`text-xl sm:text-2xl font-black tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {winnerTitle}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    decisionConfidence === 'high'
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : decisionConfidence === 'medium'
                      ? isLight
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      decisionConfidence === 'high'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  Confidence: {decisionConfidence.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Executive Bottom Line */}
            {verdictSummary && (
              <div
                className={`rounded-xl p-4 border ${
                  isLight
                    ? 'bg-white/90 border-indigo-100 shadow-sm'
                    : 'bg-indigo-950/40 border-indigo-500/20'
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                    isLight ? 'text-indigo-600' : 'text-indigo-300'
                  }`}
                >
                  Executive Bottom Line
                </span>
                <p
                  className={`text-base font-semibold leading-relaxed ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  {verdictSummary}
                </p>
              </div>
            )}
          </section>

          {/* ── 3. COMPARISON TABLE WITH KEY PRIORITY SORT & FILTER ───────── */}
          <section
            className={`rounded-xl border overflow-hidden shadow-lg transition-colors ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            {/* Priority Filter Bar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200'
                  : 'bg-gray-900/90 border-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  ⚡ Key Priority Ordering:
                </span>
                <span
                  className={`text-xs font-medium ${
                    isLight ? 'text-slate-500' : 'text-gray-400'
                  }`}
                >
                  Ranked by comparable domain impact & stated winner
                </span>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5">
                {(['all', 'high', 'medium', 'low'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setPriorityFilter(filterVal)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                      priorityFilter === filterVal
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight
                        ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {filterVal === 'all' ? `All Criteria (${prioritizedCriteria.length})` : `${filterVal} Priority`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table 
                className="w-full text-left border-collapse table-auto"
                style={{ minWidth: `${tableMinWidth}px` }}
              >
                <thead>
                  <tr
                    className={`border-b ${
                      isLight
                        ? 'bg-slate-100/90 border-slate-200 text-slate-800'
                        : 'bg-gray-800/70 border-gray-700 text-gray-200'
                    }`}
                  >
                    <th className="p-4 font-semibold w-1/4 min-w-[180px] max-w-[240px] align-bottom">
                      Criteria (Prioritized)
                    </th>
                    {items.map((item: any) => (
                      <th
                        key={item.id}
                        className={`p-4 font-semibold border-l min-w-[180px] align-bottom ${
                          isLight ? 'border-slate-200' : 'border-gray-800/80'
                        }`}
                      >
                        <div
                          className={`font-bold text-base break-words whitespace-normal leading-snug ${
                            isLight ? 'text-slate-900' : 'text-gray-100'
                          }`}
                        >
                          {safeText(item.displayName, 'Item')}
                        </div>
                        {!isMissingOrInvalid(item.shortDescription) && (
                          <p
                            className={`text-xs font-normal mt-1 line-clamp-2 break-words ${
                              isLight ? 'text-slate-500' : 'text-gray-400'
                            }`}
                          >
                            {safeText(item.shortDescription)}
                          </p>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800'}`}>
                  {filteredCriteria.map((c: any, idx: number) => {
                    const importanceStr = safeText(c.importance, 'medium').toLowerCase()
                    const isHigh = importanceStr === 'high'
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isLight
                            ? 'hover:bg-slate-50/80'
                            : 'hover:bg-gray-800/30'
                        }`}
                      >
                        <td className="p-4 align-top w-1/4 min-w-[180px] max-w-[240px]">
                          <div
                            className={`font-semibold break-words whitespace-normal leading-snug ${
                              isLight ? 'text-slate-800' : 'text-gray-200'
                            }`}
                          >
                            {safeText(c.name, 'Criterion')}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`inline-block text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                                isHigh
                                  ? isLight
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-rose-950/70 text-rose-300 border border-rose-700/50'
                                  : isLight
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {importanceStr} priority
                            </span>
                          </div>
                        </td>
                        {items.map((item: any) => {
                          const valObj = c.values?.find((v: any) => v.itemId === item.id)
                          const isWinner = Array.isArray(c.winnerItemIds) && c.winnerItemIds.includes(item.id)
                          return (
                            <td 
                              key={item.id} 
                              className={`p-4 align-top border-l min-w-[180px] ${
                                isLight ? 'border-slate-200' : 'border-gray-800/80'
                              } ${
                                isWinner
                                  ? isLight
                                    ? 'bg-emerald-50/70'
                                    : 'bg-emerald-950/20'
                                  : ''
                              }`}
                            >
                              <div
                                className={`flex flex-col gap-1.5 ${
                                  isWinner
                                    ? isLight
                                      ? 'text-emerald-900 font-semibold'
                                      : 'text-emerald-300 font-medium'
                                    : isLight
                                    ? 'text-slate-800'
                                    : 'text-gray-300'
                                }`}
                              >
                                {isWinner && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold rounded px-1.5 py-0.5 w-fit ${
                                      isLight
                                        ? 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                                        : 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/40'
                                    }`}
                                  >
                                    <span>✓</span> Winner
                                  </span>
                                )}
                                <div className="break-words whitespace-normal leading-relaxed text-sm py-0.5">
                                  {renderValue(valObj?.value, isLight)}
                                </div>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 4. BEST FOR SPECIFIC NEEDS (SPEC Section 21.4) ──────────────── */}
          <section
            className={`rounded-xl border p-6 shadow-md transition-colors ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            <h3
              className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                isLight ? 'text-slate-800' : 'text-gray-200'
              }`}
            >
              <span>🎯</span> Best For Specific Needs
            </h3>
            {bestForList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bestForList.map((bf: any, i: number) => {
                  const item = items.find((it: any) => it.id === bf.itemId)
                  const itemLabel = safeText(item?.displayName || bf.winner || bf.itemId, 'Item')
                  const label = safeText(bf.label, 'Recommendation')
                  const reason = safeText(bf.reason, 'Recommended based on stated specs.')
                  return (
                    <div
                      key={i}
                      className={`border rounded-lg p-4 space-y-1.5 transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600/60'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider text-indigo-500 font-bold block">
                        {label}
                      </span>
                      <p
                        className={`font-semibold break-words text-sm ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {itemLabel}
                      </p>
                      <p
                        className={`text-xs break-words leading-relaxed ${
                          isLight ? 'text-slate-600' : 'text-gray-400'
                        }`}
                      >
                        {reason}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className={`text-sm italic ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                No specific specialty recommendations; items present balanced profiles across general criteria.
              </p>
            )}
          </section>

          {/* ── 5 & 6. KEY DIFFERENCES & MISSING INFO ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Differences */}
            <section
              className={`rounded-xl border p-6 shadow-md flex flex-col transition-colors ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-gray-900/90 border-gray-800'
              }`}
            >
              <h3
                className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                  isLight ? 'text-slate-800' : 'text-gray-100'
                }`}
              >
                <span>🔍</span> Key Differences
              </h3>
              {differencesList.length > 0 ? (
                <ul className="space-y-3 text-sm flex-1">
                  {differencesList.map((diff: any, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-indigo-500 font-bold leading-5 select-none">•</span>
                      <span
                        className={`break-words leading-relaxed ${
                          isLight ? 'text-slate-700' : 'text-gray-300'
                        }`}
                      >
                        {safeText(diff, 'Not stated')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm italic ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  No major differentiating factors noted between compared items.
                </p>
              )}
            </section>

            {/* Missing Information */}
            <section
              className={`rounded-xl border p-6 shadow-md flex flex-col transition-colors ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-gray-900/90 border-gray-800'
              }`}
            >
              <h3
                className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                  isLight ? 'text-slate-800' : 'text-gray-100'
                }`}
              >
                <span className="text-amber-500">⚠️</span> Missing Information
              </h3>
              {missingInfoList.length > 0 ? (
                <div className="space-y-4 text-sm flex-1">
                  {missingInfoList.map((mi: any, i: number) => {
                    const item = items.find((it: any) => it.id === mi.itemId)
                    const itemLabel = safeText(item?.displayName || mi.itemId, 'Item')
                    const fieldsList = Array.isArray(mi.fields)
                      ? mi.fields
                          .map((f: any) => safeText(f, ''))
                          .filter((f: string) => f.length > 0 && f !== 'Not stated')
                      : []

                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-3.5 border space-y-2 ${
                          isLight
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-gray-950/60 border-gray-800/80'
                        }`}
                      >
                        <div
                          className={`font-semibold break-words text-sm leading-snug ${
                            isLight ? 'text-amber-700' : 'text-amber-400/90'
                          }`}
                        >
                          {itemLabel}
                        </div>
                        {fieldsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {fieldsList.map((field: string, fIdx: number) => (
                              <span 
                                key={fIdx} 
                                className={`inline-block text-xs px-2.5 py-1 rounded-md border ${
                                  isLight
                                    ? 'bg-white text-slate-700 border-slate-300 shadow-sm'
                                    : 'bg-gray-800/90 text-gray-300 border-gray-700/60'
                                }`}
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div>
                            {renderFallbackMuted('No missing specs noted', isLight)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={`text-sm italic ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  All relevant core attributes were explicitly present on the analyzed pages.
                </p>
              )}
            </section>
          </div>

          {/* ── 7. SOURCES LIST ────────────────────────────────────────────── */}
          <section
            className={`rounded-xl border p-5 transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-gray-900/60 border-gray-800/80'
            }`}
          >
            <h4
              className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-gray-400'
              }`}
            >
              <span>🔗</span> Source Webpages
            </h4>
            {sourceLinksList.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {sourceLinksList.map((link: any, idx: number) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg border transition-colors max-w-sm truncate shadow-sm ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-blue-600 hover:text-blue-700 border-slate-200'
                        : 'bg-gray-800/80 hover:bg-gray-700/80 text-blue-400 hover:text-blue-300 border-gray-700/50'
                    }`}
                    title={`Open original source: ${link.url}`}
                  >
                    <span className="truncate">{safeText(link.title || link.url)}</span>
                    <span className={`shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                No direct source links recorded.
              </p>
            )}
          </section>

        </div>
        {/* ── END OF EXPORTABLE COMPARISON AREA ──────────────────────────── */}

      </div>

      {/* ── SOCIAL SHARE MODAL ─────────────────────────────────────────── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-gray-900 border-gray-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <div className="flex items-center gap-2 font-bold text-lg">
                <span>🚀</span> Share Comparison
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className={`text-lg font-bold p-1 rounded-md transition-colors ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              Share your verified decision breakdown with friends, colleagues, or your network:
            </p>

            {/* Social Platform Share Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-black hover:bg-gray-800 text-white rounded-xl border border-gray-700 transition-all hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs font-semibold">Twitter / X</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#0077b5] hover:bg-[#006399] text-white rounded-xl transition-all hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="text-xs font-semibold">LinkedIn</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl transition-all hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-semibold">Facebook</span>
              </button>
            </div>

            {/* Image Preview & Direct Image Action */}
            <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Save visual card to attach with your post:
              </div>
              <button
                onClick={handleDownloadImage}
                disabled={exportingImage}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>🖼️</span>
                <span>{exportingImage ? 'Generating Image...' : 'Download Shareable PNG Image'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
