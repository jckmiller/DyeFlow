import { useCallback, useState } from 'react'
import useFlowStore, { LEVELS } from '../store/useFlowStore'

// ── Draggable node template card ──────────────────────────────────────────────
function NodeTemplate({ level, label, description, color, icon }) {
  const onDragStart = useCallback(
    (e) => {
      e.dataTransfer.setData('application/dyeflow-level', level)
      e.dataTransfer.setData('application/dyeflow-label', label)
      e.dataTransfer.effectAllowed = 'move'
    },
    [level, label]
  )

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 hover:brightness-110 select-none"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
      title={`Drag to canvas to create a ${label} node`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{label}</div>
        <div className="text-xs truncate" style={{ color: `${color}99` }}>
          {description}
        </div>
      </div>
      <svg
        className="w-3 h-3 shrink-0 opacity-40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="5" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="19" r="1" fill="currentColor" />
        <circle cx="15" cy="5" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="19" r="1" fill="currentColor" />
      </svg>
    </div>
  )
}

// ── Templates per level ───────────────────────────────────────────────────────
const TOP_TEMPLATES = [
  { label: 'Receiving', description: 'Inbound goods processing', icon: '📥' },
  { label: 'Inspection', description: 'Visual and functional checks', icon: '🔍' },
  { label: 'Pre-Audit', description: 'Preliminary documentation review', icon: '📋' },
  { label: 'Audit', description: 'Detailed compliance verification', icon: '✅' },
  { label: 'Packing', description: 'Prepare items for shipment', icon: '📦' },
  { label: 'Shipping', description: 'Outbound dispatch', icon: '📤' },
]

const MID_TEMPLATES = [
  { label: 'Scan', description: 'Scan item identifiers', icon: '📱' },
  { label: 'Verify', description: 'Validate item details', icon: '🔍' },
  { label: 'Record', description: 'Log transaction in system', icon: '📝' },
  { label: 'Label Item', description: 'Apply labels', icon: '🏷️' },
  { label: 'Route Item', description: 'Direct to location', icon: '🔀' },
  { label: 'Notify Team', description: 'Send alert', icon: '🔔' },
]

const BOT_TEMPLATES = [
  { label: 'Missing NSN', description: 'NSN not found', icon: '❌' },
  { label: 'NSN Found', description: 'Item matched', icon: '✅' },
  { label: 'Duplicate Found', description: 'Item exists', icon: '⚠️' },
  { label: 'Mismatch', description: 'Qty mismatch', icon: '🔴' },
  { label: 'Escalate', description: 'Needs supervisor', icon: '⬆️' },
  { label: 'Auto-Resolve', description: 'System handled', icon: '🤖' },
]

