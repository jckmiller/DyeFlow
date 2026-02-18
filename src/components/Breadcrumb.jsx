import useFlowStore, { LEVELS } from '../store/useFlowStore'

export default function Breadcrumb() {
  const { navStack, navigateTo } = useFlowStore()
  const isDrilledIn = navStack.length > 1
  const currentNav = navStack[navStack.length - 1]
  const parentNav = navStack[navStack.length - 2]

  const handleBack = () => {
    if (isDrilledIn) navigateTo(navStack.length - 2)
  }

  return (
    <div
      className="flex items-center gap-4 px-6 h-16 shrink-0"
      style={{
        background: '#0d0f1a',
        borderBottom: '1px solid #1e2130',
      }}
    >
      {/* Back button (when drilled in) */}
      {isDrilledIn && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-125 active:scale-95"
          style={{
            background: '#1a1d2e',
            color: '#64748b',
            border: '1px solid #2a2d40',
          }}
          title={`Back to ${parentNav.label}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {navStack.map((crumb, idx) => {
          const isLast = idx === navStack.length - 1
          const meta = LEVELS[crumb.level]

          return (
            <div key={idx} className="flex items-center gap-2">
              {/* Crumb button */}
              {isLast ? (
                <div
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold min-w-0"
                  style={{
                    background: `${meta.color}22`,
                    color: meta.color,
                    border: `1px solid ${meta.color}44`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: meta.color }}
                  />
                  <span className="truncate">{crumb.label}</span>
                  {isDrilledIn && parentNav && (
                    <span className="text-xs opacity-75 ml-1">({LEVELS[crumb.level].label})</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigateTo(idx)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:brightness-125 active:scale-95 min-w-0"
                  style={{
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${meta.color}15`
                    e.currentTarget.style.color = meta.color
                    e.currentTarget.style.border = `1px solid ${meta.color}33`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.border = '1px solid transparent'
                  }}
                >
                  <span className="truncate">{crumb.label}</span>
                </button>
              )}

              {/* Separator arrow */}
              {!isLast && (
                <svg
                  className="w-4 h-4 text-slate-600 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Right side — level indicator */}
      <div className="flex items-center gap-3">
        {Object.entries(LEVELS).map(([key, meta]) => {
          const isActive = currentNav.level === key
          return (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: isActive ? `${meta.color}22` : 'transparent',
                color: isActive ? meta.color : '#374151',
                border: isActive ? `1px solid ${meta.color}44` : '1px solid transparent',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: meta.color, opacity: isActive ? 1 : 0.3 }}
              />
              <span>{meta.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
