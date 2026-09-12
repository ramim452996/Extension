import type { CurrentTab } from '../../types'

interface PageInfoProps {
  currentTab: CurrentTab | null
  isBrowserPage: boolean
}

export default function PageInfo({ currentTab, isBrowserPage }: PageInfoProps) {
  return (
    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
      {isBrowserPage ? (
        <div className="alert alert-info py-2">
          <span className="text-sm">🔒</span>
          <span>System page (cannot be compared).</span>
        </div>
      ) : currentTab ? (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-600 text-xs shadow-sm">
            🌐
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Current Tab</span>
            </div>
            <p className="text-[12.5px] font-semibold text-slate-800 leading-snug truncate">
              {currentTab.title || 'Untitled Page'}
            </p>
            <p className="text-[10.5px] text-slate-500 truncate">
              {currentTab.url
                ? currentTab.url.replace(/^https?:\/\//, '').split('/')[0]
                : '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] text-slate-400 italic">No active tab detected.</p>
      )}
    </div>
  )
}
