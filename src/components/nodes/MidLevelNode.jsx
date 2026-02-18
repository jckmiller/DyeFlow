import { memo, useCallback } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import useFlowStore, { computeEffectiveActive } from '../../store/useFlowStore'

const MidLevelNode = memo(({ id, data, selected }) => {
  const { drillInto, setSelectedNode, findNodeById, toggleActive, toggleRequired } = useFlowStore()

  const handleDrillIn = useCallback((e) => { e.stopPropagation(); drillInto(id) }, [id, drillInto])
  const handleSelect  = useCallback((e) => { e.stopPropagation(); setSelectedNode(findNodeById(id)) }, [id, setSelectedNode, findNodeById])
  const handleToggleActive   = useCallback((e) => { e.stopPropagation(); toggleActive(id) }, [id, toggleActive])
  const handleToggleRequired = useCallback((e) => { e.stopPropagation(); toggleRequired(id) }, [id, toggleRequired])

  const accentColor  = data.color || '#10b981'
  const childCount   = data.childNodes?.length || 0
  const manualActive = data.isActive !== false
  const isRequired   = data.isRequired === true
  const effectiveActive = computeEffectiveActive(findNodeById(id) || { data })

  const dimmed      = !effectiveActive
  const borderColor = selected ? '#6ee7b7' : dimmed ? '#444' : accentColor

  return (
    <div
      onClick={handleSelect}
      className={`relative flex flex-col h-full cursor-pointer transition-all duration-300 ${selected ? 'node-selected' : ''}`}
      style={{
        minWidth: 250,
        minHeight: 130,
        borderRadius: 14,
        background: dimmed
          ? 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)',
        border: `2px ${dimmed ? 'dashed' : 'solid'} ${borderColor}`,
        boxShadow: selected
          ? `0 0 0 2px ${accentColor}55, 0 8px 32px ${accentColor}44`
          : dimmed ? 'none' : `0 4px 24px ${accentColor}33`,
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? 'saturate(0.15)' : 'none',
      }}
    >
      <NodeResizer
        color={accentColor}
        isVisible={selected}
        minWidth={210}
        minHeight={120}
        handleStyle={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${accentColor}` }}
        lineStyle={{ border: `1.5px dashed ${accentColor}66` }}
      />

      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 shrink-0"
        style={{
          background: `${accentColor}22`,
          borderBottom: `1px solid ${dimmed ? '#333' : accentColor + '55'}`,
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: accentColor, boxShadow: dimmed ? 'none' : `0 0 8px ${accentColor}` }} />
        <span className="text-xs font-bold uppercase tracking-widest flex-1" style={{ color: dimmed ? '#555' : accentColor }}>
          MID LEVEL
        </span>

        {/* Gate badge */}
        <div
          className="text-xs px-1.5 py-0.5 rounded font-bold"
          style={{
            background: dimmed ? '#333' : accentColor + '33',
            color: dimmed ? '#777' : accentColor,
            border: `1px solid ${dimmed ? '#444' : accentColor + '55'}`,
          }}
        >
          {data.gateType === 'OR' ? '∨' : data.gateType === 'NAND' ? '⊼' : '∧'}
        </div>

        {/* Active/Inactive toggle */}
        <button
          onClick={handleToggleActive}
          title={manualActive ? 'Click to deactivate' : 'Click to activate'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:brightness-125"
          style={{
            background: manualActive ? '#22c55e22' : '#ef444422',
            color: manualActive ? '#22c55e' : '#ef4444',
            border: `1px solid ${manualActive ? '#22c55e55' : '#ef444455'}`,
          }}
        >
          <span style={{ fontSize: 8 }}>●</span>
          {manualActive ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex-1 min-h-0">
        <div className="text-base font-bold text-white mb-2 leading-snug">{data.label}</div>
        {data.description && (
          <div className="text-sm text-emerald-300/60 leading-relaxed">{data.description}</div>
        )}
        {manualActive && !effectiveActive && (
          <div className="mt-3 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}>
            ⚠ Required child inactive
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 flex items-center justify-between shrink-0"
        style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '0 0 12px 12px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#064e3b' }}>{childCount} sub-node{childCount !== 1 ? 's' : ''}</span>
          <button
            onClick={handleToggleRequired}
            title={isRequired ? 'Mark as optional' : 'Mark as required'}
            className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:brightness-125"
            style={{
              background: isRequired ? '#f59e0b22' : '#ffffff0d',
              color: isRequired ? '#f59e0b' : '#555',
              border: `1px solid ${isRequired ? '#f59e0b55' : '#333'}`,
            }}
          >
            {isRequired ? '★ REQ' : '☆ OPT'}
          </button>
        </div>
        <button
          onClick={handleDrillIn}
          className="text-xs px-4 py-2 rounded-lg font-semibold transition-all duration-150 hover:brightness-125 active:scale-95"
          style={{ background: `${accentColor}33`, color: accentColor, border: `1px solid ${accentColor}66` }}
        >
          Open →
        </button>
      </div>

      <Handle type="target" position={Position.Left}  style={{ background: accentColor, border: '2px solid #052e16', width: 13, height: 13 }} />
      <Handle type="source" position={Position.Right} style={{ background: accentColor, border: '2px solid #052e16', width: 13, height: 13 }} />
      <Handle type="target" id="top-in"  position={Position.Top}    style={{ background: accentColor, border: '2px solid #052e16', width: 11, height: 11 }} />
      <Handle type="source" id="bot-out" position={Position.Bottom} style={{ background: accentColor, border: '2px solid #052e16', width: 11, height: 11 }} />
    </div>
  )
})

MidLevelNode.displayName = 'MidLevelNode'
export default MidLevelNode
