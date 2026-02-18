import { useCallback, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import useFlowStore, { LEVELS, computeEffectiveActive } from '../store/useFlowStore'
import TopLevelNode from './nodes/TopLevelNode'
import MidLevelNode from './nodes/MidLevelNode'
import BottomLevelNode from './nodes/BottomLevelNode'

const nodeTypes = {
  topNode: TopLevelNode,
  midNode: MidLevelNode,
  botNode: BottomLevelNode,
}

export default function NodeCanvas() {
  const {
    navStack,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
    deleteEdge,
    getCurrentFlow,
    findNodeById,
  } = useFlowStore()

  const nav = navStack[navStack.length - 1]
  const levelMeta = LEVELS[nav.level]
  const { nodes, edges } = getCurrentFlow()
  const reactFlowWrapper = useRef(null)
  const { screenToFlowPosition } = useReactFlow()

  // Build a quick lookup of nodeId → effectiveActive
  const activeMap = useMemo(() => {
    const map = {}
    nodes.forEach((n) => {
      const full = findNodeById(n.id) || n
      map[n.id] = computeEffectiveActive(full)
    })
    return map
  }, [nodes, findNodeById])

  // Enrich edges: dim edges whose source node is inactive
  const enrichedEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceActive = activeMap[edge.source] !== false
      if (!sourceActive) {
        return {
          ...edge,
          animated: false,
          style: { stroke: '#444', strokeDasharray: '5 5', strokeWidth: 2, opacity: 0.4 },
        }
      }
      return {
        ...edge,
        animated: true,
        style: undefined,
      }
    })
  }, [edges, activeMap])

  // ── Drop handler ────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/dyeflow-level')
      const label = e.dataTransfer.getData('application/dyeflow-label') || ''
      if (!type) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addNode(type, position, label)
    },
    [screenToFlowPosition, addNode]
  )

  const onEdgeDoubleClick = useCallback(
    (e, edge) => {
      e.stopPropagation()
      deleteEdge(edge.id)
    },
    [deleteEdge]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  const minimapNodeColor = useCallback(
    (node) => {
      const isActive = activeMap[node.id] !== false
      return isActive ? (node.data?.color || levelMeta.color) : '#444'
    },
    [activeMap, levelMeta.color]
  )

  const isDrilledIn = navStack.length > 1
  const parentNav = navStack[navStack.length - 2]

  const handleBack = () => {
    if (isDrilledIn) navigateTo(navStack.length - 2)
  }

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative"
      style={{ background: levelMeta.bgDark }}
    >
      {/* Floating back button */}
      {isDrilledIn && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-125 active:scale-95 shadow-lg"
          style={{
            background: '#1a1d2e',
            color: '#64748b',
            border: '1px solid #2a2d40',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
          title={`Back to ${parentNav.label}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to {parentNav.label}
        </button>
      )}

      <ReactFlow
        nodes={nodes}
        edges={enrichedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onPaneClick={onPaneClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={['Delete', 'Backspace']}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={`${levelMeta.color}33`}
        />
        <Controls
          style={{
            background: '#1a1d2e',
            border: `1px solid ${levelMeta.color}44`,
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0,0,0,0.7)"
          style={{
            background: '#1a1d2e',
            border: `1px solid ${levelMeta.color}44`,
            borderRadius: '10px',
          }}
        />
      </ReactFlow>
    </div>
  )
}
