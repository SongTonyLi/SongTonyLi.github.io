/**
 * Level 3 — The Machinery (Slides 21-30)
 * Deep technical details: query loop, token math, circuit breaker,
 * reactive compact, context collapse, API invariants, post-compact,
 * fork agent, complete decision tree, and closing philosophy.
 */

import { useMemo, useCallback, useState, useRef, memo } from 'react'
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react'

// ─── Shared interactive node ─────────────────────────────────────────────────

function MachineNode({ data }: { data: Record<string, unknown> }) {
  const { setCenter } = useReactFlow()
  const onClick = useCallback(() => {
    const x = (data._posX as number) ?? 0
    const y = (data._posY as number) ?? 0
    setCenter(x + 120, y + 40, { zoom: 1.8, duration: 600 })
  }, [data._posX, data._posY, setCenter])

  return (
    <div
      onClick={onClick}
      className="ctx-node-inner px-3 py-2.5 rounded-xl border-2 text-white shadow-lg cursor-pointer hover:brightness-110 transition-all duration-300"
      style={{
        background: data.bg as string,
        borderColor: data.borderColor as string,
        minWidth: data.wide ? 260 : 200,
        ['--glow-color' as string]: data.glow as string,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <div className="flex items-center gap-2 mb-0.5">
        <span style={{ fontSize: '0.9rem' }}>{String(data.icon)}</span>
        <span className="font-bold text-[12px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          {String(data.label)}
        </span>
      </div>
      {data.detail ? (
        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 230 }}>
          {String(data.detail)}
        </p>
      ) : null}
      {data.badge ? (
        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style={{
          background: (data.badgeBg as string) ?? 'rgba(255,255,255,0.1)',
          color: (data.badgeColor as string) ?? '#fff',
        }}>
          {String(data.badge)}
        </span>
      ) : null}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
    </div>
  )
}

const machineNodeTypes = { mNode: MachineNode }

// ─── Slide 21: Query Loop Integration ────────────────────────────────────────

