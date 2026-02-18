import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid'

// ─── Level metadata ───────────────────────────────────────────────────────────
export const LEVELS = {
  top: {
    label: 'Top Level',
    color: '#6366f1',
    bgDark: '#1e1b4b',
    bgCard: '#2e2b6e',
    border: '#6366f1',
    edgeClass: 'edge-top',
    handleColor: '#818cf8',
    next: 'mid',
  },
  mid: {
    label: 'Mid Level',
    color: '#10b981',
    bgDark: '#052e16',
    bgCard: '#064e3b',
    border: '#10b981',
    edgeClass: 'edge-mid',
    handleColor: '#34d399',
    next: 'bot',
  },
  bot: {
    label: 'Bottom Level',
    color: '#f59e0b',
    bgDark: '#1c1204',
    bgCard: '#431407',
    border: '#f59e0b',
    edgeClass: 'edge-bot',
    handleColor: '#fbbf24',
    next: null,
  },
}

// ─── Compute effective active state for a node ────────────────────────────────
// A node is "effectively active" if:
//   - It is manually active (isActive !== false)
//   - AND its gate logic (AND/OR/NAND) is satisfied by its REQUIRED children
export function computeEffectiveActive(node) {
  if (node.data.isActive === false) return false
  const children = node.data.childNodes || []
  if (!children.length) return true
  const requiredChildren = children.filter((c) => c.data.isRequired === true)
  if (!requiredChildren.length) return true

  const gate = node.data.gateType || 'AND'
  if (gate === 'AND') return requiredChildren.every((c) => computeEffectiveActive(c))
  if (gate === 'OR') return requiredChildren.some((c) => computeEffectiveActive(c))
  if (gate === 'NAND') return !requiredChildren.every((c) => computeEffectiveActive(c))
  return true // fallback
}

// ─── Default starter data ─────────────────────────────────────────────────────
const makeDefaultTopNodes = () => [
  {
    id: 'top-1',
    type: 'topNode',
    position: { x: 80, y: 120 },
    data: {
      label: 'Receiving',
      description: 'Inbound goods processing',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-1'),
      childEdges: makeDefaultMidEdges('top-1'),
    },
  },
  {
    id: 'top-2',
    type: 'topNode',
    position: { x: 380, y: 120 },
    data: {
      label: 'Inspection',
      description: 'Visual and functional checks',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-2'),
      childEdges: makeDefaultMidEdges('top-2'),
    },
  },
  {
    id: 'top-3',
    type: 'topNode',
    position: { x: 680, y: 120 },
    data: {
      label: 'Pre-Audit',
      description: 'Preliminary documentation review',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-3'),
      childEdges: makeDefaultMidEdges('top-3'),
    },
  },
  {
    id: 'top-4',
    type: 'topNode',
    position: { x: 980, y: 120 },
    data: {
      label: 'Audit',
      description: 'Detailed compliance verification',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-4'),
      childEdges: makeDefaultMidEdges('top-4'),
    },
  },
  {
    id: 'top-5',
    type: 'topNode',
    position: { x: 1280, y: 120 },
    data: {
      label: 'Packing',
      description: 'Prepare items for shipment',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-5'),
      childEdges: makeDefaultMidEdges('top-5'),
    },
  },
  {
    id: 'top-6',
    type: 'topNode',
    position: { x: 1580, y: 120 },
    data: {
      label: 'Shipping',
      description: 'Outbound dispatch',
      color: '#6366f1',
      level: 'top',
      isActive: true,
      isRequired: false,
      gateType: 'AND',
      childNodes: makeDefaultMidNodes('top-6'),
      childEdges: makeDefaultMidEdges('top-6'),
    },
  },
]

