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
        {/* Decorative brackets */}
        <span className="opacity-60">[ </span>
        COMPARE {count} PAGE{count > 1 ? 'S' : ''}
        <span className="opacity-60"> ]</span>
      </button>
    </div>
  )
}
