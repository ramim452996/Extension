import type { CurrentTab } from '../../types'

interface PageInfoProps {
  currentTab: CurrentTab | null
  isBrowserPage: boolean
}

export default function PageInfo({ currentTab, isBrowserPage }: PageInfoProps) {
  return (
    <div className="px-4 py-2.5 bg-white/[0.015] border-b border-white/[0.06]">
      {isBrowserPage ? (
        <div className="alert alert-info py-2">
          <span className="text-sm">🔒</span>
          <span>System page (cannot be compared).</span>
        </div>
      ) : currentTab ? (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-400 text-xs">
            🌐
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Current Tab</span>
            </div>
            <p className="text-[12.5px] font-semibold text-white/95 leading-snug truncate">
              {currentTab.title || 'Untitled Page'}
            </p>
            <p className="text-[10.5px] text-white/40 truncate">
              {currentTab.url
                ? currentTab.url.replace(/^https?:\/\//, '').split('/')[0]
                : '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] text-white/30 italic">No active tab detected.</p>
      )}
    </div>
  )
}
