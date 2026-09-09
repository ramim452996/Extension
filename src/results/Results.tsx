import { useEffect, useState } from 'react'
import { copyAsMarkdown, downloadCSV } from '../utils/export'

export default function Results() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chrome.storage.local.get(['latestComparison'], (result) => {
      if (result.latestComparison) {
        setData(result.latestComparison)
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  // Handle Error States
  if (!data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white p-8 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h1 className="text-2xl font-bold mb-2">No Comparison Data Found</h1>
        <p className="text-gray-400">Please start a new comparison from the extension popup.</p>
      </div>
    )
  }

  if (data.error) {
    // Determine user-friendly error message based on Day 4 spec
    let errorMsg = 'Comparison couldn\'t be generated. Please try again.'
    if (data.status === 429) {
      errorMsg = "Today's free comparison limit has been reached. Please try again later."
    } else if (data.status === 503) {
      errorMsg = "Compare Anything is temporarily unavailable."
    }
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white p-8 text-center">
        <span className="text-4xl mb-4">❌</span>
        <h1 className="text-2xl font-bold mb-2">Error Generating Comparison</h1>
        <p className="text-red-400 max-w-md">{errorMsg}</p>
      </div>
    )
  }

  const renderValue = (value: any) => {
    if (value === undefined || value === null || Number.isNaN(value) || value === 'Not stated' || value === '') {
      return <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md">Not stated</span>
    }
    return <span>{String(value)}</span>
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {data.comparisonTitle}
            </h1>
            <p className="text-gray-400 mt-1">Goal: {data.goal || 'Objective Comparison'}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => copyAsMarkdown(data)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              📋 Copy Markdown
            </button>
            <button 
              onClick={() => downloadCSV(data)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              📥 Download CSV
            </button>
          </div>
        </header>

        {/* Best Overall */}
        {data.bestOverall && (
          <section className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <span>🏆</span> Best Overall
            </h2>
            <div className="space-y-1">
              <p className="font-bold text-lg text-blue-300">
                {data.items.find((i: any) => i.id === data.bestOverall.itemId)?.displayName}
              </p>
              <p className="text-gray-300">{data.bestOverall.reason}</p>
            </div>
          </section>
        )}

        {/* Criteria Matrix */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="p-4 font-semibold text-gray-300 border-b border-gray-700 w-1/4">Criteria</th>
                  {data.items.map((item: any) => (
                    <th key={item.id} className="p-4 font-semibold text-gray-300 border-b border-gray-700">
                      {item.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.criteria.map((c: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-medium text-gray-200">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{c.importance} importance</div>
                    </td>
                    {data.items.map((item: any) => {
                      const valObj = c.values.find((v: any) => v.itemId === item.id)
                      const isWinner = c.winnerItemIds?.includes(item.id)
                      return (
                        <td key={item.id} className="p-4 align-top">
                          <div className={`flex flex-col gap-1 ${isWinner ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                            {isWinner && <span className="text-[10px] uppercase tracking-wider text-green-500/80 font-bold">Winner</span>}
                            {renderValue(valObj?.value)}
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

        {/* Differences & Missing Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.keyDifferences?.length > 0 && (
            <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200 flex items-center gap-2">
                <span>🔍</span> Key Differences
              </h3>
              <ul className="space-y-2 text-gray-400">
                {data.keyDifferences.map((diff: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.missingInformation?.length > 0 && (
            <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200 flex items-center gap-2">
                <span>⚠️</span> Missing Information
              </h3>
              <ul className="space-y-3 text-gray-400">
                {data.missingInformation.map((mi: any, i: number) => {
                  const item = data.items.find((it: any) => it.id === mi.itemId)
                  return (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-500 font-bold">{item?.displayName}:</span>
                      <span className="text-gray-500">{mi.fields.join(', ')}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

      </div>
    </div>
  )
}
