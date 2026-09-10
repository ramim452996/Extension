/**
 * Utility functions for exporting the comparison results.
 */

export async function copyAsMarkdown(comparison: any): Promise<boolean> {
  if (!comparison) return false

  let markdown = `# ${comparison.comparisonTitle || comparison.title || 'Comparison Results'}\n\n`
  markdown += `**Goal:** ${comparison.goal || 'Objective comparison'}\n\n`

  // 1. Quick Verdict (Best Overall)
  if (comparison.bestOverall) {
    const bestItem = comparison.items?.find((i: any) => i.id === comparison.bestOverall.itemId)
    if (bestItem) {
      markdown += `## 🏆 Best Overall: ${bestItem.displayName}\n`
    } else {
      markdown += `## 🏆 Best Overall: No Single Winner (Tied or Incomparable Trade-offs)\n`
    }
    if (comparison.bestOverall.reason) {
      markdown += `*${comparison.bestOverall.reason}*\n\n`
    }
  }

  // 2. Comparison Matrix (Table)
  if (comparison.criteria && comparison.items && comparison.items.length > 0) {
    markdown += `## 📊 Comparison Matrix\n\n`
    
    // Header row
    markdown += `| Criteria | ` + comparison.items.map((i: any) => i.displayName || i.id).join(' | ') + ` |\n`
    // Separator row
    markdown += `|----------|` + comparison.items.map(() => '-----').join('|') + `|\n`

    // Data rows
    comparison.criteria.forEach((c: any) => {
      let row = `| **${c.name || 'Criterion'}** | `
      const values = comparison.items.map((item: any) => {
        const valObj = c.values?.find((v: any) => v.itemId === item.id)
        let valText = valObj && valObj.value !== undefined && valObj.value !== null && valObj.value !== ''
          ? String(valObj.value).replace(/\|/g, '\\|').replace(/\n/g, ' ')
          : 'Not stated'
        if (c.winnerItemIds && c.winnerItemIds.includes(item.id)) {
          valText = `✅ **${valText}**`
        }
        return valText
      })
      row += values.join(' | ') + ` |\n`
      markdown += row
    })
    markdown += `\n`
  }

  // 3. Best For...
  if (comparison.bestFor && comparison.bestFor.length > 0) {
    markdown += `## 🎯 Best For...\n`
    comparison.bestFor.forEach((bf: any) => {
      const item = comparison.items?.find((i: any) => i.id === bf.itemId)
      const itemName = item?.displayName || bf.winner || bf.itemId || 'Item'
      markdown += `- **${bf.label || 'Category'}**: ${itemName} (${bf.reason || 'Recommended'})\n`
    })
    markdown += `\n`
  }

  // 4. Key Differences
  const differences = comparison.keyDifferences || comparison.importantDifferences
  if (differences && differences.length > 0) {
    markdown += `## 🔍 Key Differences\n`
    differences.forEach((diff: string) => {
      markdown += `- ${diff}\n`
    })
    markdown += `\n`
  }

  // 5. Missing Information
  if (comparison.missingInformation && comparison.missingInformation.length > 0) {
    markdown += `## ⚠️ Missing Information\n`
    comparison.missingInformation.forEach((mi: any) => {
      const item = comparison.items?.find((i: any) => i.id === mi.itemId)
      const name = item?.displayName || mi.itemId || 'Item'
      const fields = Array.isArray(mi.fields) ? mi.fields.join(', ') : 'None noted'
      markdown += `- **${name}**: ${fields}\n`
    })
    markdown += `\n`
  }

  try {
    await navigator.clipboard.writeText(markdown)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard', err)
    return false
  }
}

export function downloadCSV(comparison: any): void {
  if (!comparison) return

  const items = comparison.items || []
  const criteria = comparison.criteria || []
  if (items.length === 0) return

  // Header row
  const headers = ['Criteria', 'Importance', ...items.map((i: any) => i.displayName || i.id)]
  const rows = [headers]

  // Data rows
  criteria.forEach((c: any) => {
    const row = [c.name || 'Criterion', c.importance || 'medium']
    items.forEach((item: any) => {
      const valObj = c.values?.find((v: any) => v.itemId === item.id)
      let text = (valObj && valObj.value !== undefined && valObj.value !== null && valObj.value !== '')
        ? String(valObj.value)
        : 'Not stated'
      row.push(text)
    })
    rows.push(row)
  })

  // RFC-4180 compliant CSV serializer
  const csvString = rows.map((r) =>
    r.map((cell) => {
      const str = String(cell ?? '')
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  ).join('\r\n')

  // Create Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'compare-anything-result.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
