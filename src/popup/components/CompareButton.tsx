import type { PageSnapshot } from '../../types'

interface CompareButtonProps {
  pages: PageSnapshot[]
  onClick: () => void
}

export default function CompareButton({ pages, onClick }: CompareButtonProps) {
  const count = pages.length
  if (count < 2) return null

  return (
    <div className="px-4 pb-3 pt-1">
      <button
        id="compare-button"
        className="compare-btn"
        onClick={onClick}
        aria-label={`Compare ${count} pages`}
      >
        <span>⚡</span>
        <span>COMPARE {count} TABS</span>
        <span className="text-white/60 text-xs">➔</span>
      </button>
    </div>
  )
}
