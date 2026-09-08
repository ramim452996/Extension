import type { CurrentTab } from '../../types'

interface PageInfoProps {
  currentTab: CurrentTab | null
  isBrowserPage: boolean
}

export default function PageInfo({ currentTab, isBrowserPage }: PageInfoProps) {
  return (
    <div className="px-4 py-3 border-b border-white/[0.06]">
      {isBrowserPage ? (
        <div className="alert alert-info">
          <span>🔒</span>
          <span>Extensions can't access browser internal pages.</span>
        </div>
      ) : currentTab ? (
        <div>
          <p className="text-[13px] font-semibold text-white/90 leading-snug line-clamp-2">
            {currentTab.title || 'Untitled Page'}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5 truncate">
            {currentTab.url
              ? currentTab.url.replace(/^https?:\/\//, '').split('/')[0]
              : '—'}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-white/30 italic">No active tab detected.</p>
      )}
    </div>
  )
}
