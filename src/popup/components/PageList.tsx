import type { PageSnapshot } from '../../types'

interface PageListProps {
  pages: PageSnapshot[]
  onRemove: (id: string) => void
}

export default function PageList({ pages, onRemove }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-[12px] text-white/25 leading-relaxed">
          Add 2–4 pages to start comparing.
          <br />
          <span className="text-white/15">Navigate to a page and click the button above.</span>
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-2">
      {pages.map((page, index) => (
        <div key={page.id} className="page-card">
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
            title="Remove page"
            aria-label={`Remove page ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
