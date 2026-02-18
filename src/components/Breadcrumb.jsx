import useFlowStore, { LEVELS } from '../store/useFlowStore'

export default function Breadcrumb() {
  const { navStack, navigateTo } = useFlowStore()

  return (
    <div
      className="flex items-center gap-1.5 px-5 h-14 shrink-0"
      style={{
        background: '#0d0f1a',
        borderBottom: '1px solid #1e2130',
      }}
    >
      {navStack.map((crumb, idx) => {
        const isLast = idx === navStack.length - 1
        const meta = LEVELS[crumb.level]

        return (
          <div key={idx} className="flex items-center gap-1">
            {/* Crumb button */}
            {isLast ? (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: `${meta.color}22`,
                  color: meta.color,
                  border: `1px solid ${meta.color}44`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: meta.color }}
                />
                {crumb.label}
              </div>
            ) : (
              <button
                onClick={() => navigateTo(idx)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-125 active:scale-95"
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
                {crumb.label}
              </button>
            )}

            {/* Separator arrow */}
            {!isLast && (
              <svg
                className="w-3 h-3 text-slate-600"
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

      {/* Right side — level indicator */}
      <div className="ml-auto flex items-center gap-2.5">
        {Object.entries(LEVELS).map(([key, meta]) => {
          const isActive = navStack[navStack.length - 1].level === key
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all"
              style={{
                background: isActive ? `${meta.color}22` : 'transparent',
                color: isActive ? meta.color : '#374151',
                border: isActive ? `1px solid ${meta.color}44` : '1px solid transparent',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
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
