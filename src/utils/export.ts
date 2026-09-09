/**
 * Utility functions for exporting the comparison results.
 */

export function copyAsMarkdown(comparison: any): void {
  if (!comparison) return

  let markdown = `# ${comparison.comparisonTitle}\n\n`
  markdown += `**Goal:** ${comparison.goal || 'Objective comparison'}\n\n`

  // Quick Verdict (Best Overall)
  if (comparison.bestOverall) {
    const bestItem = comparison.items.find((i: any) => i.id === comparison.bestOverall.itemId)
    if (bestItem) {
      markdown += `## 🏆 Best Overall: ${bestItem.displayName}\n`
      markdown += `*${comparison.bestOverall.reason}*\n\n`
    }
  }

  // Best For...
  if (comparison.bestFor && comparison.bestFor.length > 0) {
    markdown += `## 🎯 Best For...\n`
    comparison.bestFor.forEach((bf: any) => {
      const item = comparison.items.find((i: any) => i.id === bf.itemId)
      if (item) {
        markdown += `- **${bf.label}**: ${item.displayName} (${bf.reason})\n`
      }
    })
    markdown += `\n`
  }

  // Comparison Matrix (Table)
  if (comparison.criteria && comparison.items) {
    markdown += `## 📊 Comparison Matrix\n\n`
    
    // Header row
    markdown += `| Criteria | ` + comparison.items.map((i: any) => i.displayName).join(' | ') + ` |\n`
    // Separator row
    markdown += `|----------|` + comparison.items.map(() => '-----').join('|') + `|\n`

    // Data rows
    comparison.criteria.forEach((c: any) => {
      let row = `| **${c.name}** | `
      const values = comparison.items.map((item: any) => {
        const valObj = c.values.find((v: any) => v.itemId === item.id)
        let valText = valObj ? valObj.value : 'Not stated'
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

  // Key Differences
  if (comparison.keyDifferences && comparison.keyDifferences.length > 0) {
    markdown += `## 🔍 Key Differences\n`
    comparison.keyDifferences.forEach((diff: string) => {
      markdown += `- ${diff}\n`
    })
    markdown += `\n`
  }

  // Missing Information
  if (comparison.missingInformation && comparison.missingInformation.length > 0) {
    markdown += `## ⚠️ Missing Information\n`
    comparison.missingInformation.forEach((mi: any) => {
      const item = comparison.items.find((i: any) => i.id === mi.itemId)
      if (item) {
        markdown += `- **${item.displayName}**: ${mi.fields.join(', ')}\n`
      }
    })
    markdown += `\n`
  }

  navigator.clipboard.writeText(markdown)
    .then(() => console.log('Markdown copied to clipboard!'))
    .catch((err) => console.error('Failed to copy to clipboard', err))
}

export function downloadCSV(comparison: any): void {
  if (!comparison || !comparison.criteria || !comparison.items) return

  // Header row
  const headers = ['Criteria', 'Importance', ...comparison.items.map((i: any) => i.displayName)]
  const rows = [headers]

  // Data rows
  comparison.criteria.forEach((c: any) => {
    const row = [c.name, c.importance]
    comparison.items.forEach((item: any) => {
      const valObj = c.values.find((v: any) => v.itemId === item.id)
      let text = valObj ? valObj.value : 'Not stated'
      // Escape quotes for CSV
      if (text.includes('"')) {
        text = text.replace(/"/g, '""')
      }
      // Quote field if it contains commas, newlines or quotes
      if (text.includes(',') || text.includes('\n') || text.includes('"')) {
        text = `"${text}"`
      }
      row.push(text)
    })
    rows.push(row)
  })

  // Convert to CSV string
  const csvString = rows.map(r => r.join(',')).join('\n')

  // Create Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'comparison.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