const makeDefaultMidNodes = (parentId) => [
  {
    id: `mid-${parentId}-1`,
    type: 'midNode',
    position: { x: 80, y: 100 },
    data: {
      label: 'Scan',
      description: 'Scan item identifiers',
      color: '#10b981',
      level: 'mid',
      parentId,
      isActive: true,
      isRequired: true,
      gateType: 'AND',
      childNodes: makeDefaultBotNodes(`mid-${parentId}-1`),
      childEdges: makeDefaultBotEdges(`mid-${parentId}-1`),
    },
  },
  {
    id: `mid-${parentId}-2`,
    type: 'midNode',
    position: { x: 380, y: 100 },
    data: {
      label: 'Verify',
      description: 'Validate item details',
      color: '#10b981',
      level: 'mid',
      parentId,
      isActive: true,
      isRequired: true,
      gateType: 'AND',
      childNodes: [],
      childEdges: [],
    },
  },
  {
    id: `mid-${parentId}-3`,
    type: 'midNode',
    position: { x: 680, y: 100 },
    data: {
      label: 'Record',
      description: 'Log transaction in system',
      color: '#10b981',
      level: 'mid',
      parentId,
      isActive: true,
      isRequired: true,
      gateType: 'AND',
      childNodes: [],
      childEdges: [],
    },
  },
]

const makeDefaultMidEdges = (parentId) => [
  {
    id: `e-mid-${parentId}-1-2`,
    source: `mid-${parentId}-1`,
    target: `mid-${parentId}-2`,
    className: 'edge-mid',
    animated: true,
    label: '',
    data: { level: 'mid' },
  },
  {
    id: `e-mid-${parentId}-2-3`,
    source: `mid-${parentId}-2`,
    target: `mid-${parentId}-3`,
    className: 'edge-mid',
    animated: true,
    label: '',
    data: { level: 'mid' },
  },
]

const makeDefaultBotNodes = (parentId) => [
  {
    id: `bot-${parentId}-1`,
    type: 'botNode',
    position: { x: 80, y: 100 },
    data: {
      label: 'Missing NSN',
      description: 'NSN not found in system',
      color: '#f59e0b',
      level: 'bot',
      parentId,
      isActive: true,
      isRequired: true,
      childNodes: [],
      childEdges: [],
    },
  },
  {
    id: `bot-${parentId}-2`,
    type: 'botNode',
    position: { x: 380, y: 100 },
    data: {
      label: 'NSN Found',
      description: 'Item matched and recorded',
      color: '#f59e0b',
      level: 'bot',
      parentId,
      isActive: true,
      isRequired: false,
      childNodes: [],
      childEdges: [],
    },
  },
]

