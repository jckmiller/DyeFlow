import { ReactFlowProvider } from '@xyflow/react'
import Sidebar from './components/Sidebar'
import Breadcrumb from './components/Breadcrumb'
import NodeCanvas from './components/NodeCanvas'
import NodeConfigPanel from './components/NodeConfigPanel'
import useFlowStore, { LEVELS } from './store/useFlowStore'

function AppInner() {
  const { navStack } = useFlowStore()
  const nav = navStack[navStack.length - 1]
  const levelMeta = LEVELS[nav.level]

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Left Sidebar ─────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Area ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Breadcrumb nav bar */}
        <Breadcrumb />

        {/* Canvas area + level label overlay */}
        <div className="flex-1 relative overflow-hidden">
          {/* Level watermark */}
          <div
            className="absolute top-3 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-none select-none"
            style={{
              background: `${levelMeta.color}15`,
              border: `1px solid ${levelMeta.color}33`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: levelMeta.color }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: levelMeta.color }}
            >
              {levelMeta.label} Canvas
            </span>
          </div>

          <NodeCanvas />
        </div>
      </div>

      {/* ── Right Config Panel ────────────────────────────────────── */}
      <NodeConfigPanel />
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  )
}
