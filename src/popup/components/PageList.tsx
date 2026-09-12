import type { PageSnapshot } from '../../types'

interface PageListProps {
  pages: PageSnapshot[]
  onRemove: (id: string) => void
}

export default function PageList({ pages, onRemove }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="px-5 py-6 text-center">
        <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-lg text-white/30">
          ⚖️
        </div>
        <p className="text-[12px] font-medium text-white/50 leading-relaxed">
          No tabs in comparison yet
        </p>
        <p className="text-[11px] text-white/25 mt-0.5">
          Add 2 to 4 tabs above or pick open tabs below to generate your matrix.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-white/35 px-1">
        <span>Queued For Comparison</span>
        <span>{pages.length} of 4</span>
      </div>
      {pages.map((page, index) => (
        <div key={page.id} className="page-card group">
          {/* Number Badge */}
          <span className="page-number-badge">{index + 1}</span>

          {/* Page info */}
          <div className="flex-1 min-w-0">
            <p className="page-title">{page.title || 'Untitled Page'}</p>
            <p className="page-domain">{page.domain}</p>
          </div>

          {/* Remove */}
          <button
            id={`remove-page-${index + 1}`}
            className="remove-btn"
            onClick={() => onRemove(page.id)}
            title="Remove page from comparison"
            aria-label={`Remove page ${index + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