const makeDefaultBotEdges = (parentId) => [
  {
    id: `e-bot-${parentId}-1-2`,
    source: `bot-${parentId}-1`,
    target: `bot-${parentId}-2`,
    className: 'edge-bot',
    animated: true,
    label: '',
    data: { level: 'bot' },
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────
const useFlowStore = create((set, get) => ({
  // Navigation stack: array of { level, parentNodeId, label }
  navStack: [{ level: 'top', parentNodeId: null, label: 'Warehouse' }],

  // Top-level nodes/edges
  topNodes: makeDefaultTopNodes(),
  topEdges: [
    {
      id: 'e-top-1-2',
      source: 'top-1',
      target: 'top-2',
      className: 'edge-top',
      animated: true,
      label: '',
      data: { level: 'top' },
    },
    {
      id: 'e-top-2-3',
      source: 'top-2',
      target: 'top-3',
      className: 'edge-top',
      animated: true,
      label: '',
      data: { level: 'top' },
    },
    {
      id: 'e-top-3-4',
      source: 'top-3',
      target: 'top-4',
      className: 'edge-top',
      animated: true,
      label: '',
      data: { level: 'top' },
    },
    {
      id: 'e-top-4-5',
      source: 'top-4',
      target: 'top-5',
      className: 'edge-top',
      animated: true,
      label: '',
      data: { level: 'top' },
    },
    {
      id: 'e-top-5-6',
      source: 'top-5',
      target: 'top-6',
      className: 'edge-top',
      animated: true,
      label: '',
      data: { level: 'top' },
    },
  ],

  // Selected node for config panel
  selectedNode: null,

  // ─── Getters ───────────────────────────────────────────────────────────────
  getCurrentNav() {
    const { navStack } = get()
    return navStack[navStack.length - 1]
  },

  getCurrentFlow() {
    const { navStack, topNodes, topEdges } = get()
    const nav = navStack[navStack.length - 1]
    if (nav.level === 'top') {
      return { nodes: topNodes, edges: topEdges }
    }
    const parent = get().findNodeById(nav.parentNodeId)
    if (!parent) return { nodes: [], edges: [] }
    return {
      nodes: parent.data.childNodes || [],
      edges: parent.data.childEdges || [],
    }
  },

  findNodeById(id) {
    const { topNodes } = get()
    const queue = [...topNodes]
    while (queue.length) {
      const node = queue.shift()
      if (node.id === id) return node
      if (node.data.childNodes) queue.push(...node.data.childNodes)
    }
    return null
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  drillInto(nodeId) {
    const node = get().findNodeById(nodeId)
    if (!node) return
    const levelMeta = LEVELS[node.data.level]
    if (!levelMeta.next) return

    set((state) => ({
      navStack: [
        ...state.navStack,
        {
          level: levelMeta.next,
          parentNodeId: nodeId,
          label: node.data.label,
        },
      ],
      selectedNode: null,
    }))
  },

  navigateTo(index) {
    set((state) => ({
      navStack: state.navStack.slice(0, index + 1),
      selectedNode: null,
    }))
  },

  // ─── Node/edge changes ─────────────────────────────────────────────────────
  onNodesChange(changes) {
    const { navStack, topNodes } = get()
    const nav = navStack[navStack.length - 1]
    if (nav.level === 'top') {
      set({ topNodes: applyNodeChanges(changes, topNodes) })
    } else {
      set({ topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childNodes', (nodes) => applyNodeChanges(changes, nodes)) })
    }
  },

  onEdgesChange(changes) {
    const { navStack, topNodes, topEdges } = get()
    const nav = navStack[navStack.length - 1]
    if (nav.level === 'top') {
      set({ topEdges: applyEdgeChanges(changes, topEdges) })
    } else {
      set({ topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childEdges', (edges) => applyEdgeChanges(changes, edges)) })
    }
  },

  onConnect(connection) {
    const { navStack, topNodes, topEdges } = get()
    const nav = navStack[navStack.length - 1]
    const levelMeta = LEVELS[nav.level]
    const newEdge = {
      ...connection,
      id: `e-${uuidv4()}`,
      animated: true,
      className: levelMeta.edgeClass,
      label: '',
      data: { level: nav.level },
    }
    if (nav.level === 'top') {
      set({ topEdges: addEdge(newEdge, topEdges) })
    } else {
      set({ topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childEdges', (edges) => addEdge(newEdge, edges)) })
    }
  },

  // ─── Toggle isActive ───────────────────────────────────────────────────────
  toggleActive(nodeId) {
    const node = get().findNodeById(nodeId)
    if (!node) return
    const newVal = node.data.isActive === false ? true : false
    const { topNodes } = get()
    set({ topNodes: updateNodeDataDeep(topNodes, nodeId, { isActive: newVal }) })
    // Refresh selectedNode
    const { selectedNode } = get()
    if (selectedNode?.id === nodeId) {
      set({ selectedNode: get().findNodeById(nodeId) })
    }
  },

  // ─── Toggle isRequired ─────────────────────────────────────────────────────
  toggleRequired(nodeId) {
    const node = get().findNodeById(nodeId)
    if (!node) return
    const newVal = node.data.isRequired === true ? false : true
    const { topNodes } = get()
    set({ topNodes: updateNodeDataDeep(topNodes, nodeId, { isRequired: newVal }) })
    // Refresh selectedNode
    const { selectedNode } = get()
    if (selectedNode?.id === nodeId) {
      set({ selectedNode: get().findNodeById(nodeId) })
    }
  },

  // ─── Add node ──────────────────────────────────────────────────────────────
  addNode(level, position, label = '') {
    const levelMeta = LEVELS[level]
    const { navStack, topNodes } = get()
    const nav = navStack[navStack.length - 1]
    const nodeTypeMap = { top: 'topNode', mid: 'midNode', bot: 'botNode' }

    const newNode = {
      id: uuidv4(),
      type: nodeTypeMap[level],
      position,
      data: {
        label: label || `New ${levelMeta.label} Node`,
        description: '',
        color: levelMeta.color,
        level,
        parentId: nav.parentNodeId || null,
        isActive: true,
        isRequired: false,
        gateType: level === 'bot' ? undefined : 'AND',
        childNodes: [],
        childEdges: [],
      },
    }

    if (nav.level === 'top') {
      set({ topNodes: [...topNodes, newNode] })
    } else {
      set({ topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childNodes', (nodes) => [...nodes, newNode]) })
    }
    return newNode
  },

  // ─── Update node data ──────────────────────────────────────────────────────
  updateNodeData(nodeId, updates) {
    const { topNodes } = get()
    set({ topNodes: updateNodeDataDeep(topNodes, nodeId, updates) })
    const { selectedNode } = get()
    if (selectedNode?.id === nodeId) {
      set({ selectedNode: get().findNodeById(nodeId) })
    }
  },

  // ─── Delete node ───────────────────────────────────────────────────────────
  deleteNode(nodeId) {
    const { topNodes, topEdges, navStack } = get()
    const nav = navStack[navStack.length - 1]
    if (nav.level === 'top') {
      set({
        topNodes: topNodes.filter((n) => n.id !== nodeId),
        topEdges: topEdges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNode: null,
      })
    } else {
      set({
        topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childNodes', (nodes) => nodes.filter((n) => n.id !== nodeId)),
        selectedNode: null,
      })
      set({
        topNodes: applyToChildren(get().topNodes, nav.parentNodeId, 'childEdges', (edges) =>
          edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
        ),
      })
    }
  },

  // ─── Delete edge ───────────────────────────────────────────────────────────
  deleteEdge(edgeId) {
    const { topNodes, topEdges, navStack } = get()
    const nav = navStack[navStack.length - 1]
    if (nav.level === 'top') {
      set({ topEdges: topEdges.filter((e) => e.id !== edgeId) })
    } else {
      set({
        topNodes: applyToChildren(topNodes, nav.parentNodeId, 'childEdges', (edges) => edges.filter((e) => e.id !== edgeId)),
      })
    }
  },

  // ─── Select/deselect ───────────────────────────────────────────────────────
  setSelectedNode(node) {
    set({ selectedNode: node })
  },

  // ─── Save & Load ──────────────────────────────────────────────────────────
  exportFlow() {
    const { topNodes, topEdges } = get()
    const data = { topNodes, topEdges, version: 1 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dyeflow-export.json'
    a.click()
    URL.revokeObjectURL(url)
  },

  importFlow(json) {
    try {
      const data = JSON.parse(json)
      if (data.topNodes && data.topEdges) {
        set({
          topNodes: data.topNodes,
          topEdges: data.topEdges,
          navStack: [{ level: 'top', parentNodeId: null, label: 'Warehouse' }],
          selectedNode: null,
        })
      }
    } catch (e) {
      console.error('Import failed:', e)
    }
  },
}))

// ─── Tree helpers ─────────────────────────────────────────────────────────────
function applyToChildren(nodes, targetId, field, transform) {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return {
        ...node,
        data: { ...node.data, [field]: transform(node.data[field] || []) },
      }
    }
    if (node.data.childNodes?.length) {
      return {
        ...node,
        data: { ...node.data, childNodes: applyToChildren(node.data.childNodes, targetId, field, transform) },
      }
    }
    return node
  })
}

function updateNodeDataDeep(nodes, targetId, updates) {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, data: { ...node.data, ...updates } }
    }
    if (node.data.childNodes?.length) {
      return {
        ...node,
        data: { ...node.data, childNodes: updateNodeDataDeep(node.data.childNodes, targetId, updates) },
      }
    }
    return node
  })
}

export default useFlowStore
