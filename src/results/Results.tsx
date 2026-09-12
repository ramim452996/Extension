import { useEffect, useRef, useState } from 'react'
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

function renderFallbackMuted(text = 'Not stated') {
  return (
    <span className="inline-block text-xs font-medium text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700/50">
      {text}
    </span>
  )
}

function renderValue(value: unknown) {
  if (isMissingOrInvalid(value)) {
    return renderFallbackMuted('Not stated')
  }
  return <span className="break-words whitespace-normal leading-relaxed">{safeText(value)}</span>
}

export default function Results() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copyToast, setCopyToast] = useState(false)
  const [exportingImage, setExportingImage] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  const comparisonContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chrome.storage.local.get(['latestComparison', 'comparisonResult'], (result) => {
      const active = result.latestComparison || result.comparisonResult
      if (active) {
        setData(active)
      }
      setLoading(false)
    })
  }, [])

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
        backgroundColor: '#030712', // Dark background
        pixelRatio: 2, // Crisp 2x retina export
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
          backgroundColor: '#030712',
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
    // SPEC Section 24 compliance: wipe selectedPages, comparisonResult, userGoal
    await chrome.storage.local.remove([
      'pages',
      'goal',
      'selectedPages',
      'comparisonResult',
      'userGoal',
      'latestComparison',
    ])
    // Close results tab to focus extension or return
    window.close()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Handle Error States
  if (!data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-950 text-white p-8 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h1 className="text-2xl font-bold mb-2">No Comparison Data Found</h1>
        <p className="text-gray-400 mb-6 max-w-sm">Please select 2 to 4 pages and start a comparison from the extension popup.</p>
        <button
          onClick={handleStartNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
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
      <div className="flex flex-col h-screen items-center justify-center bg-gray-950 text-white p-8 text-center">
        <span className="text-4xl mb-4">❌</span>
        <h1 className="text-2xl font-bold mb-2">Error Generating Comparison</h1>
        <p className="text-red-400 max-w-md mb-6">{errorMsg}</p>
        <button
          onClick={handleStartNew}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors border border-gray-700"
        >
          Start New Comparison
        </button>
      </div>
    )
  }

  const items = Array.isArray(data.items) ? data.items : []
  const criteria = Array.isArray(data.criteria) ? data.criteria : []
  const itemCount = items.length || 2
  // Table minWidth: 2 items -> 720px, 3 items -> 880px, 4 items -> 1060px
  const tableMinWidth = Math.max(700, itemCount * 210 + 220)

  // Best For items list
  const bestForList = Array.isArray(data.bestFor) ? data.bestFor : []

  // Key Differences list
  const differencesList = Array.isArray(data.keyDifferences)
    ? data.keyDifferences
    : Array.isArray(data.importantDifferences)
    ? data.importantDifferences
    : []

  // Missing Information list
  const missingInfoList = Array.isArray(data.missingInformation) ? data.missingInformation : []

  // Source Links list
  const sourceLinksList = Array.isArray(data.sourceLinks) ? data.sourceLinks : []

  // Evaluate Best Overall data
  const bestOverallObj = data.bestOverall
  const winnerItem = bestOverallObj?.itemId
    ? items.find((i: any) => i.id === bestOverallObj.itemId)
    : null
  const winnerTitle = winnerItem
    ? winnerItem.displayName
    : bestOverallObj?.itemId
    ? bestOverallObj.itemId
    : 'No Single Winner (Tied / Incomparable Trade-offs)'
  const winnerReason = bestOverallObj?.reason
    ? safeText(bestOverallObj.reason)
    : 'Items represent differing specifications and trade-offs without a single objective winner.'

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ── 1. HEADER BLOCK (SPEC Section 21.1) ────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 break-words">
                {safeText(data.comparisonTitle || data.title, 'Comparison Matrix')}
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-300">
              <span className="font-semibold text-blue-400">Goal:</span>
              <span className="truncate max-w-md">{safeText(data.goal, 'Objective Comparison')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button 
              onClick={handleCopyMarkdown}
              className="relative px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors border border-gray-700 flex items-center gap-1.5 shadow-sm"
              title="Copy comparison as formatted Markdown table"
            >
              <span>📋</span>
              <span>Copy Markdown</span>
              {copyToast && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-fade-in">
                  Copied!
                </span>
              )}
            </button>

            <button 
              onClick={() => downloadCSV(data)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download comparison as RFC-4180 CSV"
            >
              <span>📥</span>
              <span>Download CSV</span>
            </button>

            <button 
              onClick={handleDownloadImage}
              disabled={exportingImage}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Export comparison matrix as a shareable PNG image"
            >
              <span>🖼️</span>
              <span>{exportingImage ? 'Generating...' : 'Share as Image'}</span>
            </button>

            <button 
              onClick={handleOpenShareModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Share comparison directly to Twitter/X, LinkedIn, or Facebook"
            >
              <span>🚀</span>
              <span>Share</span>
            </button>

            <button 
              onClick={handleStartNew}
              className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-gray-800 flex items-center gap-1.5"
              title="Clear workspace and return to tab selection"
            >
              <span>🔄</span>
              <span>Start New</span>
            </button>
          </div>
        </header>

        {/* ── EXPORTABLE COMPARISON AREA ─────────────────────────────────── */}
        <div ref={comparisonContentRef} className="space-y-8 bg-gray-950 p-2 sm:p-4 rounded-2xl">
          {/* Comparison watermark banner for viral sharing */}
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
              <span className="text-blue-400">⚡</span> Compare Anything
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Objective Zero-Hallucination Comparison
            </div>
          </div>

          {/* ── 2. BEST OVERALL CARD (SPEC Section 21.2) ───────────────────── */}
          <section className="bg-gradient-to-br from-indigo-950/40 via-gray-900 to-purple-950/30 border border-indigo-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xl">🏆</span>
            <h2 className="text-base font-bold uppercase tracking-wider text-indigo-300">
              Best Overall Verdict
            </h2>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-lg sm:text-xl text-white break-words">
              {winnerTitle}
            </p>
            <p className="text-gray-300 break-words leading-relaxed text-sm max-w-4xl">
              {winnerReason}
            </p>
          </div>
        </section>

        {/* ── 3. COMPARISON TABLE (SPEC Section 21.3 & Section 22) ───────── */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table 
              className="w-full text-left border-collapse table-auto"
              style={{ minWidth: `${tableMinWidth}px` }}
            >
              <thead>
                <tr className="bg-gray-800/70 border-b border-gray-700">
                  <th className="p-4 font-semibold text-gray-300 w-1/4 min-w-[180px] max-w-[240px] align-bottom">
                    Criteria
                  </th>
                  {items.map((item: any) => (
                    <th key={item.id} className="p-4 font-semibold text-gray-200 border-l border-gray-800/80 min-w-[180px] align-bottom">
                      <div className="font-bold text-base text-gray-100 break-words whitespace-normal leading-snug">
                        {safeText(item.displayName, 'Item')}
                      </div>
                      {!isMissingOrInvalid(item.shortDescription) && (
                        <p className="text-xs font-normal text-gray-400 mt-1 line-clamp-2 break-words">
                          {safeText(item.shortDescription)}
                        </p>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {criteria.map((c: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 align-top w-1/4 min-w-[180px] max-w-[240px]">
                      <div className="font-medium text-gray-200 break-words whitespace-normal leading-snug">
                        {safeText(c.name, 'Criterion')}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                        {safeText(c.importance, 'medium')} importance
                      </div>
                    </td>
                    {items.map((item: any) => {
                      const valObj = c.values?.find((v: any) => v.itemId === item.id)
                      const isWinner = Array.isArray(c.winnerItemIds) && c.winnerItemIds.includes(item.id)
                      return (
                        <td 
                          key={item.id} 
                          className={`p-4 align-top border-l border-gray-800/80 min-w-[180px] ${
                            isWinner ? 'bg-emerald-950/15' : ''
                          }`}
                        >
                          <div className={`flex flex-col gap-1.5 ${isWinner ? 'text-emerald-300 font-medium' : 'text-gray-300'}`}>
                            {isWinner && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-700/40 rounded px-1.5 py-0.5 w-fit">
                                <span>✓</span> Winner
                              </span>
                            )}
                            <div className="break-words whitespace-normal leading-relaxed text-sm py-0.5">
                              {renderValue(valObj?.value)}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. BEST FOR SPECIFIC NEEDS (SPEC Section 21.4) ──────────────── */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-200 flex items-center gap-2">
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
                  <div key={i} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 space-y-1.5 hover:border-gray-600/60 transition-colors">
                    <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold">{label}</span>
                    <p className="font-medium text-white break-words text-sm">{itemLabel}</p>
                    <p className="text-xs text-gray-400 break-words leading-relaxed">{reason}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No specific specialty recommendations; items present balanced profiles across general criteria.
            </p>
          )}
        </section>

        {/* ── 5 & 6. KEY DIFFERENCES & MISSING INFO (SPEC Section 21.5 & 21.6) ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Differences */}
          <section className="bg-gray-900/90 rounded-xl border border-gray-800 p-6 shadow-md flex flex-col">
            <h3 className="font-semibold text-lg mb-4 text-gray-100 flex items-center gap-2">
              <span>🔍</span> Key Differences
            </h3>
            {differencesList.length > 0 ? (
              <ul className="space-y-3 text-sm flex-1">
                {differencesList.map((diff: any, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-indigo-400 font-bold leading-5 select-none">•</span>
                    <span className="text-gray-300 break-words leading-relaxed">{safeText(diff, 'Not stated')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No major differentiating factors noted between compared items.
              </p>
            )}
          </section>

          {/* Missing Information */}
          <section className="bg-gray-900/90 rounded-xl border border-gray-800 p-6 shadow-md flex flex-col">
            <h3 className="font-semibold text-lg mb-4 text-gray-100 flex items-center gap-2">
              <span className="text-amber-400">⚠️</span> Missing Information
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
                    <div key={i} className="bg-gray-950/60 rounded-lg p-3.5 border border-gray-800/80 space-y-2">
                      <div className="font-semibold text-amber-400/90 break-words text-sm leading-snug">
                        {itemLabel}
                      </div>
                      {fieldsList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {fieldsList.map((field: string, fIdx: number) => (
                            <span 
                              key={fIdx} 
                              className="inline-block bg-gray-800/90 text-gray-300 border border-gray-700/60 text-xs px-2.5 py-1 rounded-md"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {renderFallbackMuted('No missing specs noted')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                All relevant core attributes were explicitly present on the analyzed pages.
              </p>
            )}
          </section>
        </div>

        {/* ── 7. SOURCES LIST (SPEC Section 21.7 & Section 23.4) ──────────── */}
        <section className="bg-gray-900/60 rounded-xl border border-gray-800/80 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
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
                  className="inline-flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-blue-400 hover:text-blue-300 text-xs font-medium px-3.5 py-2 rounded-lg border border-gray-700/50 transition-colors max-w-sm truncate shadow-sm"
                  title={`Open original source: ${link.url}`}
                >
                  <span className="truncate">{safeText(link.title || link.url)}</span>
                  <span className="shrink-0 text-gray-500">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No direct source links recorded.</p>
          )}
        </section>

        </div>
        {/* ── END OF EXPORTABLE COMPARISON AREA ──────────────────────────── */}

      </div>

      {/* ── SOCIAL SHARE MODAL ─────────────────────────────────────────── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <span>🚀</span> Share Comparison
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
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
            <div className="pt-2 border-t border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Save visual card to attach with your post:</span>
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

