import { useState, useEffect, useCallback } from 'react'
import useFlowStore, { LEVELS, computeEffectiveActive } from '../store/useFlowStore'

const COLOR_SWATCHES = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#f59e0b',
  '#ef4444', '#f97316', '#84cc16', '#a1a1aa',
]

const STATUS_OPTIONS = ['default', 'ok', 'warning', 'error', 'info']

// ── Toggle Switch component ───────────────────────────────────────────────────
function ToggleSwitch({ value, onChange, activeColor = '#22c55e', label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="relative flex items-center transition-all duration-200"
        style={{ width: 44, height: 24 }}
        title={value ? 'Click to disable' : 'Click to enable'}
      >
        <div
          className="w-full h-full rounded-full transition-all duration-200"
          style={{
            background: value ? activeColor + '55' : '#1a1d2e',
            border: `1.5px solid ${value ? activeColor : '#3b4263'}`,
          }}
        />
        <div
          className="absolute top-1 transition-all duration-200 rounded-full"
          style={{
            width: 16,
            height: 16,
            background: value ? activeColor : '#3b4263',
            left: value ? 24 : 4,
            boxShadow: value ? `0 0 6px ${activeColor}` : 'none',
          }}
        />
      </button>
    </div>
  )
}

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteNode, drillInto, toggleActive, toggleRequired, findNodeById } = useFlowStore()

  const [form, setForm] = useState({
    label: '', description: '', color: '', logicNote: '', status: 'default',
  })

  useEffect(() => {
    if (selectedNode) {
      setForm({
        label: selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        color: selectedNode.data.color || LEVELS[selectedNode.data.level]?.color || '#6366f1',
        logicNote: selectedNode.data.logicNote || '',
        status: selectedNode.data.status || 'default',
      })
    }
  }, [selectedNode])

  const handleChange = useCallback(
    (field, value) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (selectedNode) updateNodeData(selectedNode.id, { [field]: value })
    },
    [selectedNode, updateNodeData]
  )

  const handleToggleActive = useCallback(() => {
    if (selectedNode) toggleActive(selectedNode.id)
  }, [selectedNode, toggleActive])

  const handleToggleRequired = useCallback(() => {
    if (selectedNode) toggleRequired(selectedNode.id)
  }, [selectedNode, toggleRequired])

  const handleDelete = useCallback(() => {
    if (selectedNode && window.confirm(`Delete "${selectedNode.data.label}"?`)) {
      deleteNode(selectedNode.id)
    }
  }, [selectedNode, deleteNode])

  const handleDrillIn = useCallback(() => {
    if (selectedNode) drillInto(selectedNode.id)
  }, [selectedNode, drillInto])

  if (!selectedNode) {
    return (
      <aside
        className="flex flex-col h-full items-center justify-center"
        style={{ width: 300, background: '#0d0f1a', borderLeft: '1px solid #1e2130' }}
      >
        <div className="text-center px-8 space-y-4">
          <div className="text-3xl">🖱️</div>
          <div className="text-sm font-semibold text-slate-400">No node selected</div>
          <div className="text-xs text-slate-600">Click any node on the canvas to configure it here.</div>
        </div>
      </aside>
    )
  }

  const level = selectedNode.data.level
  const meta = LEVELS[level]
  const accentColor = form.color || meta?.color || '#6366f1'
  const canDrillIn = meta?.next !== null

  // Live state from store (re-read so it stays in sync with toggles)
  const liveNode = findNodeById(selectedNode.id) || selectedNode
  const manualActive = liveNode.data.isActive !== false
  const isRequired   = liveNode.data.isRequired === true
  const effectiveActive = computeEffectiveActive(liveNode)

  return (
    <aside
      className="flex flex-col h-full"
      style={{ width: 300, background: '#0d0f1a', borderLeft: '1px solid #1e2130' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3 shrink-0"
        style={{
          borderBottom: `1px solid ${accentColor}33`,
          background: `${accentColor}0d`,
        }}
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{
            background: effectiveActive ? accentColor : '#555',
            boxShadow: effectiveActive ? `0 0 6px ${accentColor}` : 'none',
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-white truncate">{form.label || 'Untitled'}</div>
          <div className="text-xs" style={{ color: accentColor + '99' }}>{meta?.label} Node</div>
        </div>
        {/* Effective state badge */}
        <div
          className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
          style={{
            background: effectiveActive ? '#22c55e22' : '#ef444422',
            color: effectiveActive ? '#22c55e' : '#ef4444',
            border: `1px solid ${effectiveActive ? '#22c55e55' : '#ef444455'}`,
          }}
        >
          {effectiveActive ? '✓ ACTIVE' : '✗ INACTIVE'}
        </div>
        <button
          onClick={() => useFlowStore.getState().setSelectedNode(null)}
          className="text-slate-500 hover:text-white transition-colors text-sm leading-none shrink-0"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* ── Active / Required toggles ── */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Flow State
          </div>

          <ToggleSwitch
            value={manualActive}
            onChange={handleToggleActive}
            activeColor="#22c55e"
            label="Active"
          />

          <ToggleSwitch
            value={isRequired}
            onChange={handleToggleRequired}
            activeColor="#f59e0b"
            label="Required (for parent)"
          />

          {/* Effective state explanation */}
          {!effectiveActive && manualActive && (
            <div
              className="text-xs px-3 py-2 rounded-lg leading-relaxed"
              style={{ background: '#ef444418', color: '#ef4444', border: '1px solid #ef444433' }}
            >
              ⚠ A required child node is inactive — this node is effectively blocked.
            </div>
          )}
          {!manualActive && (
            <div
              className="text-xs px-3 py-2 rounded-lg leading-relaxed"
              style={{ background: '#ef444418', color: '#ef4444', border: '1px solid #ef444433' }}
            >
              ⚡ This node is manually turned OFF.
            </div>
          )}
          {isRequired && (
            <div
              className="text-xs px-3 py-2 rounded-lg leading-relaxed"
              style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b33' }}
            >
              ★ This node is required. If inactive, its parent becomes inactive.
            </div>
          )}
        </div>

        {/* ── Label ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Label
          </label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
            style={{ background: '#1a1d2e', border: `1px solid ${accentColor}44`, caretColor: accentColor }}
            onFocus={(e) => (e.target.style.borderColor = accentColor)}
            onBlur={(e) => (e.target.style.borderColor = accentColor + '44')}
            placeholder="Node label…"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none resize-none transition-all"
            style={{ background: '#1a1d2e', border: `1px solid ${accentColor}44`, caretColor: accentColor }}
            onFocus={(e) => (e.target.style.borderColor = accentColor)}
            onBlur={(e) => (e.target.style.borderColor = accentColor + '44')}
            placeholder="Brief description…"
          />
        </div>

        {/* ── Logic Note (bot level only) ── */}
        {level === 'bot' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Logic Note
            </label>
            <textarea
              value={form.logicNote}
              onChange={(e) => handleChange('logicNote', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-xs outline-none resize-none transition-all italic"
              style={{
                background: '#1a1d2e',
                border: `1px solid ${accentColor}44`,
                caretColor: accentColor,
                color: accentColor + 'cc',
              }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = accentColor + '44')}
              placeholder="IF condition → route…"
            />
          </div>
        )}

        {/* ── Status (bot level only) ── */}
        {level === 'bot' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const sc = { default: '#f59e0b', ok: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' }[s]
                return (
                  <button
                    key={s}
                    onClick={() => handleChange('status', s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.status === s ? `${sc}33` : `${sc}11`,
                      color: sc,
                      border: `1px solid ${form.status === s ? sc : sc + '33'}`,
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Color picker ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Node Color
          </label>
          <div className="flex flex-wrap gap-2.5 mb-3">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => handleChange('color', c)}
                className="w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95"
                style={{
                  background: c,
                  boxShadow: form.color === c ? `0 0 0 2px #0d0f1a, 0 0 0 4px ${c}` : `0 0 4px ${c}66`,
                  outline: form.color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shrink-0" style={{ background: form.color, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input
              type="text"
              value={form.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1 px-2 py-1 rounded text-xs text-white outline-none font-mono"
              style={{ background: '#1a1d2e', border: `1px solid ${accentColor}44` }}
              placeholder="#rrggbb"
            />
          </div>
        </div>

        {/* ── Node info ── */}
        <div className="rounded-xl p-4 space-y-2.5" style={{ background: '#1a1d2e', border: '1px solid #2a2d40' }}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Node Info</div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">ID</span>
            <span className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{selectedNode.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Level</span>
            <span className="text-xs font-semibold" style={{ color: meta?.color }}>{meta?.label}</span>
          </div>
          {level !== 'bot' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Children</span>
              <span className="text-xs text-slate-400">{liveNode.data.childNodes?.length || 0} nodes</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Effective</span>
            <span className="text-xs font-semibold" style={{ color: effectiveActive ? '#22c55e' : '#ef4444' }}>
              {effectiveActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 space-y-2.5" style={{ borderTop: '1px solid #1e2130' }}>
        {canDrillIn && (
          <button
            onClick={handleDrillIn}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}55` }}
          >
            Open {meta?.next === 'mid' ? 'Mid' : 'Bottom'} Canvas →
          </button>
        )}
        <button
          onClick={handleDelete}
          className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
          style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444433' }}
        >
          🗑 Delete Node
        </button>
      </div>
    </aside>
  )
}