function S21_QueryLoop() {
  const nodes: Node[] = useMemo(() => [
    { id: 'api_call', type: 'mNode', position: { x: 220, y: 0 }, data: { icon: '📡', label: 'API Call (query.ts)', detail: 'Send messages + tools to Claude API', bg: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.4)', glow: 'rgba(129,140,248,0.3)', _posX: 220, _posY: 0 } },
    { id: 'response', type: 'mNode', position: { x: 220, y: 100 }, data: { icon: '💬', label: 'Process Response', detail: 'Handle stop_reason, tool_use blocks', bg: 'rgba(129,140,248,0.1)', borderColor: 'rgba(129,140,248,0.3)', glow: 'rgba(129,140,248,0.2)', _posX: 220, _posY: 100 } },
    { id: 'tools', type: 'mNode', position: { x: 220, y: 200 }, data: { icon: '🔧', label: 'Execute Tools', detail: 'Bash, Read, Write, Edit, Grep, Glob...', bg: 'rgba(129,140,248,0.1)', borderColor: 'rgba(129,140,248,0.3)', glow: 'rgba(129,140,248,0.2)', _posX: 220, _posY: 200 } },
    { id: 'snip_pre', type: 'mNode', position: { x: 220, y: 310 }, data: { icon: '🚨', label: 'Snip (query.ts:424)', detail: 'Emergency: if already over limit', badge: 'LINE 424', badgeBg: 'rgba(244,63,94,0.2)', badgeColor: '#f43f5e', bg: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.3)', glow: 'rgba(244,63,94,0.2)', _posX: 220, _posY: 310 } },
    { id: 'micro', type: 'mNode', position: { x: 220, y: 410 }, data: { icon: '✂️', label: 'Microcompact (query.ts:437)', detail: 'L1: Clear expired tool results', badge: 'LINE 437', badgeBg: 'rgba(16,185,129,0.2)', badgeColor: '#10b981', bg: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.2)', _posX: 220, _posY: 410 } },
    { id: 'collapse', type: 'mNode', position: { x: 0, y: 470 }, data: { icon: '🗜️', label: 'Context Collapse', detail: 'Fold 10K+ blocks (if enabled)', badge: 'LINE 463', badgeBg: 'rgba(139,92,246,0.2)', badgeColor: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.2)', _posX: 0, _posY: 470 } },
    { id: 'auto', type: 'mNode', position: { x: 220, y: 520 }, data: { icon: '📊', label: 'autoCompactIfNeeded (query.ts:496)', detail: 'L2 orchestrator: threshold → strategy', badge: 'LINE 496', badgeBg: 'rgba(59,130,246,0.2)', badgeColor: '#3b82f6', bg: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', glow: 'rgba(59,130,246,0.3)', wide: true, _posX: 220, _posY: 520 } },
    { id: 'next', type: 'mNode', position: { x: 220, y: 630 }, data: { icon: '🔁', label: 'Next Turn', detail: 'Back to API call with compressed messages', bg: 'rgba(129,140,248,0.1)', borderColor: 'rgba(129,140,248,0.3)', glow: 'rgba(129,140,248,0.2)', _posX: 220, _posY: 630 } },
  ], [])

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'api_call', target: 'response', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
    { id: 'e2', source: 'response', target: 'tools', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 }, label: 'tool_use', labelStyle: { fill: '#6b6b66', fontSize: 9 } },
    { id: 'e3', source: 'tools', target: 'snip_pre', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
    { id: 'e4', source: 'snip_pre', target: 'micro', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e5', source: 'micro', target: 'auto', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e5b', source: 'micro', target: 'collapse', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '4 3' }, label: 'if enabled', labelStyle: { fill: '#8b5cf6', fontSize: 9 } },
    { id: 'e6', source: 'auto', target: 'next', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e7', source: 'next', target: 'api_call', animated: true, style: { stroke: '#818cf8', strokeWidth: 1.5, strokeDasharray: '6 4' }, type: 'smoothstep' },
  ], [])

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="reveal-stagger flex flex-col items-center gap-2 pt-6 z-10">
        <p className="slide-h3" style={{ color: '#f43f5e' }}>Level 3 — The Machinery</p>
        <h2 className="slide-h2" style={{ fontSize: '2.5vw' }}>Where Each Layer Runs in query.ts</h2>
      </div>
      <div className="flex-1 w-full" style={{ minHeight: '65vh' }}>
        <ReactFlowProvider>
          <S21_Inner nodes={nodes} edges={edges} />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

function S21_Inner({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const { setCenter } = useReactFlow()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Only create new objects for nodes whose selection state changed
  const prevSelectedRef = useRef<string | null>(null)
  const litRef = useRef(nodes)
  if (prevSelectedRef.current !== selectedId) {
    litRef.current = nodes.map(n => {
      const wasSelected = n.id === prevSelectedRef.current
      const isSelected = n.id === selectedId
      if (wasSelected || isSelected) return { ...n, selected: isSelected }
      return n // same reference — React/ReactFlow skips re-render
    })
    prevSelectedRef.current = selectedId
  }
  const lit = litRef.current

  const handleClick = useCallback((_: unknown, node: Node) => {
    const x = (node.data._posX as number) ?? 0
    const y = (node.data._posY as number) ?? 0
    setCenter(x + 120, y + 40, { zoom: 1.8, duration: 600 })
    setSelectedId(prev => prev === node.id ? null : node.id)
  }, [setCenter])

  return (
    <ReactFlow
      nodes={lit}
      edges={edges}
      nodeTypes={machineNodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable={false}
      onNodeClick={handleClick}
      defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } }}
    >
      <Background color="rgba(255,255,255,0.015)" gap={30} />
    </ReactFlow>
  )
}

// ─── Slide 22: Token Math ────────────────────────────────────────────────────

function S22_TokenMath() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-6">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>The Gotcha</p>
      <h2 className="slide-h2">Why <span className="mono accent">inputTokens</span> lies</h2>

      <div className="flex gap-8 mt-4" style={{ width: '82vw' }}>
        <div className="flex-1 flex flex-col gap-4">
          <div className="code-block" style={{ fontSize: '1.4vw', lineHeight: 1.6 }}>
            <span style={{ color: '#6b6b66' }}>// Anthropic API response usage:</span>{'\n'}
            {'{'}{'\n'}
            {'  '}<span style={{ color: '#c084fc' }}>"input_tokens"</span>: <span style={{ color: '#fbbf24' }}>3</span>,          <span style={{ color: '#6b6b66' }}>// ← only NON-cached!</span>{'\n'}
            {'  '}<span style={{ color: '#c084fc' }}>"cache_read_input_tokens"</span>: <span style={{ color: '#fbbf24' }}>17893</span>,{'\n'}
            {'  '}<span style={{ color: '#c084fc' }}>"cache_creation_input_tokens"</span>: <span style={{ color: '#fbbf24' }}>4018</span>{'\n'}
            {'}'}{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// Real context size:</span>{'\n'}
            total = <span style={{ color: '#fbbf24' }}>3</span> + <span style={{ color: '#fbbf24' }}>17893</span> + <span style={{ color: '#fbbf24' }}>4018</span> = <span style={{ color: '#10b981', fontWeight: 'bold' }}>21,914</span>
          </div>

          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.2vw' }}>
            With prompt caching, <code style={{ color: '#f43f5e' }}>input_tokens</code> only counts the <strong style={{ color: 'var(--fg)' }}>new, non-cached</strong> tokens.
            If you use it for threshold calculation, you&apos;ll think context is 3 tokens when it&apos;s actually 22K.
          </p>
        </div>

        <div className="flex-1">
          {/* Visual: stacked bar showing token composition */}
          <p className="mono mb-3" style={{ color: 'var(--dim)', fontSize: '1.15vw' }}>Token Composition</p>
          <div className="flex flex-col gap-4">
            {/* Correct */}
            <div>
              <p className="mono mb-1" style={{ color: '#10b981', fontSize: '1.15vw' }}>✅ Correct total context</p>
              <div className="flex rounded-lg overflow-hidden" style={{ height: '4.5vh' }}>
                <div className="flex items-center justify-center" style={{ width: '82%', background: 'rgba(59,130,246,0.4)' }}>
                  <span className="mono text-white" style={{ fontSize: '0.95vw' }}>cache_read (82%)</span>
                </div>
                <div className="flex items-center justify-center" style={{ width: '18%', background: 'rgba(139,92,246,0.4)' }}>
                  <span className="mono text-white" style={{ fontSize: '0.95vw' }}>create</span>
                </div>
                <div style={{ width: '0.1%', background: 'rgba(16,185,129,0.6)' }} />
              </div>
              <p className="mono mt-1" style={{ color: '#10b981', fontSize: '1.15vw' }}>21,914 tokens</p>
            </div>

            {/* Wrong */}
            <div>
              <p className="mono mb-1" style={{ color: '#f43f5e', fontSize: '1.15vw' }}>❌ Using just inputTokens</p>
              <div className="flex rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', height: '4.5vh' }}>
                <div className="flex items-center" style={{ width: '0.5%', background: 'rgba(16,185,129,0.6)', minWidth: '4px' }} />
              </div>
              <p className="mono mt-1" style={{ color: '#f43f5e', fontSize: '1.15vw' }}>3 tokens (!)</p>
            </div>
          </div>

          <div className="mt-6 glass-card p-4" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
            <p className="mono font-bold" style={{ color: '#f43f5e', fontSize: '1.2vw' }}>The Formula</p>
            <p className="mono mt-2" style={{ color: 'var(--fg)', fontSize: '1.2vw' }}>
              total = inputTokens + cacheRead + cacheCreate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 23: Circuit Breaker ───────────────────────────────────────────────

function S23_CircuitBreaker() {
  const [failures, setFailures] = useState(0)
  const tripped = failures >= 3

  return (
    <div className="reveal-stagger flex flex-col items-center gap-6">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>Safety Mechanism</p>
      <h2 className="slide-h2">Circuit Breaker</h2>

      <div className="flex gap-8 mt-4" style={{ width: '80vw' }}>
        <div className="flex-1 flex flex-col gap-4">
          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.25vw' }}>
            BQ analysis revealed <strong style={{ color: 'var(--fg)' }}>1,279 sessions</strong> with 50+ consecutive
            compaction failures (max: 3,272). This wasted <strong style={{ color: '#f43f5e' }}>~250K API calls/day</strong>.
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.25vw' }}>
            Solution: after <strong style={{ color: '#f43f5e' }}>3 consecutive failures</strong>, skip compaction
            entirely and fall through to emergency snip. Resets to 0 on any success.
          </p>

          <div className="code-block" style={{ fontSize: '1.35vw', lineHeight: 1.65, whiteSpace: 'pre' }}>
            <span style={{ color: '#c084fc' }}>if</span>{' (consecutiveFailures '}<span style={{ color: '#fbbf24' }}>{'>='}</span>{' '}<span style={{ color: '#fbbf24' }}>3</span>{') {'}{'\n'}
            {'  '}<span style={{ color: '#6b6b66' }}>{'// Skip compaction, go to snip'}</span>{'\n'}
            {'  '}<span style={{ color: '#c084fc' }}>return</span>{' snipCompact(messages)'}{'\n'}
            {'}'}{'\n'}
            {'\n'}
            <span style={{ color: '#6b6b66' }}>{'// On success:'}</span>{'\n'}
            {'consecutiveFailures = '}<span style={{ color: '#fbbf24' }}>0</span>
          </div>
        </div>

        {/* Interactive demo */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <p className="mono" style={{ color: 'var(--dim)', fontSize: '1.15vw' }}>Interactive: click to simulate failures</p>
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-xl border-2 flex items-center justify-center transition-all duration-300 cursor-pointer"
                style={{
                  width: '5.5vw',
                  height: '5.5vw',
                  fontSize: '2.4vw',
                  borderColor: failures > i ? 'rgba(244,63,94,0.6)' : 'rgba(255,255,255,0.1)',
                  background: failures > i ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.02)',
                  boxShadow: failures > i ? '0 0 20px rgba(244,63,94,0.3)' : 'none',
                }}
                onClick={() => setFailures(Math.min(3, failures + 1))}
              >
                {failures > i ? '❌' : '⬜'}
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border-2 transition-all duration-500"
            style={{
              padding: '1.4vh 1.4vw',
              borderColor: tripped ? 'rgba(244,63,94,0.6)' : 'rgba(16,185,129,0.3)',
              background: tripped ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.08)',
              boxShadow: tripped ? '0 0 30px rgba(244,63,94,0.3)' : 'none',
            }}
          >
            <p className="mono font-bold" style={{ color: tripped ? '#f43f5e' : '#10b981', fontSize: '1.25vw' }}>
              {tripped ? '🚨 CIRCUIT BREAKER TRIPPED' : '✅ Circuit: HEALTHY'}
            </p>
            <p className="mt-1" style={{ color: 'var(--dim)', fontSize: '1.1vw' }}>
              {tripped ? 'Skipping compaction → emergency snip' : `${failures}/3 failures`}
            </p>
          </div>

          <button
            onClick={() => setFailures(0)}
            className="mono rounded-lg transition-all"
            style={{ padding: '0.8vh 1.1vw', fontSize: '1.1vw', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Reset (simulate success)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 24: Reactive Compact ──────────────────────────────────────────────

function S24_ReactiveCompact() {
  const recoveryLayers = [
    { n: '1', label: 'Context Collapse Drain', desc: 'Fold large blocks into short references', icon: '🗜️', color: '#8b5cf6', source: 'query.ts' },
    { n: '2', label: 'Reactive Compact', desc: 'Compact with aggressive 3K buffer. Retry 1-2: compact. Retry 3: snip. Retry 4+: fail.', icon: '📊', color: '#f59e0b', source: 'compact.ts', highlight: true },
    { n: '3', label: 'Max Output Upgrade', desc: 'Increase max output tokens 8K → 64K', icon: '📈', color: '#0ea5e9', source: 'query.ts' },
    { n: '4', label: 'Multi-Turn Recovery', desc: 'Inject "please continue", retry up to 3x', icon: '🔄', color: '#818cf8', source: 'query.ts' },
    { n: '5', label: 'Model Fallback', desc: 'Switch to backup model, strip thinking blocks', icon: '🔀', color: '#f43f5e', source: 'query.ts' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-3">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>5-Layer Error Recovery</p>
      <h2 className="slide-h2" style={{ fontSize: '3.2vw' }}>When the API Call <span style={{ color: '#f43f5e' }}>Fails</span></h2>

      <div className="flex gap-8 mt-1" style={{ width: '90vw' }}>
        {/* ── Left: 5-layer pipeline ── */}
        <div style={{ flex: '1 1 52%' }}>
          {/* Trigger */}
          <div className="cascade-item flex items-center gap-4 px-5 py-3 rounded-xl mb-2" style={{
            animationDelay: '0.2s',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <span style={{ fontSize: '1.6vw' }}>💥</span>
            <div>
              <p className="mono font-bold" style={{ fontSize: '1.2vw', color: '#ef4444' }}>400 prompt_too_long</p>
              <p style={{ fontSize: '1vw', color: 'var(--dim)' }}>Context exceeds limit — escalating recovery</p>
            </div>
          </div>

          {/* Layers */}
          {recoveryLayers.map((layer, i) => (
            <div key={i}>
              <div
                className="cascade-item flex items-center gap-4 px-5 py-3 rounded-xl"
                style={{
                  animationDelay: `${0.35 + i * 0.16}s`,
                  background: layer.highlight ? layer.color + '14' : layer.color + '06',
                  border: `2px solid ${layer.highlight ? layer.color + '45' : layer.color + '18'}`,
                  boxShadow: layer.highlight ? `0 0 24px ${layer.color}18` : 'none',
                }}
              >
                <div className="flex items-center justify-center rounded-lg" style={{
                  width: '3.2vw', height: '3.2vw', minWidth: '3.2vw',
                  background: layer.color + '20', fontSize: '1.5vw',
                }}>
                  {layer.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="mono font-bold" style={{ fontSize: '0.9vw', color: layer.color, background: layer.color + '20', padding: '0.15vw 0.5vw', borderRadius: '5px' }}>Layer {layer.n}</span>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15vw', color: layer.highlight ? layer.color : 'var(--fg)' }}>{layer.label}</span>
                  </div>
                  <p style={{ fontSize: '0.95vw', color: 'var(--dim)', lineHeight: 1.5, marginTop: '0.2vh' }}>{layer.desc}</p>
                </div>
                <span className="mono" style={{ fontSize: '0.8vw', color: '#666' }}>{layer.source}</span>
              </div>
              {i < 4 && (
                <div className="cascade-item flex items-center justify-center" style={{ animationDelay: `${0.42 + i * 0.16}s`, height: '2.2vh' }}>
                  <span className="mono font-bold" style={{ fontSize: '0.85vw', color: 'rgba(244,63,94,0.45)' }}>↓ fails</span>
                </div>
              )}
            </div>
          ))}

          {/* Final */}
          <div className="cascade-item flex items-center gap-4 px-5 py-2.5 rounded-xl mt-1" style={{
            animationDelay: '1.3s',
            background: 'rgba(153,27,27,0.12)',
            border: '1px solid rgba(153,27,27,0.3)',
          }}>
            <span style={{ fontSize: '1.5vw' }}>☠️</span>
            <p className="mono font-bold" style={{ fontSize: '1.1vw', color: '#dc2626' }}>Expose error to user</p>
          </div>
        </div>

        {/* ── Right: Comparison + Details ── */}
        <div style={{ flex: '1 1 45%' }}>
          <p className="mono font-bold mb-3" style={{ color: '#f59e0b', fontSize: '1.15vw' }}>Proactive vs Reactive</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="px-4 py-2.5 mono font-bold" style={{ width: '26%', fontSize: '0.95vw', color: '#666' }}>Property</div>
              <div className="px-4 py-2.5 mono font-bold" style={{ width: '37%', fontSize: '0.95vw', color: '#10b981' }}>Proactive</div>
              <div className="px-4 py-2.5 mono font-bold" style={{ width: '37%', fontSize: '0.95vw', color: '#f59e0b' }}>Reactive</div>
            </div>
            {[
              { prop: 'Trigger', pro: 'Tokens > 167K', react: '400 prompt_too_long' },
              { prop: 'Timing', pro: 'Before API call', react: 'After failure' },
              { prop: 'Path', pro: 'autoCompact.ts', react: 'query.ts recovery' },
              { prop: 'Strategy', pro: 'SM → Full → give up', react: 'Full → trim oldest' },
              { prop: 'Buffer', pro: '13K (normal)', react: '3K (aggressive)' },
            ].map((row, i) => (
              <div key={i} className="cascade-item flex" style={{
                animationDelay: `${0.7 + i * 0.1}s`,
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div className="px-4 py-2.5 font-semibold" style={{ color: 'var(--fg)', fontSize: '0.95vw', width: '26%' }}>{row.prop}</div>
                <div style={{ width: '37%', padding: '0.8vh 1vw', fontSize: '0.9vw', color: '#bbb' }}>{row.pro}</div>
                <div style={{ width: '37%', padding: '0.8vh 1vw', fontSize: '0.9vw', color: '#bbb' }}>{row.react}</div>
              </div>
            ))}
          </div>

          {/* PTL retry */}
          <div className="cascade-item glass-card p-5 mt-4" style={{ animationDelay: '1.2s', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p className="mono font-bold" style={{ color: '#f59e0b', fontSize: '1.1vw' }}>PTL Retry (Layer 2)</p>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.0vw' }}>
              <code style={{ color: '#f59e0b' }}>truncateHeadForPTLRetry()</code> drops oldest API round groups.
              Precise token gap if parseable, else <strong style={{ color: 'var(--fg)' }}>20% of oldest groups</strong>. Max 3 retries.
            </p>
          </div>

          {/* Insight */}
          <div className="cascade-item glass-card p-5 mt-3" style={{ animationDelay: '1.4s', borderColor: 'rgba(129,140,248,0.2)' }}>
            <p className="mono font-bold" style={{ color: '#818cf8', fontSize: '1.1vw' }}>Design Insight</p>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.0vw' }}>
              Compression is layers 1-2 of a <strong style={{ color: 'var(--fg)' }}>5-layer defense</strong>.
              Even if it completely fails, 3 more strategies remain before the user sees an error.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 25: Context Collapse ──────────────────────────────────────────────

function S25_ContextCollapse() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-5">
      <p className="slide-h3" style={{ color: '#8b5cf6' }}>Experimental</p>
      <h2 className="slide-h2">Context Collapse</h2>

      <div className="flex gap-6 mt-3" style={{ width: '84vw' }}>
        <div className="flex-1 glass-card" style={{ padding: '2.4vh 1.8vw', borderColor: 'rgba(139,92,246,0.2)' }}>
          <div style={{ fontSize: '3.2vw', marginBottom: '0.8vh' }}>🗜️</div>
          <p className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#8b5cf6', fontSize: '1.3vw', lineHeight: 1.25 }}>
            Fold large blocks into brief references
          </p>
          <p className="mt-2 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1vw', lineHeight: 1.5 }}>
            Runs between microcompact and auto-compact in the query loop.
            Identifies self-contained blocks over <strong style={{ color: 'var(--fg)' }}>10K tokens</strong> and
            collapses them to short references.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2" style={{ fontSize: '1vw' }}>
              <span className="mono font-bold rounded" style={{ padding: '0.3vh 0.7vw', background: 'rgba(139,92,246,0.18)', color: '#8b5cf6', fontSize: '0.95vw' }}>90%</span>
              <span style={{ color: 'var(--dim)' }}>First collapse threshold</span>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '1vw' }}>
              <span className="mono font-bold rounded" style={{ padding: '0.3vh 0.7vw', background: 'rgba(139,92,246,0.18)', color: '#8b5cf6', fontSize: '0.95vw' }}>95%</span>
              <span style={{ color: 'var(--dim)' }}>Aggressive collapse threshold</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <p className="mono font-bold" style={{ color: '#8b5cf6', fontSize: '1.05vw' }}>Before collapse</p>
          <div className="code-block" style={{ fontSize: '1.05vw', padding: '1.8vh 1.8vw', lineHeight: 1.6 }}>
            <span style={{ color: '#6b6b66' }}>// tool_result from Read (15K tokens)</span>{'\n'}
            {'{'} content: <span style={{ color: '#86efac' }}>"1  import ... 2000 lines ..."</span> {'}'}{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// tool_result from Bash (12K tokens)</span>{'\n'}
            {'{'} content: <span style={{ color: '#86efac' }}>"npm ls --all ... 800 deps"</span> {'}'}
          </div>

          <p className="mono font-bold" style={{ color: '#8b5cf6', fontSize: '1.05vw' }}>After collapse</p>
          <div className="code-block" style={{ fontSize: '1.05vw', padding: '1.8vh 1.8vw', lineHeight: 1.6 }}>
            <span style={{ color: '#6b6b66' }}>// Collapsed references (~200 tokens)</span>{'\n'}
            {'{'} content: <span style={{ color: '#86efac' }}>"[Collapsed: Read src/App.tsx]"</span> {'}'}{'\n'}
            {'{'} content: <span style={{ color: '#86efac' }}>"[Collapsed: Bash npm ls]"</span> {'}'}
          </div>

          <div className="glass-card" style={{ padding: '1.3vh 1.2vw', borderColor: 'rgba(139,92,246,0.15)' }}>
            <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1vw', lineHeight: 1.45 }}>
              <strong style={{ color: '#8b5cf6' }}>Key constraint:</strong> Auto-compact at 93% would interfere with collapse thresholds,
              so auto-compact is <strong style={{ color: 'var(--fg)' }}>disabled</strong> when context collapse is active.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 26: API Invariant Preservation ────────────────────────────────────

function S26_APIInvariants() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-5">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>Critical Detail</p>
      <h2 className="slide-h2">API Invariant Preservation</h2>

      <p className="slide-body" style={{ fontSize: '1.4vw', maxWidth: '75%' }}>
        Compaction can&apos;t just cut at any boundary — the Anthropic API has strict rules
        about message structure.
      </p>

      <div className="flex gap-6 mt-3" style={{ width: '84vw' }}>
        {/* Rule 1 */}
        <div className="flex-1 glass-card" style={{ padding: '2.2vh 1.6vw' }}>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: '1.8vw' }}>🔗</span>
            <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#f59e0b', fontSize: '1.25vw', letterSpacing: '-0.01em' }}>
              Rule 1: Tool Pair Integrity
            </span>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.02vw', lineHeight: 1.5 }}>
            Every <code style={{ color: '#f59e0b' }}>tool_use</code> block must have a matching{' '}
            <code style={{ color: '#f59e0b' }}>tool_result</code> in the next user message. If compaction
            boundary falls between them, pull in the orphaned assistant message.
          </p>
          <div className="mt-4 flex gap-2 items-center">
            <div
              className="mono rounded-lg"
              style={{
                padding: '0.9vh 0.9vw',
                background: 'rgba(217,119,6,0.12)',
                border: '1px solid rgba(217,119,6,0.3)',
                color: '#fbbf24',
                fontSize: '0.95vw',
              }}
            >
              tool_use id=abc
            </div>
            <span style={{ fontSize: '1.5vw' }}>↔️</span>
            <div
              className="mono rounded-lg"
              style={{
                padding: '0.9vh 0.9vw',
                background: 'rgba(217,119,6,0.12)',
                border: '1px solid rgba(217,119,6,0.3)',
                color: '#fbbf24',
                fontSize: '0.95vw',
              }}
            >
              tool_result id=abc
            </div>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="flex-1 glass-card" style={{ padding: '2.2vh 1.6vw' }}>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: '1.8vw' }}>🆔</span>
            <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#818cf8', fontSize: '1.25vw', letterSpacing: '-0.01em' }}>
              Rule 2: Shared Message IDs
            </span>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.02vw', lineHeight: 1.5 }}>
            Streaming chunks sharing a <code style={{ color: '#818cf8' }}>message.id</code> must stay together
            or be removed together. Otherwise <code style={{ color: '#818cf8' }}>normalizeMessagesForAPI()</code>{' '}
            merges them and thinking blocks are lost.
          </p>
          <div className="mt-4 flex flex-col gap-1.5">
            {['chunk_1 (id=xyz)', 'chunk_2 (id=xyz)', 'chunk_3 (id=xyz)'].map((c, i) => (
              <div
                key={i}
                className="mono rounded-lg flex items-center gap-2"
                style={{
                  padding: '0.7vh 0.9vw',
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.2)',
                  color: '#a5b4fc',
                  fontSize: '0.95vw',
                }}
              >
                {c}
                <span style={{ color: 'rgba(129,140,248,0.5)', fontSize: '0.85vw' }}>← must stay grouped</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 27: Post-Compact Cleanup ──────────────────────────────────────────

function S27_PostCompact() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-5">
      <p className="slide-h3" style={{ color: '#10b981' }}>After Compression</p>
      <h2 className="slide-h2">Post-Compact Cleanup & Reinjection</h2>

      <div className="flex gap-6 mt-3" style={{ width: '85vw' }}>
        {/* Left: cleanup */}
        <div className="flex-1 flex flex-col gap-3">
          <p className="mono font-bold mb-1" style={{ color: '#10b981', fontSize: '1.15vw' }}>🧹 Cleanup Steps</p>
          {[
            { label: 'Reset microcompact state', desc: 'Clear timestamp tracking' },
            { label: 'Reset context collapse', desc: 'Clear fold markers' },
            { label: 'Clear memory file cache', desc: 'Force re-read on next access' },
            { label: 'Clear getUserContext cache', desc: 'System prompt may change' },
          ].map((item, i) => (
            <div key={i} className="cascade-item rounded-lg" style={{
              padding: '1.4vh 1.1vw',
              animationDelay: `${0.3 + i * 0.12}s`,
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}>
              <p className="mono font-bold" style={{ color: '#10b981', fontSize: '1.1vw', lineHeight: 1.3 }}>{item.label}</p>
              <p className="mt-1" style={{ color: 'var(--dim)', fontSize: '0.95vw', lineHeight: 1.35 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: reinjection */}
        <div className="flex-1 flex flex-col gap-2.5">
          <p className="mono font-bold mb-1" style={{ color: '#818cf8', fontSize: '1.15vw' }}>📎 Message Assembly Order</p>
          {[
            { n: 1, label: 'CompactBoundaryMessage', desc: 'Marker with token stats', color: '#f43f5e' },
            { n: 2, label: 'Summary (user message)', desc: 'The compacted summary text', color: '#f59e0b' },
            { n: 3, label: 'Messages to keep', desc: 'Recent messages past the cut point', color: '#10b981' },
            { n: 4, label: 'Recently-read files', desc: 'Top 5 files, ≤5K tokens each, 50K budget', color: '#3b82f6' },
            { n: 5, label: 'Plan file', desc: 'Current plan if exists', color: '#818cf8' },
            { n: 6, label: 'MCP / skill / agent deltas', desc: 'State that changed during session', color: '#8b5cf6' },
            { n: 7, label: 'Hook results', desc: 'Post-compact hook output', color: '#6b6b66' },
          ].map((item, i) => (
            <div key={i} className="cascade-item flex items-center gap-3 rounded-lg" style={{
              padding: '1.1vh 1vw',
              animationDelay: `${0.3 + i * 0.1}s`,
              background: item.color + '08',
              border: `1px solid ${item.color}20`,
              borderLeft: `3px solid ${item.color}`,
            }}>
              <span
                className="mono font-bold flex items-center justify-center rounded-full"
                style={{
                  width: '1.7vw',
                  minWidth: '1.7vw',
                  height: '1.7vw',
                  background: item.color + '22',
                  color: item.color,
                  fontSize: '0.9vw',
                }}
              >
                {item.n}
              </span>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <p className="font-semibold" style={{ color: item.color, fontSize: '1.05vw', lineHeight: 1.3 }}>{item.label}</p>
                <p className="mt-0.5" style={{ color: 'var(--dim)', fontSize: '0.9vw', lineHeight: 1.35 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Slide 28: Fork Agent Cache Sharing ──────────────────────────────────────

function S28_ForkAgent() {
  // Byte-block layout — relative widths that stay aligned between the parent
  // and fork rows, so the cached prefix lines up visually across both requests.
  const prefixFlex = { sys: 18, userCtx: 10, sysCtx: 10, msgs: 38 }
  const tailFlex = 24
  const prefixTotal = prefixFlex.sys + prefixFlex.userCtx + prefixFlex.sysCtx + prefixFlex.msgs

  return (
    <div className="reveal-stagger flex flex-col items-center" style={{ gap: '1vh', width: '92vw' }}>
      <p className="slide-h3" style={{ color: '#0ea5e9' }}>Performance Trick</p>
      <h2 className="slide-h2" style={{ fontSize: '2.6vw', margin: 0 }}>Fork Agent Cache Sharing</h2>

      <p style={{ fontSize: '1.05vw', color: 'var(--dim)', maxWidth: '78vw', textAlign: 'center', lineHeight: 1.4, marginTop: '0.3vh' }}>
        The fork agent reuses the parent&apos;s prompt cache by keeping API request prefixes{' '}
        <strong style={{ color: '#0ea5e9' }}>byte-identical</strong>. Only the final directive differs —
        everything before it is a cache hit.
      </p>

      {/* ═══ Central diagram: parent vs fork request bytes, aligned ═══ */}
      <div
        className="cascade-item glass-card"
        style={{ padding: '1.8vh 1.6vw', width: '88vw', animationDelay: '0.3s', borderColor: 'rgba(14,165,233,0.2)' }}
      >
        {/* Parent row label */}
        <div className="flex items-center justify-between" style={{ marginBottom: '0.4vh' }}>
          <span className="mono font-bold" style={{ fontSize: '0.95vw', color: '#818cf8', letterSpacing: '0.06em' }}>
            ▸ PARENT · main session request
          </span>
          <span className="mono" style={{ fontSize: '0.78vw', color: '#6b6b66' }}>
            cached by API on previous turn
          </span>
        </div>

        {/* Parent byte row */}
        <div className="flex rounded overflow-hidden" style={{ height: '5.2vh', gap: '2px' }}>
          <div style={{ flex: prefixFlex.sys, background: 'rgba(129,140,248,0.3)', borderLeft: '3px solid #818cf8', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#a5b4fc', lineHeight: 1.1 }}>systemPrompt</p>
            <p className="mono" style={{ fontSize: '0.68vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>rendered bytes</p>
          </div>
          <div style={{ flex: prefixFlex.userCtx, background: 'rgba(14,165,233,0.22)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#38bdf8', lineHeight: 1.1 }}>userCtx</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>env, cwd</p>
          </div>
          <div style={{ flex: prefixFlex.sysCtx, background: 'rgba(14,165,233,0.15)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#38bdf8', lineHeight: 1.1 }}>sysCtx</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>CLAUDE.md</p>
          </div>
          <div style={{ flex: prefixFlex.msgs, background: 'rgba(192,132,252,0.22)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#c084fc', lineHeight: 1.1 }}>messages[] + tool defs</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>real tool_results, exact tool schemas</p>
          </div>
          <div style={{ flex: tailFlex, background: 'rgba(245,158,11,0.28)', borderRight: '3px solid #f59e0b', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#fbbf24', lineHeight: 1.1 }}>user turn n+1</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>parent-only tail</p>
          </div>
        </div>

        {/* Cache hit bridge — spans only the shared prefix width */}
        <div className="flex items-center" style={{ marginTop: '0.4vh', marginBottom: '0.4vh' }}>
          <div style={{ flex: prefixTotal, position: 'relative', height: '2.4vh' }}>
            {/* Dashed border box showing the shared prefix span */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '1px dashed rgba(16,185,129,0.55)',
                borderRadius: 4,
                background: 'rgba(16,185,129,0.05)',
              }}
            />
            <div className="flex items-center justify-center" style={{ position: 'relative', height: '100%' }}>
              <span
                className="mono font-bold rounded"
                style={{
                  fontSize: '0.78vw',
                  color: '#10b981',
                  background: '#0c0c14',
                  border: '1px solid rgba(16,185,129,0.6)',
                  padding: '0.2vh 0.8vw',
                  letterSpacing: '0.1em',
                  boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                }}
              >
                ✓ BYTE-IDENTICAL PREFIX — cache hit
              </span>
            </div>
          </div>
          <div style={{ flex: tailFlex, position: 'relative', height: '2.4vh' }}>
            <div className="flex items-center justify-center" style={{ height: '100%' }}>
              <span
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: '#f43f5e',
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.35)',
                  borderRadius: 4,
                  padding: '0.15vh 0.5vw',
                  letterSpacing: '0.08em',
                }}
              >
                ✗ diverges
              </span>
            </div>
          </div>
        </div>

        {/* Fork byte row — identical widths for first 4 blocks, different tail */}
        <div className="flex rounded overflow-hidden" style={{ height: '5.2vh', gap: '2px' }}>
          <div style={{ flex: prefixFlex.sys, background: 'rgba(129,140,248,0.3)', borderLeft: '3px solid #818cf8', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#a5b4fc', lineHeight: 1.1 }}>systemPrompt</p>
            <p className="mono" style={{ fontSize: '0.68vw', color: '#10b981', lineHeight: 1.1, marginTop: '0.2vh' }}>= parent bytes</p>
          </div>
          <div style={{ flex: prefixFlex.userCtx, background: 'rgba(14,165,233,0.22)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#38bdf8', lineHeight: 1.1 }}>userCtx</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: '#10b981', lineHeight: 1.1, marginTop: '0.2vh' }}>= parent</p>
          </div>
          <div style={{ flex: prefixFlex.sysCtx, background: 'rgba(14,165,233,0.15)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#38bdf8', lineHeight: 1.1 }}>sysCtx</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: '#10b981', lineHeight: 1.1, marginTop: '0.2vh' }}>= parent</p>
          </div>
          <div style={{ flex: prefixFlex.msgs, background: 'rgba(192,132,252,0.22)', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#c084fc', lineHeight: 1.1 }}>messages[] + tool defs</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: '#10b981', lineHeight: 1.1, marginTop: '0.2vh' }}>= parent bytes (useExactTools)</p>
          </div>
          {/* Different tail — compact directive */}
          <div style={{ flex: tailFlex, background: 'rgba(16,185,129,0.22)', borderRight: '3px solid #10b981', padding: '0.4vh 0.5vw' }}>
            <p className="mono font-bold" style={{ fontSize: '0.82vw', color: '#34d399', lineHeight: 1.1 }}>compact directive</p>
            <p className="mono" style={{ fontSize: '0.66vw', color: 'var(--dim)', lineHeight: 1.1, marginTop: '0.2vh' }}>~few hundred new tokens</p>
          </div>
        </div>

        {/* Fork row label */}
        <div className="flex items-center justify-between" style={{ marginTop: '0.4vh' }}>
          <span className="mono font-bold" style={{ fontSize: '0.95vw', color: '#0ea5e9', letterSpacing: '0.06em' }}>
            ▸ FORK · summary request
          </span>
          <span className="mono" style={{ fontSize: '0.78vw', color: '#6b6b66' }}>
            compact.ts:1188 · runForkedAgent()
          </span>
        </div>
      </div>

      {/* ═══ Bottom row: CacheSafeParams contract + what breaks the cache ═══ */}
      <div className="flex" style={{ gap: '1.2vw', width: '88vw', marginTop: '0.4vh' }}>
        {/* CacheSafeParams contract */}
        <div
          className="cascade-item glass-card flex-1"
          style={{ padding: '1.2vh 1.1vw', animationDelay: '0.65s', borderColor: 'rgba(14,165,233,0.2)' }}
        >
          <p className="mono font-bold mb-1" style={{ color: '#0ea5e9', fontSize: '1vw' }}>
            CacheSafeParams{' '}
            <span style={{ color: '#6b6b66', fontWeight: 400, fontSize: '0.78vw' }}>
              (forkedAgent.ts:57 · 5 fields that must match)
            </span>
          </p>
          <div className="flex flex-col" style={{ gap: '0.35vh', marginTop: '0.3vh' }}>
            {[
              { name: 'systemPrompt', desc: 'rendered bytes from parent' },
              { name: 'userContext', desc: 'env, cwd, platform' },
              { name: 'systemContext', desc: 'CLAUDE.md, memory, system notes' },
              { name: 'toolUseContext', desc: 'carries renderedSystemPrompt (no reconstruction)' },
              { name: 'forkContextMessages', desc: 'must match parent prefix exactly' },
            ].map((f, i) => (
              <div key={i} className="flex items-baseline" style={{ gap: '0.5vw' }}>
                <span style={{ color: '#10b981', fontSize: '0.85vw', width: '0.9vw' }}>✓</span>
                <span className="mono font-bold" style={{ color: '#38bdf8', fontSize: '0.8vw', minWidth: '9.5vw' }}>
                  {f.name}
                </span>
                <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.72vw', lineHeight: 1.35 }}>
                  {f.desc}
                </span>
              </div>
            ))}
          </div>
          <p
            className="mono"
            style={{
              marginTop: '0.7vh',
              padding: '0.4vh 0.6vw',
              fontSize: '0.7vw',
              color: '#9a9a92',
              background: 'rgba(192,132,252,0.06)',
              border: '1px dashed rgba(192,132,252,0.25)',
              borderRadius: 4,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: '#c084fc' }}>buildForkedMessages()</span> replaces tool results with{' '}
            <span style={{ color: '#fbbf24' }}>&quot;Fork started — processing in background&quot;</span> so sibling forks
            also share cache with each other.
          </p>
        </div>

        {/* What breaks the cache */}
        <div
          className="cascade-item glass-card flex-1"
          style={{ padding: '1.2vh 1.1vw', animationDelay: '0.8s', borderColor: 'rgba(244,63,94,0.22)' }}
        >
          <p className="mono font-bold mb-1" style={{ color: '#f43f5e', fontSize: '1vw' }}>
            What breaks the cache
          </p>
          <div className="flex flex-col" style={{ gap: '0.55vh', marginTop: '0.3vh' }}>
            {[
              {
                head: 'parameter divergence',
                body: (
                  <>
                    setting <code style={{ color: '#f43f5e' }}>maxOutputTokens</code> flips the thinking config →
                    prefix bytes change → cache miss
                  </>
                ),
              },
              {
                head: 'tool definition drift',
                body: (
                  <>
                    forks must pass <code style={{ color: '#f43f5e' }}>useExactTools: true</code> — any reconstructed
                    schema would produce different bytes
                  </>
                ),
              },
              {
                head: 'message prefix mismatch',
                body: (
                  <>
                    <code style={{ color: '#f43f5e' }}>forkContextMessages</code> must be the parent&apos;s prefix
                    verbatim — no edits, no normalization drift
                  </>
                ),
              },
            ].map((c, i) => (
              <div key={i} className="flex items-start" style={{ gap: '0.5vw' }}>
                <span style={{ color: '#f43f5e', fontSize: '0.85vw', width: '0.9vw', marginTop: '0.1vh' }}>✗</span>
                <div className="flex-1">
                  <span className="mono font-bold" style={{ color: '#f43f5e', fontSize: '0.8vw' }}>
                    {c.head}
                  </span>
                  <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.72vw', lineHeight: 1.4, marginTop: '0.1vh' }}>
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: cost breakdown chips + use cases */}
      <div className="cascade-item flex items-center" style={{ gap: '0.8vw', marginTop: '0.4vh', animationDelay: '0.95s', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span className="mono" style={{ fontSize: '0.78vw', color: '#6b6b66', letterSpacing: '0.1em' }}>
          TYPICAL COST
        </span>
        <span
          className="mono rounded"
          style={{
            padding: '0.3vh 0.7vw',
            background: 'rgba(16,185,129,0.1)',
            color: '#10b981',
            fontSize: '0.82vw',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          cache read ~150K · $0.015
        </span>
        <span style={{ color: '#6b6b66', fontSize: '0.8vw' }}>+</span>
        <span
          className="mono rounded"
          style={{
            padding: '0.3vh 0.7vw',
            background: 'rgba(245,158,11,0.1)',
            color: '#f59e0b',
            fontSize: '0.82vw',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          new ~500 · $0.008
        </span>
        <span style={{ color: '#6b6b66', fontSize: '0.8vw' }}>+</span>
        <span
          className="mono rounded"
          style={{
            padding: '0.3vh 0.7vw',
            background: 'rgba(129,140,248,0.1)',
            color: '#818cf8',
            fontSize: '0.82vw',
            border: '1px solid rgba(129,140,248,0.25)',
          }}
        >
          output ~10K · $0.15
        </span>
        <span style={{ width: '1.2vw' }} />
        <span className="mono" style={{ fontSize: '0.78vw', color: '#6b6b66', letterSpacing: '0.1em' }}>
          ALSO POWERS
        </span>
        <span className="mono" style={{ fontSize: '0.78vw', color: 'var(--dim)' }}>
          sideQuestion.ts · agentSummary.ts · compact.ts
        </span>
      </div>
    </div>
  )
}

// ─── Slide 29: Memory Security & Team Sync ──────────────────────────────────

function S29_MemorySecurity() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-4">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>Defense in Depth</p>
      <h2 className="slide-h2">Memory Security & <span style={{ color: '#818cf8' }}>Team Sync</span></h2>

      <div className="flex gap-5 mt-2" style={{ width: '90vw' }}>
        {/* Left: Path Security */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="mono font-bold mb-1" style={{ color: '#f43f5e', fontSize: '1vw' }}>Path Security (7 layers)</p>
          {[
            { check: 'Absolute path check', defense: 'Path traversal' },
            { check: 'Root path (len < 3)', defense: 'System root writes' },
            { check: 'UNC path rejection', defense: 'NTLM credential leak' },
            { check: 'Null byte check', defense: 'Path truncation' },
            { check: 'Tilde expansion block', defense: 'HOME directory match' },
            { check: 'Project settings exclusion', defense: 'Malicious repo → ~/.ssh' },
            { check: 'Symlink dual-pass (realpath)', defense: 'Dangling symlink writes' },
          ].map((item, i) => (
            <div
              key={i}
              className="cascade-item flex items-center gap-2 rounded-lg"
              style={{
                padding: '0.85vh 0.85vw',
                animationDelay: `${0.2 + i * 0.07}s`,
                background: 'rgba(244,63,94,0.05)',
                border: '1px solid rgba(244,63,94,0.12)',
              }}
            >
              <span style={{ color: 'var(--fg)', fontSize: '0.9vw' }}>{item.check}</span>
              <span className="ml-auto mono" style={{ color: '#f43f5e', fontSize: '0.78vw' }}>→ {item.defense}</span>
            </div>
          ))}
          <div className="cascade-item glass-card mt-1" style={{ padding: '1.1vh 1vw', animationDelay: '0.8s', borderColor: 'rgba(244,63,94,0.12)' }}>
            <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.45 }}>
              <strong style={{ color: '#f43f5e' }}>Key design:</strong> <code style={{ color: '#f43f5e' }}>projectSettings</code> excluded
              as source for <code>autoMemoryDirectory</code> — a malicious repo could redirect writes to <code>~/.ssh</code>.
              Team paths validated at both string level and filesystem level (symlink resolution).
            </p>
          </div>
        </div>

        {/* Middle: Secret Scanning */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="mono font-bold mb-1" style={{ color: '#f59e0b', fontSize: '1vw' }}>Secret Scanning (30 patterns)</p>
          <div className="glass-card" style={{ padding: '1.2vh 1vw' }}>
            <div className="flex flex-col" style={{ gap: '0.55vh' }}>
              {[
                { cat: 'Cloud', items: 'AWS (A3T/AKIA/ASIA), GCP (AIza), Azure, DO', n: 4 },
                { cat: 'AI', items: 'Anthropic (sk-ant-api03-), OpenAI, HuggingFace', n: 4 },
                { cat: 'VCS', items: 'GitHub PAT/OAuth/App (5), GitLab PAT/Deploy', n: 7 },
                { cat: 'Comms', items: 'Slack xoxb-/xoxp-/xapp-, Twilio, SendGrid', n: 5 },
                { cat: 'Dev', items: 'npm, PyPI, Terraform, Pulumi, Databricks', n: 5 },
                { cat: 'Obs', items: 'Grafana key/cloud/SA token, Sentry user/org', n: 5 },
                { cat: 'Pay', items: 'Stripe sk_test/live/rk_, Shopify', n: 3 },
                { cat: 'Crypto', items: 'PEM BEGIN/END PRIVATE KEY blocks', n: 1 },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="mono font-bold" style={{ color: '#f59e0b', width: '3.5em', fontSize: '0.9vw' }}>{c.cat}</span>
                  <span className="flex-1" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.35 }}>{c.items}</span>
                  <span className="mono" style={{ color: '#666', fontSize: '0.78vw' }}>×{c.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.1vh 1vw' }}>
            <p className="mono font-bold" style={{ color: '#f59e0b', fontSize: '0.95vw' }}>Dual-Layer Defense</p>
            <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--fg)' }}>Write-time:</strong> teamMemSecretGuard blocks the write call{'\n'}
              <strong style={{ color: 'var(--fg)' }}>Pre-upload:</strong> secretScanner skips file during push
            </p>
            <p className="mt-1" style={{ color: '#666', fontSize: '0.78vw', lineHeight: 1.4 }}>
              Matched values never logged — only rule ID. Anthropic key prefix joined at runtime to avoid self-match.
            </p>
          </div>
        </div>

        {/* Right: Team Sync + Lifecycle */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="mono font-bold mb-1" style={{ color: '#818cf8', fontSize: '1vw' }}>Team Memory Sync Protocol</p>
          {[
            { step: 'Pull', desc: 'GET+ETag → 304/200 → validate paths → skip >250KB → parallel write', color: '#3b82f6' },
            { step: 'Push', desc: 'SHA-256 delta → bin-pack ≤200KB → If-Match optimistic lock', color: '#818cf8' },
            { step: 'Conflict', desc: '412 → probe hashes → retry (max 2). Local-wins strategy', color: '#f43f5e' },
            { step: 'Watch', desc: 'fs.watch recursive, 2s debounce. Suppressed after perm failure', color: '#10b981' },
          ].map((item, i) => (
            <div
              key={i}
              className="cascade-item glass-card"
              style={{ padding: '1.1vh 1vw', animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <p className="mono font-bold" style={{ color: item.color, fontSize: '0.95vw' }}>{item.step}</p>
              <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}

          <div className="cascade-item glass-card" style={{ padding: '1.1vh 1vw', animationDelay: '0.9s', borderColor: 'rgba(139,92,246,0.15)' }}>
            <p className="mono font-bold" style={{ color: '#8b5cf6', fontSize: '0.95vw' }}>KAIROS Mode</p>
            <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.45 }}>
              Append-only daily logs (<code style={{ color: '#8b5cf6' }}>logs/YYYY/MM/YYYY-MM-DD.md</code>).
              A <code style={{ color: '#8b5cf6' }}>/dream</code> skill distills logs overnight. Prompt uses YYYY-MM-DD
              placeholders (date changes would break prompt cache).
            </p>
          </div>

          <div className="cascade-item glass-card" style={{ padding: '1.1vh 1vw', animationDelay: '1.0s' }}>
            <p className="mono font-bold" style={{ color: '#10b981', fontSize: '0.95vw' }}>Prerequisites</p>
            <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw', lineHeight: 1.45 }}>
              TEAMMEM flag + GrowthBook + first-party OAuth (inference + profile scopes) + GitHub remote
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 30: Complete Decision Tree (ReactFlow) ────────────────────────────

function S29_CompleteTree() {
  const nodes: Node[] = useMemo(() => [
    { id: 'entry', type: 'mNode', position: { x: 280, y: 0 }, data: { icon: '🔁', label: 'Query Loop Turn', bg: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.4)', glow: 'rgba(129,140,248,0.3)', _posX: 280, _posY: 0 } },
    { id: 'snip_pre', type: 'mNode', position: { x: 280, y: 80 }, data: { icon: '🚨', label: 'Pre-snip (if over limit)', bg: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.3)', glow: 'rgba(244,63,94,0.2)', _posX: 280, _posY: 80 } },
    { id: 'micro', type: 'mNode', position: { x: 280, y: 155 }, data: { icon: '✂️', label: 'L1: Microcompact', badge: 'LOSSLESS', badgeBg: 'rgba(16,185,129,0.2)', badgeColor: '#10b981', bg: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.35)', glow: 'rgba(16,185,129,0.25)', _posX: 280, _posY: 155 } },
    { id: 'collapse', type: 'mNode', position: { x: 30, y: 200 }, data: { icon: '🗜️', label: 'Context Collapse', badge: 'EXPERIMENTAL', badgeBg: 'rgba(139,92,246,0.2)', badgeColor: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.2)', _posX: 30, _posY: 200 } },
    { id: 'auto', type: 'mNode', position: { x: 280, y: 240 }, data: { icon: '📊', label: 'L2: autoCompactIfNeeded', bg: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.35)', glow: 'rgba(59,130,246,0.25)', _posX: 280, _posY: 240 } },
    { id: 'guard', type: 'mNode', position: { x: 550, y: 240 }, data: { icon: '🛡️', label: 'Guards Pass?', detail: 'recursion, flags, threshold', bg: 'rgba(75,85,99,0.15)', borderColor: 'rgba(75,85,99,0.3)', glow: 'rgba(75,85,99,0.2)', _posX: 550, _posY: 240 } },
    { id: 'cb', type: 'mNode', position: { x: 280, y: 325 }, data: { icon: '⚡', label: 'Circuit Breaker', detail: 'failures < 3?', bg: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.3)', glow: 'rgba(244,63,94,0.2)', _posX: 280, _posY: 325 } },
    { id: 'sm', type: 'mNode', position: { x: 130, y: 415 }, data: { icon: '🧠', label: 'L4: Session Memory', badge: '1ST', badgeBg: 'rgba(245,158,11,0.2)', badgeColor: '#f59e0b', bg: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.35)', glow: 'rgba(245,158,11,0.25)', _posX: 130, _posY: 415 } },
    { id: 'fc', type: 'mNode', position: { x: 430, y: 415 }, data: { icon: '📝', label: 'L3: Full Compact', badge: '2ND', badgeBg: 'rgba(14,165,233,0.2)', badgeColor: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', borderColor: 'rgba(14,165,233,0.35)', glow: 'rgba(14,165,233,0.25)', _posX: 430, _posY: 415 } },
    { id: 'snip', type: 'mNode', position: { x: 550, y: 325 }, data: { icon: '🚨', label: 'Emergency Snip', badge: 'LAST RESORT', badgeBg: 'rgba(244,63,94,0.2)', badgeColor: '#f43f5e', bg: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.35)', glow: 'rgba(244,63,94,0.25)', _posX: 550, _posY: 325 } },
    { id: 'cleanup', type: 'mNode', position: { x: 280, y: 510 }, data: { icon: '🧹', label: 'Post-Compact Cleanup', bg: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.2)', _posX: 280, _posY: 510 } },
    { id: 'done', type: 'mNode', position: { x: 280, y: 590 }, data: { icon: '✅', label: 'Compressed Messages', bg: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.35)', glow: 'rgba(6,182,212,0.25)', _posX: 280, _posY: 590 } },
  ], [])

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'entry', target: 'snip_pre', animated: true, style: { stroke: '#818cf8', strokeWidth: 1.5 } },
    { id: 'e2', source: 'snip_pre', target: 'micro', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 } },
    { id: 'e3', source: 'micro', target: 'auto', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e3b', source: 'micro', target: 'collapse', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 3' } },
    { id: 'e4', source: 'auto', target: 'cb', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
    { id: 'e4b', source: 'auto', target: 'guard', sourceHandle: 'right', animated: true, style: { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 3' } },
    { id: 'e5a', source: 'cb', target: 'sm', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 }, label: 'healthy', labelStyle: { fill: '#f59e0b', fontSize: 9 } },
    { id: 'e5b', source: 'cb', target: 'snip', sourceHandle: 'right', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 }, label: '3+ fails', labelStyle: { fill: '#f43f5e', fontSize: 9 } },
    { id: 'e6', source: 'sm', target: 'fc', sourceHandle: 'right', targetHandle: 'left', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '5 3' }, label: 'null', labelStyle: { fill: '#6b6b66', fontSize: 9 } },
    { id: 'e7a', source: 'sm', target: 'cleanup', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e7b', source: 'fc', target: 'cleanup', animated: true, style: { stroke: '#0ea5e9', strokeWidth: 1.5 } },
    { id: 'e7c', source: 'snip', target: 'cleanup', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 } },
    { id: 'e8', source: 'cleanup', target: 'done', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
  ], [])

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="reveal-stagger flex flex-col items-center gap-1 pt-4 z-10">
        <p className="slide-h3" style={{ color: '#f43f5e' }}>The Complete Picture</p>
        <h2 className="slide-h2" style={{ fontSize: '2.2vw' }}>Full Decision Tree — Click to Zoom</h2>
      </div>
      <div className="flex-1 w-full" style={{ minHeight: '70vh' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={machineNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            nodesDraggable={false}
            defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } }}
          >
            <Background color="rgba(255,255,255,0.012)" gap={25} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  )
}

// ─── Slide 30: Closing Philosophy ────────────────────────────────────────────

const Particles = memo(function Particles({ count = 12, color = '#d97706' }: { count?: number; color?: string }) {
  const items = useMemo(() =>
    Array.from({ length: count }, () => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${6 + Math.random() * 6}s`,
      size: `${3 + Math.random() * 4}px`,
    })), [count])

  return (
    <>
      {items.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            background: color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </>
  )
})

function S30_Philosophy() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <Particles count={25} color="#818cf8" />
      <div className="reveal-stagger flex flex-col items-center gap-8 z-10">
        <p className="slide-h3">The Philosophy</p>

        <h1 className="slide-title gradient-text text-center" style={{ fontSize: '4.5vw', lineHeight: 1.15 }}>
          Delay expense.<br />
          Preserve information.<br />
          Fail gracefully.
        </h1>

        <div className="flex gap-6 mt-8">
          {[
            { icon: '✂️', label: 'Cheap first', color: '#10b981' },
            { icon: '🧠', label: 'Reuse memory', color: '#f59e0b' },
            { icon: '📝', label: 'LLM if needed', color: '#0ea5e9' },
            { icon: '⚡', label: 'Circuit break', color: '#f43f5e' },
            { icon: '🚨', label: 'Snip last', color: '#991b1b' },
          ].map((item, i) => (
            <div
              key={i}
              className="cascade-item flex flex-col items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                animationDelay: `${0.5 + i * 0.15}s`,
                background: item.color + '10',
                border: `1px solid ${item.color}30`,
              }}
            >
              <span style={{ fontSize: '2rem' }}>{item.icon}</span>
              <span className="mono text-[12px]" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>

        <p className="slide-body mt-6" style={{ fontSize: '1.6vw', maxWidth: '70%' }}>
          Context management is how Claude Code maintains coherence across sessions
          that would otherwise be impossible. It&apos;s not glamorous work — it&apos;s plumbing.
          But it&apos;s the plumbing that makes <span className="accent">8-hour coding sessions</span> possible.
        </p>

        {/* ── Teaser: Level 4 — Real Runtime Analysis ── */}
        <div
          className="cascade-item relative flex flex-col items-center rounded-2xl"
          style={{
            animationDelay: '1.6s',
            marginTop: '2.2vh',
            padding: '1.6vh 2vw',
            maxWidth: '62vw',
            background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(192,132,252,0.08), rgba(16,185,129,0.08))',
            border: '1px dashed rgba(129,140,248,0.4)',
            boxShadow: '0 0 60px rgba(129,140,248,0.12)',
          }}
        >
          <p
            className="mono font-bold"
            style={{
              fontSize: '0.78vw',
              color: '#a5b4fc',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: '0.6vh',
            }}
          >
            next up · coming soon
          </p>
          <p
            className="font-bold text-center"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2vw',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Level 4 — Real Runtime Analysis
          </p>
          <p className="text-center mt-1" style={{ fontSize: '1.1vw', color: 'var(--dim)', lineHeight: 1.45, maxWidth: '54vw' }}>
            So far we reverse-engineered the code. Next: watch compaction{' '}
            <em style={{ color: 'var(--fg)' }}>actually happen</em> on a live session.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
            <span
              className="mono font-bold rounded-lg"
              style={{
                padding: '0.5vh 0.8vw',
                background: 'rgba(192,132,252,0.18)',
                border: '1px solid rgba(192,132,252,0.4)',
                color: '#c084fc',
                fontSize: '0.95vw',
                letterSpacing: '-0.01em',
              }}
            >
              claude-plus-plus
            </span>
            <span style={{ color: '#666', fontSize: '0.9vw' }}>·</span>
            <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.85vw' }}>
              live trace · token timelines · decision-tree replay
            </span>
          </div>
        </div>

        <p className="mono text-sm mt-4" style={{ color: 'var(--dim)' }}>
          fin.
        </p>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const level3Slides = [
  S21_QueryLoop,
  S22_TokenMath,
  S23_CircuitBreaker,
  S24_ReactiveCompact,
  S25_ContextCollapse,
  S26_APIInvariants,
  S27_PostCompact,
  S28_ForkAgent,
  S29_MemorySecurity,
  S29_CompleteTree,
  S30_Philosophy,
]