export default function Sidebar() {
  const { navStack, topNodes, drillInto, exportFlow, importFlow } = useFlowStore()
  const nav = navStack[navStack.length - 1]
  const currentLevel = nav.level
  const levelMeta = LEVELS[currentLevel]

  const [activeTab, setActiveTab] = useState('nodes')

  const handleImportClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => importFlow(evt.target.result)
      reader.readAsText(file)
    }
    input.click()
  }, [importFlow])

  const tabClass = (tab) =>
    `flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
      activeTab === tab
        ? 'text-white'
        : 'text-slate-500 hover:text-slate-300'
    }`

  return (
    <aside
      className="flex flex-col h-full select-none"
      style={{
        width: 260,
        background: '#0d0f1a',
        borderRight: '1px solid #1e2130',
      }}
    >
      {/* Logo / Title */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid #1e2130' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            boxShadow: '0 2px 12px #6366f155',
          }}
        >
          🌊
        </div>
        <div>
          <div className="text-sm font-black text-white tracking-tight">DyeFlow</div>
          <div className="text-xs text-slate-500">Warehouse Logic Builder</div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e2130' }}>
        <div
          className="flex gap-1 p-1.5 rounded-xl"
          style={{ background: '#1a1d2e' }}
        >
          {['nodes', 'navigate', 'tools'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={tabClass(t).replace('py-1.5', 'py-2')}
              style={
                activeTab === t
                  ? {
                      background: levelMeta.color + '33',
                      color: levelMeta.color,
                      boxShadow: `inset 0 0 0 1px ${levelMeta.color}44`,
                    }
                  : {}
              }
            >
              {t === 'nodes' ? '🧩 Nodes' : t === 'navigate' ? '🧭 Navigate' : '🛠 Tools'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {activeTab === 'nodes' && (
          <>
            {/* Current level hint */}
            <div
              className="text-xs px-4 py-3 rounded-xl font-medium leading-relaxed"
              style={{
                background: `${levelMeta.color}15`,
                color: levelMeta.color,
                border: `1px solid ${levelMeta.color}33`,
              }}
            >
              📍 You are on the <strong>{levelMeta.label}</strong> canvas.
              <br />
              <span className="opacity-70">Drag any node below onto the canvas.</span>
            </div>

            {/* Top Level Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: LEVELS.top.color }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: LEVELS.top.color }}
                >
                  Top Level
                </span>
              </div>
              <div className="space-y-2">
                {TOP_TEMPLATES.map((t) => (
                  <NodeTemplate
                    key={t.label}
                    level="top"
                    color={LEVELS.top.color}
                    {...t}
                  />
                ))}
              </div>
            </section>

            {/* Mid Level Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: LEVELS.mid.color }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: LEVELS.mid.color }}
                >
                  Mid Level
                </span>
              </div>
              <div className="space-y-2">
                {MID_TEMPLATES.map((t) => (
                  <NodeTemplate
                    key={t.label}
                    level="mid"
                    color={LEVELS.mid.color}
                    {...t}
                  />
                ))}
              </div>
            </section>

            {/* Bottom Level Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: LEVELS.bot.color }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: LEVELS.bot.color }}
                >
                  Leaf Nodes
                </span>
              </div>
              <div className="space-y-2">
                {BOT_TEMPLATES.map((t) => (
                  <NodeTemplate
                    key={t.label}
                    level="bot"
                    color={LEVELS.bot.color}
                    {...t}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'navigate' && (
          <div className="space-y-4">
            {/* Navigation Tree */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Jump to Canvas
              </div>
              <div className="space-y-2">
                {topNodes.map((topNode) => (
                  <div key={topNode.id} className="space-y-1">
                    {/* Top Node */}
                    <button
                      onClick={() => drillInto(topNode.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: `${LEVELS.top.color}22`,
                        color: LEVELS.top.color,
                        border: `1px solid ${LEVELS.top.color}44`,
                      }}
                      title={`Open ${topNode.data.label} mid-level canvas`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: LEVELS.top.color }}
                      />
                      <span className="text-xs font-semibold truncate">{topNode.data.label}</span>
                    </button>

                    {/* Mid Nodes */}
                    {topNode.data.childNodes?.map((midNode) => (
                      <button
                        key={midNode.id}
                        onClick={() => drillInto(midNode.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 ml-4 rounded-lg text-left transition-all hover:brightness-110 active:scale-95"
                        style={{
                          background: `${LEVELS.mid.color}15`,
                          color: LEVELS.mid.color,
                          border: `1px solid ${LEVELS.mid.color}33`,
                        }}
                        title={`Open ${midNode.data.label} bottom-level canvas`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: LEVELS.mid.color }}
                        />
                        <span className="text-xs truncate">{midNode.data.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Legend */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Level Legend
              </div>
              {Object.entries(LEVELS).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: meta.color, boxShadow: `0 0 4px ${meta.color}` }}
                  />
                  <span className="text-xs text-slate-400">{meta.label}</span>
                  <span className="text-xs ml-auto" style={{ color: meta.color + '99' }}>
                    {key === 'top' ? 'Process' : key === 'mid' ? 'Task' : 'Outcome'}
                  </span>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Quick Tips
              </div>
              {[
                ['→', 'Drag handles to connect nodes'],
                ['✏️', 'Click a node to edit it'],
                ['🖱️', 'Click "Open →" to drill in'],
                ['⌫', 'Delete key removes nodes'],
                ['↩️', 'Breadcrumb to go back up'],
                ['2×', 'Double-click edge to delete'],
              ].map(([icon, tip]) => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="text-xs shrink-0">{icon}</span>
                  <span className="text-xs text-slate-500">{tip}</span>
                </div>
              ))}
            </div>

            {/* Save / Load */}
            <div
              className="rounded-xl p-4 space-y-2.5"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Flow Data
              </div>
              <button
                onClick={exportFlow}
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: '#6366f122',
                  color: '#818cf8',
                  border: '1px solid #6366f144',
                }}
              >
                💾 Export JSON
              </button>
              <button
                onClick={handleImportClick}
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: '#10b98122',
                  color: '#34d399',
                  border: '1px solid #10b98144',
                }}
              >
                📂 Import JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
