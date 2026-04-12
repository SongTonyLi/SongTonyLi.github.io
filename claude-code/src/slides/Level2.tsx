/**
 * Level 2 — Each Layer Deep Dive (Slides 11-20)
 * Detailed look at each compression layer with interactive ReactFlow diagrams.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

// ─── Shared interactive node with zoom + glow ────────────────────────────────

function InteractiveNode({ data }: { data: Record<string, unknown> }) {
  const { setCenter } = useReactFlow()
  const onClick = useCallback(() => {
    const x = (data._posX as number) ?? 0
    const y = (data._posY as number) ?? 0
    setCenter(x + 140, y + 50, { zoom: 1.6, duration: 600 })
  }, [data._posX, data._posY, setCenter])

  return (
    <div
      onClick={onClick}
      className="ctx-node-inner px-4 py-3 rounded-xl border-2 text-white shadow-lg cursor-pointer hover:brightness-110 transition-all duration-300"
      style={{
        background: data.bg as string,
        borderColor: data.borderColor as string,
        minWidth: 220,
        ['--glow-color' as string]: data.glow as string,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: '1.1rem' }}>{String(data.icon)}</span>
        <span className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          {String(data.label)}
        </span>
      </div>
      {data.detail ? (
        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 240 }}>
          {String(data.detail)}
        </p>
      ) : null}
      {data.badge ? (
        <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase" style={{
          background: (data.badgeBg as string) ?? 'rgba(255,255,255,0.1)',
          color: (data.badgeColor as string) ?? '#fff',
        }}>
          {String(data.badge)}
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
    </div>
  )
}

const interactiveNodeTypes = { iNode: InteractiveNode }

export function ClaudeForkSpinner({ size = '14vw' }: { size?: string }) {
  const petals = useMemo(() => (
    Array.from({ length: 12 }, (_, i) => ({
      angle: i * 30,
      opacity: 0.8 + (i % 4) * 0.04,
      delay: `${i * 0.08}s`,
    }))
  ), [])

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        className="robot-pulse"
        style={{
          position: 'absolute',
          inset: '14%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(249, 115, 22, 0.08) 35%, transparent 72%)',
          filter: 'blur(10px)',
          animation: 'robotPulse 2.4s ease-in-out infinite',
        }}
      />
      <div
        className="robot-pulse"
        style={{
          position: 'absolute',
          inset: '22%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 30%, transparent 72%)',
          filter: 'blur(12px)',
          animation: 'robotPulse 2.4s ease-in-out infinite',
          animationDelay: '0.35s',
        }}
      />

      <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <filter id="claudeSpinnerGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 0.72 0 0 0
                      0 0 0.45 0 0
                      0 0 0 0.9 0"
            />
          </filter>
          <linearGradient id="claudeSpinnerStroke" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f6b08a" />
            <stop offset="55%" stopColor="#ee9a74" />
            <stop offset="100%" stopColor="#e58a61" />
          </linearGradient>
        </defs>

        <g style={{ transformOrigin: '80px 80px', animation: 'spin 7.5s linear infinite' }}>
          {petals.map((petal, i) => (
            <g key={i} transform={`rotate(${petal.angle} 80 80)`}>
              <g style={{ animation: 'robotPulse 2.2s ease-in-out infinite', animationDelay: petal.delay }}>
                <g
                  style={{
                    animation: 'spinnerToothPulse 1.45s ease-in-out infinite',
                    animationDelay: petal.delay,
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                  }}
                >
                  <rect
                    x="72"
                    y="10"
                    width="16"
                    height="64"
                    rx="8"
                    fill="#ee9a74"
                    filter="url(#claudeSpinnerGlow)"
                    opacity={petal.opacity * 0.78}
                  />
                  <rect
                    x="72"
                    y="10"
                    width="16"
                    height="64"
                    rx="8"
                    fill="url(#claudeSpinnerStroke)"
                    opacity={petal.opacity}
                  />
                  <rect
                    x="74.75"
                    y="15"
                    width="10.5"
                    height="54"
                    rx="5.25"
                    fill="rgba(14, 10, 18, 0.92)"
                  />
                  <rect
                    x="75.75"
                    y="17.5"
                    width="8.5"
                    height="49"
                    rx="4.25"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.95"
                    opacity="0.45"
                  />
                </g>
              </g>
            </g>
          ))}
          <circle cx="80" cy="80" r="12" fill="rgba(14, 10, 18, 0.97)" />
          <circle
            cx="80"
            cy="80"
            r="5"
            fill="rgba(238, 154, 116, 0.52)"
            style={{ animation: 'robotPulse 1.8s ease-in-out infinite' }}
          />
        </g>
      </svg>
    </div>
  )
}

// ─── Slide 11: L1 Microcompact Concept ───────────────────────────────────────

function S11_MicrocompactConcept() {
  // Each entry is a line of the allowlist source — rendered with a staggered
  // line-by-line reveal so the code feels like it's being typed in.
  const codeLines: Array<{ code: ReactNode; comment?: string }> = [
    {
      code: (
        <>
          <span style={{ color: '#c084fc' }}>const</span>{' '}
          <span style={{ color: '#fbbf24' }}>COMPACTABLE_TOOLS</span>{' '}
          <span style={{ color: '#e8e8e3' }}>=</span>{' '}
          <span style={{ color: '#c084fc' }}>new</span>{' '}
          <span style={{ color: '#60a5fa' }}>Set</span>
          <span style={{ color: '#e8e8e3' }}>([</span>
        </>
      ),
    },
    { code: <span style={{ color: '#86efac' }}>{`  'Read',`}</span>,      comment: 'File read results can be very large' },
    { code: <span style={{ color: '#86efac' }}>{`  'Bash',`}</span>,      comment: 'Shell output can be very long' },
    { code: <span style={{ color: '#86efac' }}>{`  'Grep',`}</span>,      comment: 'Search results' },
    { code: <span style={{ color: '#86efac' }}>{`  'Glob',`}</span>,      comment: 'File listings' },
    { code: <span style={{ color: '#86efac' }}>{`  'WebSearch',`}</span>, comment: 'Web search results' },
    { code: <span style={{ color: '#86efac' }}>{`  'WebFetch',`}</span>,  comment: 'Web fetch results' },
    { code: <span style={{ color: '#86efac' }}>{`  'Edit',`}</span>,      comment: 'File edit diffs' },
    { code: <span style={{ color: '#86efac' }}>{`  'Write',`}</span>,     comment: 'File write confirmations' },
    { code: <span style={{ color: '#e8e8e3' }}>])</span> },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-5" style={{ width: '90vw' }}>
      <p className="slide-h3" style={{ fontSize: '2.6vw' }}>Layer 1</p>
      <h2 className="slide-h2" style={{ fontSize: '4.6vw' }}>
        Micro-Compact: <span style={{ color: '#10b981' }}>The Janitor</span>
      </h2>

      <div className="flex gap-8 mt-2 w-full items-stretch" style={{ minHeight: '58vh' }}>
        {/* Left: the allowlist source */}
        <div
          className="cascade-item glass-card flex flex-col"
          style={{ flex: 1.3, padding: '2.8vh 2vw', animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <p className="mono" style={{ fontSize: '1.2vw', color: '#10b981' }}>
              Compactable Tools Allowlist
            </p>
          </div>

          <div
            className="code-block code-scan relative"
            style={{
              fontSize: '1.55vw',
              padding: '2.6vh 1.8vw',
              lineHeight: 1.85,
              background: '#0c0c14',
              overflow: 'hidden',
            }}
          >
            {codeLines.map((line, i) => (
              <div
                key={i}
                className="code-line-reveal"
                style={{ animationDelay: `${0.9 + i * 0.11}s` }}
              >
                {line.code}
                {line.comment && (
                  <span style={{ color: '#6b6b66' }}>{'   // '}{line.comment}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: meaning + excluded tools */}
        <div className="flex-1 flex flex-col gap-4">
          <div
            className="cascade-item glass-card"
            style={{ padding: '3vh 2vw', animationDelay: '0.55s' }}
          >
            <div style={{ fontSize: '3.6vw', lineHeight: 1, marginBottom: '1rem' }}>✂️</div>
            <p
              className="font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: '#10b981',
                fontSize: '2.1vw',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Rule-based.<br />Zero cost. Zero loss.
            </p>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: 'var(--dim)', fontSize: '1.35vw', lineHeight: 1.55 }}
            >
              Runs <strong style={{ color: 'var(--fg)' }}>before every turn</strong> —
              clears stale tool results that the API has already cached.
            </p>
          </div>

          <div
            className="cascade-item glass-card"
            style={{
              padding: '2.6vh 2vw',
              animationDelay: '2.15s',
              borderColor: 'rgba(244,63,94,0.28)',
              background: 'rgba(244,63,94,0.04)',
            }}
          >
            <p
              className="mono font-bold mb-3"
              style={{ color: '#f43f5e', fontSize: '1.4vw', letterSpacing: '0.04em' }}
            >
              ⊘ NOT MICROCOMPACTED
            </p>
            <div className="flex gap-2.5 flex-wrap mb-3">
              {['Agent', 'Skill', 'MCP'].map((tool) => (
                <div
                  key={tool}
                  className="mono px-3.5 py-2 rounded-lg font-semibold"
                  style={{
                    background: 'rgba(244,63,94,0.12)',
                    border: '1px solid rgba(244,63,94,0.4)',
                    color: '#fda4af',
                    fontSize: '1.3vw',
                  }}
                >
                  {tool}
                </div>
              ))}
            </div>
            <p
              className="leading-relaxed"
              style={{ color: 'var(--dim)', fontSize: '1.2vw', lineHeight: 1.5 }}
            >
              Results from tools not on the allowlist stay in context untouched.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 11b: L1 Two Sub-Paths (hover tabs → detail popup) ─────────────────

function S11b_TwoSubPaths() {
  const [hovered, setHovered] = useState<'A' | 'B'>('A')

  const paths = {
    A: {
      title: 'Sub-Path A',
      name: 'Time-Triggered',
      color: '#10b981',
      icon: '⏱',
      trigger:
        'Time since last assistant message exceeds threshold — the API cache has already expired.',
      steps: [
        'Collect all tool_use IDs from compactable tools',
        'Preserve the most recent N tool results',
        'Replace older tool_result contents with "[Old tool result content cleared]"',
        'Leave tool_use blocks untouched — preserves API pairing integrity',
      ],
      characteristics: [
        { label: 'Cache', value: 'Already expired — no cache to protect' },
        { label: 'Mutation', value: 'Directly modifies local message content' },
        { label: 'Effect', value: 'Reduces tokens on retransmission' },
      ],
    },
    B: {
      title: 'Sub-Path B',
      name: 'Cached Edit',
      color: '#818cf8',
      icon: '⚡',
      trigger:
        'CACHED_MICROCOMPACT flag on · model supports cache-edit API · main thread only (not a fork agent).',
      steps: [
        'collectCompactableToolIds()',
        'registerToolResult() — group by user message',
        'registerToolMessage() — record groups',
        'getToolResultsToDelete() — apply count / keep thresholds',
        'createCacheEditsBlock() — emit cache_edits API block',
      ],
      characteristics: [
        { label: 'Cache', value: 'Still valid — hit rate must be preserved' },
        { label: 'Mutation', value: 'Does NOT modify local messages — cache_reference + cache_edits are added at the API layer' },
        { label: 'Effect', value: "Uses the API's cache_edits field to tell the server to delete cached content for specific tool results" },
        { label: 'Thresholds', value: 'Count-based trigger / keep values pulled from GrowthBook config' },
        { label: 'Precedence', value: 'Takes precedence over regular micro-compact — no disk persistence' },
        { label: 'State', value: 'Tracks tool results and queues pendingCacheEdits → pinnedCacheEdits (see next slide)' },
      ],
    },
  } as const

  const active = paths[hovered]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-4" style={{ width: '90vw' }}>
      <p className="slide-h3" style={{ fontSize: '2.4vw' }}>Layer 1 · Micro-Compact</p>
      <h2 className="slide-h2" style={{ fontSize: '4.2vw' }}>
        Two <span style={{ color: '#10b981' }}>Sub-Paths</span>
      </h2>

      {/* Tabs */}
      <div className="flex gap-5 mt-2">
        {(['A', 'B'] as const).map((key) => {
          const p = paths[key]
          const isActive = hovered === key
          return (
            <div
              key={key}
              onMouseEnter={() => setHovered(key)}
              onFocus={() => setHovered(key)}
              tabIndex={0}
              className="cursor-pointer rounded-2xl flex items-center gap-4"
              style={{
                background: isActive ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isActive ? p.color : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive
                  ? `0 0 40px ${p.color}40, inset 0 0 24px ${p.color}12`
                  : 'none',
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                transition:
                  'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s, border-color 0.4s, box-shadow 0.4s',
                padding: '1.6vh 1.6vw',
                minWidth: '24vw',
                outline: 'none',
              }}
            >
              <span style={{ fontSize: '2.6vw', lineHeight: 1 }}>{p.icon}</span>
              <div>
                <p
                  className="mono uppercase"
                  style={{
                    fontSize: '0.95vw',
                    color: p.color,
                    letterSpacing: '0.14em',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {p.title}
                </p>
                <p
                  className="font-bold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.85vw',
                    color: isActive ? '#fff' : 'var(--dim)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                    transition: 'color 0.4s',
                  }}
                >
                  {p.name}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail window — pops out below the hovered tab */}
      <div
        className="glass-card relative"
        style={{
          padding: '3.2vh 2.6vw',
          width: '82vw',
          borderColor: `${active.color}55`,
          boxShadow: `0 0 60px ${active.color}22, 0 20px 60px rgba(0,0,0,0.4)`,
          background: `linear-gradient(180deg, ${active.color}0a 0%, rgba(255,255,255,0.03) 100%)`,
          transition: 'border-color 0.5s, box-shadow 0.5s, background 0.5s',
          marginTop: '0.6vh',
        }}
      >
        {/* Tab pointer — the little arrow connecting tab to detail */}
        <div
          key={`arrow-${hovered}`}
          className="tab-indicator absolute"
          style={{
            top: 0,
            left: hovered === 'A' ? 'calc(50% - 13.5vw)' : 'calc(50% + 13.5vw)',
            width: '20px',
            height: '20px',
            background: active.color,
            borderTopLeftRadius: '4px',
            boxShadow: `0 0 20px ${active.color}80`,
          }}
        />

        <div key={hovered} className="detail-pop flex gap-10">
          {/* Left column: trigger + characteristics */}
          <div style={{ flex: 1.1 }}>
            <p
              className="mono uppercase mb-2"
              style={{ fontSize: '0.95vw', color: active.color, letterSpacing: '0.14em' }}
            >
              ▸ Trigger
            </p>
            <p style={{ fontSize: '1.35vw', color: 'var(--fg)', lineHeight: 1.5 }}>
              {active.trigger}
            </p>

            <p
              className="mono uppercase mt-5 mb-3"
              style={{ fontSize: '0.95vw', color: active.color, letterSpacing: '0.14em' }}
            >
              ▸ Characteristics
            </p>
            <div className="flex flex-col gap-2.5">
              {active.characteristics.map((c, i) => (
                <div key={i} className="flex gap-4 items-baseline">
                  <span
                    className="mono uppercase"
                    style={{
                      color: 'var(--dim)',
                      fontSize: '0.9vw',
                      letterSpacing: '0.08em',
                      minWidth: '6vw',
                    }}
                  >
                    {c.label}
                  </span>
                  <span style={{ color: 'var(--fg)', fontSize: '1.15vw', lineHeight: 1.4 }}>
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: `${active.color}25` }} />

          {/* Right column: execution logic */}
          <div className="flex-1">
            <p
              className="mono uppercase mb-3"
              style={{ fontSize: '0.95vw', color: active.color, letterSpacing: '0.14em' }}
            >
              ▸ Execution Logic
            </p>
            <ol className="flex flex-col gap-2.5">
              {active.steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="mono font-bold flex-shrink-0 text-center"
                    style={{
                      color: active.color,
                      background: `${active.color}18`,
                      border: `1px solid ${active.color}40`,
                      borderRadius: '6px',
                      fontSize: '0.9vw',
                      minWidth: '1.8vw',
                      padding: '0.25vh 0.4vw',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      color: 'var(--fg)',
                      fontSize: '1.15vw',
                      lineHeight: 1.5,
                      fontFamily:
                        step.includes('(') && step.includes(')')
                          ? 'var(--font-mono)'
                          : 'var(--font-body)',
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            {/* Server-side cache — only relevant for Sub-Path B (cache_edits API) */}
            {hovered === 'B' && (
              <div style={{ marginTop: '1.8vh' }}>
                <p
                  className="mono uppercase mb-2"
                  style={{ fontSize: '0.95vw', color: active.color, letterSpacing: '0.14em' }}
                >
                  ▸ Server-Side Cache
                </p>
                <p
                  style={{
                    fontSize: '1.1vw',
                    color: 'var(--fg)',
                    lineHeight: 1.55,
                    marginBottom: '1.1vh',
                  }}
                >
                  Lets the model forget the deleted content. The{' '}
                  <span className="mono" style={{ color: active.color }}>cache_edits</span>{' '}
                  block with{' '}
                  <span className="mono" style={{ color: active.color }}>type: &apos;delete&apos;</span>{' '}
                  instructs the server to evict specific KV cache entries.
                </p>

                <div
                  className="rounded-lg"
                  style={{
                    padding: '1vh 1vw',
                    background: `${active.color}0d`,
                    border: `1px solid ${active.color}2a`,
                  }}
                >
                  <p
                    className="mono uppercase"
                    style={{
                      fontSize: '0.78vw',
                      color: 'var(--dim)',
                      letterSpacing: '0.12em',
                      marginBottom: '0.7vh',
                    }}
                  >
                    Heads up — the KV cache
                  </p>
                  <div
                    className="flex flex-col gap-1"
                    style={{ fontSize: '1vw', lineHeight: 1.5 }}
                  >
                    <div>
                      <span className="mono font-bold" style={{ color: active.color }}>Q</span>
                      <span className="mono" style={{ color: 'var(--dim)' }}> (Query)</span>
                      <span style={{ color: 'var(--fg)' }}>
                        {' '}— what this token is <em>looking for</em>
                      </span>
                    </div>
                    <div>
                      <span className="mono font-bold" style={{ color: active.color }}>K</span>
                      <span className="mono" style={{ color: 'var(--dim)' }}> (Key)</span>
                      <span style={{ color: 'var(--fg)' }}>
                        {' '}— what this token <em>offers</em> to other tokens
                      </span>
                    </div>
                    <div>
                      <span className="mono font-bold" style={{ color: active.color }}>V</span>
                      <span className="mono" style={{ color: 'var(--dim)' }}> (Value)</span>
                      <span style={{ color: 'var(--fg)' }}>
                        {' '}— the actual content this token <em>contributes</em>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p
        className="mono"
        style={{ fontSize: '0.95vw', color: 'var(--dim)', opacity: 0.65, marginTop: '0.4vh' }}
      >
        ↑ hover a tab to swap details
      </p>
    </div>
  )
}

// ─── Slide 11c: L1 Cached Edit Internals — state flow + token pie ───────────

function S11c_CachedEditInternals() {
  // Tracks which GrowthBook flow step is hovered, for subtle highlight.
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  // ── GrowthBook-driven cached micro-compact flow ─────────────────────────
  // Six steps, verified against claude-plus-plus source. File/line citations
  // reflect the actual microCompact.ts / query.ts / claude.ts call sites.
  const gbSteps = [
    {
      title: 'Fetch config',
      mono: 'mod.getCachedMCConfig()',
      desc: 'Native module reads two fields from GrowthBook remote config.',
      source: 'microCompact.ts:311',
      pills: ['triggerThreshold', 'keepRecent'],
    },
    {
      title: 'Collect tool IDs',
      mono: 'collectCompactableToolIds()',
      desc: 'Walks assistant messages, keeps tool_use blocks in COMPACTABLE_TOOLS (8 types: Read, Bash, Grep, Glob, WebSearch, WebFetch, Edit, Write).',
      source: 'microCompact.ts:226–241',
    },
    {
      title: 'Register state',
      mono: 'mod.registerToolResult(state, id)',
      desc: 'Dedups into registeredTools · toolOrder · deletedRefs — the native CachedMCState graph.',
      source: 'microCompact.ts:313–330',
    },
    {
      title: 'Decide deletions',
      mono: 'mod.getToolResultsToDelete(state)',
      desc: 'if activeCount ≥ triggerThreshold → drop oldest until activeCount = keepRecent.',
      source: 'microCompact.ts:332',
    },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-1" style={{ width: '97vw' }}>
      <h2 className="slide-h2" style={{ fontSize: '3.2vw', marginBottom: '0.3vh' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55em',
          letterSpacing: '0.14em',
          color: '#818cf8',
          textTransform: 'uppercase',
          marginRight: '0.8em',
          verticalAlign: 'middle',
        }}>
          Layer 1
        </span>
        Cached Edit <span style={{ color: 'var(--dim)', fontWeight: 400 }}>—</span>{' '}
        <span style={{ color: '#818cf8' }}>Under the Hood</span>
      </h2>

      <div className="flex gap-4 mt-1 w-full items-stretch" style={{ maxHeight: '74vh' }}>
        {/* ─── LEFT: Cache Edit State Management visualization ─── */}
        <div
          className="cascade-item glass-card flex flex-col"
          style={{ flex: 1, padding: '2vh 1.6vw', animationDelay: '0.4s', maxHeight: '74vh' }}
        >
          <p
            className="mono uppercase mb-2"
            style={{ fontSize: '1.25vw', color: '#818cf8', letterSpacing: '0.14em' }}
          >
            ▸ Cache Edit State Management
          </p>
          <p
            className="mb-3"
            style={{ fontSize: '1.4vw', color: 'var(--dim)', lineHeight: 1.45 }}
          >
            A mini state machine tracks which cache edits are <em>pending</em>,
            which are <em>in-flight</em>, and which have been <em>pinned</em> for resending.
          </p>

          {/* SVG state flow diagram */}
          <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
            <svg viewBox="0 0 980 540" style={{ width: '100%', height: '100%', maxHeight: '62vh', overflow: 'visible' }}>
              <defs>
                <marker
                  id="arrowPurple"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                </marker>
                <marker
                  id="arrowGreen"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <marker
                  id="arrowAmber"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Node: pendingCacheEdits  (x 20-320, y 170-360) */}
              <g className="pie-slice" style={{ animationDelay: '0.4s' }}>
                <rect
                  x="20"
                  y="170"
                  width="300"
                  height="190"
                  rx="18"
                  fill="rgba(129, 140, 248, 0.08)"
                  stroke="#818cf8"
                  strokeWidth="2"
                />
                <text x="170" y="214" textAnchor="middle" fill="#818cf8" fontSize="19" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.1em">
                  PENDING
                </text>
                <text x="170" y="258" textAnchor="middle" fill="#fff" fontSize="23" fontFamily="var(--font-mono)" fontWeight="600">
                  pendingCacheEdits
                </text>
                <text x="170" y="300" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="16" fontFamily="var(--font-body)">
                  queued for next request
                </text>
                <text x="170" y="330" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="13" fontFamily="var(--font-body)">
                  built by createCacheEditsBlock()
                </text>
              </g>

              {/* Node: API Request  (x 350-630, y 148-382) */}
              <g className="pie-slice" style={{ animationDelay: '1.4s' }}>
                <rect
                  x="350"
                  y="148"
                  width="280"
                  height="234"
                  rx="18"
                  fill="rgba(16, 185, 129, 0.08)"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <text x="490" y="194" textAnchor="middle" fill="#10b981" fontSize="19" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.1em">
                  IN FLIGHT
                </text>
                <text x="490" y="238" textAnchor="middle" fill="#fff" fontSize="23" fontFamily="var(--font-mono)" fontWeight="600">
                  API Request
                </text>
                <text x="490" y="282" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="16" fontFamily="var(--font-mono)">
                  cache_edits block
                </text>
                <text x="490" y="314" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14" fontFamily="var(--font-body)">
                  embedded in request
                </text>
                <text x="490" y="350" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="13" fontFamily="var(--font-body)">
                  server deletes cached tool_results
                </text>
              </g>

              {/* Node: pinnedCacheEdits  (x 660-960, y 170-360) */}
              <g className="pie-slice" style={{ animationDelay: '2.4s' }}>
                <rect
                  x="660"
                  y="170"
                  width="300"
                  height="190"
                  rx="18"
                  fill="rgba(245, 158, 11, 0.08)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text x="810" y="214" textAnchor="middle" fill="#f59e0b" fontSize="19" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.1em">
                  PINNED
                </text>
                <text x="810" y="258" textAnchor="middle" fill="#fff" fontSize="23" fontFamily="var(--font-mono)" fontWeight="600">
                  pinnedCacheEdits
                </text>
                <text x="810" y="300" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="16" fontFamily="var(--font-body)">
                  resent on later calls
                </text>
                <text x="810" y="330" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="13" fontFamily="var(--font-body)">
                  preserves cache hit rate
                </text>
              </g>

              {/* Arrow: Pending → API  (consume) */}
              <g className="pie-slice" style={{ animationDelay: '0.9s' }}>
                <path
                  d="M 320 265 L 346 265"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  fill="none"
                  markerEnd="url(#arrowPurple)"
                  className="flow-pulse"
                />
                <text x="333" y="246" textAnchor="middle" fill="#c4b5fd" fontSize="15" fontFamily="var(--font-mono)">
                  consume()
                </text>
              </g>

              {/* Arrow: API → Pinned  (pin) */}
              <g className="pie-slice" style={{ animationDelay: '1.9s' }}>
                <path
                  d="M 634 265 L 656 265"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  fill="none"
                  markerEnd="url(#arrowGreen)"
                  className="flow-pulse"
                />
                <text x="645" y="246" textAnchor="middle" fill="#6ee7b7" fontSize="15" fontFamily="var(--font-mono)">
                  pin()
                </text>
              </g>

              {/* Arrow: Pinned → API (getPinnedCacheEdits → resend on next request) */}
              <g className="pie-slice" style={{ animationDelay: '2.9s' }}>
                <path
                  d="M 810 360 Q 810 442 650 442 Q 490 442 490 390"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="6 4"
                  markerEnd="url(#arrowAmber)"
                />
                <text x="650" y="472" textAnchor="middle" fill="#fcd34d" fontSize="15" fontFamily="var(--font-mono)">
                  getPinnedCacheEdits() — resend on next request
                </text>
              </g>

              {/* Annotation: markToolsSentToAPIState — fires with IN FLIGHT */}
              <g className="pie-slice" style={{ animationDelay: '1.4s' }}>
                <line x1="490" y1="146" x2="490" y2="108" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="322" y="60" width="336" height="50" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
                <text x="490" y="92" textAnchor="middle" fill="#6ee7b7" fontSize="16" fontFamily="var(--font-mono)">
                  markToolsSentToAPIState()
                </text>
                <text x="490" y="44" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13" fontFamily="var(--font-body)">
                  called after success
                </text>
              </g>

              {/* Root state annotation — appears at the very end */}
              <g className="pie-slice" style={{ animationDelay: '3.4s' }}>
                <text x="490" y="518" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="15" fontFamily="var(--font-mono)">
                  cachedMCState · holds the whole graph
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* ─── MIDDLE: relation annotation — cachedMicrocompactPath() ← GrowthBook ─── */}
        <div
          className="cascade-item flex flex-col items-center justify-center text-center"
          style={{
            flex: '0 0 13vw',
            padding: '0 0.3vw',
            animationDelay: '0.55s',
            gap: '1.2vh',
          }}
        >
          <p
            className="mono"
            style={{ fontSize: '0.95vw', color: '#a78bfa', lineHeight: 1.3 }}
          >
            cachedMicrocompactPath()
          </p>
          <p
            className="mono uppercase"
            style={{ fontSize: '0.78vw', color: 'var(--dim)', letterSpacing: '0.16em' }}
          >
            configured by
          </p>
          {/* Intro blurb about GrowthBook */}
          <div
            className="rounded-lg text-left"
            style={{
              padding: '0.8vh 0.7vw',
              background: 'rgba(34,211,238,0.06)',
              border: '1px solid rgba(34,211,238,0.25)',
              marginTop: '-0.2vh',
            }}
          >
            <p
              className="mono"
              style={{
                fontSize: '0.72vw',
                color: '#22d3ee',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.4vh',
              }}
            >
              What is GrowthBook?
            </p>
            <p
              style={{
                fontSize: '0.72vw',
                color: 'var(--dim)',
                lineHeight: 1.45,
              }}
            >
              An <span style={{ color: '#a5f3fc' }}>open-source feature flag platform</span>.
              Claude Code uses it to deliver{' '}
              <span style={{ color: '#a5f3fc' }}>dynamic configuration values</span>{' '}
              to running clients without requiring app updates.
            </p>
          </div>
          <svg
            width="100%"
            height="30"
            viewBox="0 0 180 30"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker
                id="arrowRelCyan"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
              </marker>
            </defs>
            <line
              x1="6"
              y1="15"
              x2="168"
              y2="15"
              stroke="#22d3ee"
              strokeWidth="3"
              markerEnd="url(#arrowRelCyan)"
              className="flow-pulse"
            />
          </svg>
          <div
            className="text-left"
            style={{ fontSize: '0.88vw', color: 'var(--fg)', lineHeight: 1.5 }}
          >
            <p style={{ marginBottom: '0.7vh' }}>
              <span style={{ color: '#22d3ee', marginRight: '0.4em' }}>▸</span>
              <span className="mono" style={{ color: '#22d3ee' }}>triggerThreshold</span> — when to start deleting
            </p>
            <p>
              <span style={{ color: '#22d3ee', marginRight: '0.4em' }}>▸</span>
              <span className="mono" style={{ color: '#22d3ee' }}>keepRecent</span> — how many to keep active
            </p>
          </div>
        </div>

        {/* ─── RIGHT: GrowthBook-driven cached micro-compact flow ─── */}
        <div
          className="cascade-item glass-card flex flex-col"
          style={{ flex: 1.07, padding: '2vh 1.3vw', animationDelay: '0.7s', maxHeight: '74vh' }}
        >
          <p
            className="mono uppercase"
            style={{
              fontSize: '1.35vw',
              color: '#22d3ee',
              letterSpacing: '0.14em',
              marginBottom: '0.4vh',
            }}
          >
            ▸ GrowthBook · Remote Config Flow
          </p>
          <p
            style={{
              fontSize: '1.1vw',
              color: 'var(--dim)',
              lineHeight: 1.45,
              marginBottom: '1.4vh',
            }}
          >
            Count-based thresholds, fetched at runtime — no TypeScript defaults.
          </p>

          {/* ── Remote config pill (appears first, animates in) ── */}
          <div
            className="cascade-item self-stretch relative rounded-xl"
            style={{
              animationDelay: '0.85s',
              padding: '1.1vh 1.2vw',
              marginBottom: '1.4vh',
              background:
                'linear-gradient(135deg, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0.06) 100%)',
              border: '1.5px solid rgba(34,211,238,0.42)',
              boxShadow: '0 0 22px rgba(34,211,238,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Subtle "remote stream" shimmer line */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 flow-pulse"
              style={{
                height: 1,
                background:
                  'linear-gradient(90deg, transparent 0%, #22d3ee 50%, transparent 100%)',
                opacity: 0.6,
              }}
            />
            <div className="flex items-center gap-2" style={{ marginBottom: '0.7vh' }}>
              <span style={{ fontSize: '1.2vw' }}>☁</span>
              <span
                className="mono"
                style={{
                  fontSize: '0.95vw',
                  color: '#22d3ee',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                GrowthBook remote
              </span>
              <span
                className="mono ml-auto"
                style={{ fontSize: '0.85vw', color: 'rgba(34,211,238,0.6)' }}
              >
                getCachedMCConfig()
              </span>
            </div>
            <div className="flex gap-2">
              {['triggerThreshold', 'keepRecent'].map((name) => (
                <span
                  key={name}
                  className="mono flex-1 text-center"
                  style={{
                    fontSize: '1vw',
                    padding: '0.5vh 0.6vw',
                    borderRadius: '6px',
                    background: 'rgba(34,211,238,0.1)',
                    border: '1px solid rgba(34,211,238,0.35)',
                    color: '#a5f3fc',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* ── Four-step flow (vertical, cascade) ── */}
          <div
            className="flex flex-col flex-1 thin-scroll"
            style={{ gap: '1vh', minHeight: 0, overflowY: 'auto', paddingRight: '0.3vw' }}
          >
            {gbSteps.map((step, i) => {
              const isOn = hoveredStep === i
              const isDim = hoveredStep !== null && !isOn
              return (
                <div
                  key={step.title}
                  className="cascade-item flex items-start gap-3 rounded-lg flex-shrink-0"
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    animationDelay: `${1.05 + i * 0.15}s`,
                    padding: '1vh 1vw',
                    background: isOn
                      ? 'rgba(34,211,238,0.08)'
                      : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${isOn ? 'rgba(34,211,238,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    opacity: isDim ? 0.45 : 1,
                    transform: isOn ? 'translateX(3px)' : 'translateX(0)',
                    transition:
                      'background 0.25s ease, border-color 0.25s ease, opacity 0.25s ease, transform 0.25s ease',
                    cursor: 'default',
                  }}
                >
                  {/* Step number badge */}
                  <div
                    className="mono font-bold flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: '2.2vw',
                      height: '2.2vw',
                      minWidth: '2rem',
                      minHeight: '2rem',
                      borderRadius: '8px',
                      background: isOn
                        ? 'rgba(34,211,238,0.25)'
                        : 'rgba(34,211,238,0.12)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34,211,238,0.5)',
                      fontSize: '1.1vw',
                      boxShadow: isOn
                        ? '0 0 14px rgba(34,211,238,0.5)'
                        : 'none',
                      transition: 'box-shadow 0.25s ease, background 0.25s ease',
                      marginTop: '0.25vh',
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap" style={{ rowGap: '0.3vh' }}>
                      <span
                        style={{
                          fontSize: '1.2vw',
                          color: 'var(--fg)',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.95vw',
                          color: '#22d3ee',
                          opacity: 0.9,
                          lineHeight: 1.2,
                        }}
                      >
                        {step.mono}
                      </span>
                      {step.pills && (
                        <span className="flex gap-1">
                          {step.pills.map((p) => (
                            <span
                              key={p}
                              className="mono"
                              style={{
                                fontSize: '0.85vw',
                                padding: '0.2vh 0.5vw',
                                borderRadius: '5px',
                                background: 'rgba(34,211,238,0.15)',
                                color: '#67e8f9',
                                border: '1px solid rgba(34,211,238,0.3)',
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </span>
                      )}
                      <span
                        className="mono ml-auto"
                        style={{
                          fontSize: '0.8vw',
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {step.source}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.98vw',
                        color: 'var(--dim)',
                        lineHeight: 1.45,
                        marginTop: '0.4vh',
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 13b: Cache Edit Pipeline — Client Memory → KV Cache ───────────────
//
// Animates the three-layer journey of a cached tool_result eviction:
//   1. Client memory  — messages[] is never mutated, full content stays
//   2. API request    — tool_result becomes cache_reference; cache_edits appended
//   3. Mycro KV store — K,V pages for that reference are evicted from GPU memory
// Then visualises the consequence at decode time: the new token's Q can only
// attend to surviving K,V positions. Animation is deliberately slow and paced
// so each stage can be read before the next appears (~13s total).

function S11d_CacheEditPipeline() {
  // Base delay offsets (seconds). Keep them as variables so the pacing is
  // obvious from one place. The viewer reads each stage ~1.5s before the
  // next element starts to fade in.
  const t = {
    // Left column — pipeline
    stage1:        0.4,   // client memory box appears
    narr1:         1.6,   // "messages[] untouched" narrator line
    arrow1:        2.8,   // addCacheBreakpoints() connector appears
    packet1:       3.0,   // data packet starts traveling down arrow 1
    stage2:        4.4,   // API request shell appears
    stage2Ref:     5.4,   // cache_reference inset appears
    stage2Edit:    6.4,   // cache_edits block appears (pinned)
    narr2:         7.2,   // "pointer, not content" narrator
    arrow2:        8.2,   // processed-by-Mycro arrow appears
    packet2:       8.4,   // data packet starts traveling down arrow 2
    stage3:        9.6,   // Mycro KV page store shell appears
    stage3Row1:   10.2,   // prior_prefix row
    stage3Row2:   10.8,   // "abc" row
    stage3Evict:  11.4,   // eviction pulse + hatching on "abc"
    stage3Row3:   12.0,   // "def" row
    narr3:        12.8,   // "K,V pages gone from GPU" narrator

    // Right column — decode attention view (runs in parallel, starts early
    // so the viewer already sees the prefill scaffold while left animates)
    decHeader:     0.5,
    decPrefill:    1.2,   // 8 token boxes appear
    decKV:         2.4,   // 8 K,V pages appear (all green initially)
    decEvictText: 11.4,   // "cache_edits removed K, V pages…" caption
    decKVEvict:   11.4,   // positions 4 and 5 transition to evicted (syncs with stage3Evict)
    decNewTok:    13.0,   // new token box pops in
    decAttn0:     13.6,   // first attention line draws
    decAttnStep:   0.22,  // per-line delay
    decVoid:      15.2,   // faint "zero attention" lines to evicted positions
    decCaption:   16.0,   // bottom caption fades in
    callout:      16.8,   // "why this beats truncation" callout
  }

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: '97vw' }}>
      <h2 className="slide-h2" style={{ fontSize: '3.2vw', marginBottom: '0.3vh' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55em',
          letterSpacing: '0.14em',
          color: '#818cf8',
          textTransform: 'uppercase',
          marginRight: '0.8em',
          verticalAlign: 'middle',
        }}>
          Layer 1 · Pipeline
        </span>
        Cache Edit <span style={{ color: 'var(--dim)', fontWeight: 400 }}>—</span>{' '}
        <span style={{ color: '#22d3ee' }}>Client Memory → KV Cache</span>
      </h2>
      <p className="cep-narr" style={{
        fontSize: '1.4vw',
        color: 'var(--dim)',
        lineHeight: 1.45,
        marginBottom: '1vh',
        animationDelay: '0.15s',
      }}>
        The conversation is kept whole on the client. Only specific K,V pages are
        surgically removed from the server — surrounding cache stays valid.
      </p>

      <div className="flex gap-5 w-full items-start" style={{ maxHeight: '80vh' }}>
        {/* ════════════════════════════════════════════════════════════════
            LEFT — 3-stage pipeline (client memory → request → KV page store)
            ════════════════════════════════════════════════════════════════ */}
        <div
          className="glass-card flex flex-col"
          style={{ flex: '1.15', padding: '1.8vh 1.5vw', maxHeight: '80vh' }}
        >
          <p className="mono uppercase" style={{
            fontSize: '1.25vw',
            color: '#818cf8',
            letterSpacing: '0.14em',
            marginBottom: '1.1vh',
          }}>
            ▸ Request-time flow
          </p>

          {/* ─── Stage 1 · Client memory ─── */}
          <div className="cep-stage" style={{ animationDelay: `${t.stage1}s` }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: '0.5vh' }}>
              <span className="mono" style={{ fontSize: '1.0vw', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#a78bfa', marginRight: '0.4em' }}>1 ·</span>
                client memory · <span style={{ color: '#a78bfa' }}>messages[]</span> is never modified
              </span>
              <span className="mono" style={{ fontSize: '0.85vw', color: 'rgba(255,255,255,0.4)' }}>
                microCompact.ts
              </span>
            </div>
            <div
              className="rounded-lg"
              style={{
                padding: '1vh 1.1vw',
                background: 'rgba(129,140,248,0.07)',
                border: '1.5px solid rgba(129,140,248,0.35)',
                fontSize: '1.05vw',
                lineHeight: 1.55,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.88)' }}>
                <span style={{ color: '#a78bfa' }}>user:</span> "search the docs for X"
              </div>
              <div style={{ color: 'rgba(255,255,255,0.88)' }}>
                <span style={{ color: '#a78bfa' }}>assistant:</span> tool_use {'{'} id: <span style={{ color: '#fbbf24' }}>"abc"</span>, name: "search_docs" {'}'}
              </div>
              <div
                className="rounded"
                style={{
                  marginTop: '0.7vh',
                  padding: '0.7vh 0.85vw',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.4)',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.92)' }}>
                  <span style={{ color: '#fbbf24' }}>user:</span> tool_result {'{'} id: <span style={{ color: '#fbbf24' }}>"abc"</span>, content: <span style={{ color: '#86efac' }}>"&lt;25 KB of search output…&gt;"</span> {'}'}
                </div>
                <div style={{ color: '#fcd34d', fontSize: '0.95vw', marginTop: '0.3vh' }}>
                  ▲ full content stays here, intact
                </div>
              </div>
            </div>
          </div>

          {/* ─── Arrow 1 · addCacheBreakpoints ─── */}
          <div
            className="cep-arrow relative self-center"
            style={{
              animationDelay: `${t.arrow1}s`,
              width: '3px',
              height: '4.5vh',
              background: 'linear-gradient(180deg, rgba(129,140,248,0.15) 0%, rgba(34,211,238,0.55) 50%, rgba(16,185,129,0.15) 100%)',
              marginTop: '0.8vh',
              marginBottom: '0.4vh',
            }}
          >
            {/* Traveling packet dot */}
            <div
              className="cep-packet absolute"
              style={{
                animationDelay: `${t.packet1}s`,
                left: '50%',
                top: 0,
                width: '1.25vw',
                height: '1.25vw',
                marginLeft: '-0.625vw',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 22px rgba(34,211,238,0.8), 0 0 6px rgba(255,255,255,0.9) inset',
              }}
            />
            {/* Label */}
            <div
              className="mono absolute"
              style={{
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '0.8vw',
                fontSize: '1.05vw',
                color: '#22d3ee',
                whiteSpace: 'nowrap',
              }}
            >
              addCacheBreakpoints()
            </div>
          </div>

          {/* ─── Stage 2 · API request body ─── */}
          <div className="cep-stage" style={{ animationDelay: `${t.stage2}s`, marginTop: '0.4vh' }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: '0.5vh' }}>
              <span className="mono" style={{ fontSize: '1.0vw', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#22d3ee', marginRight: '0.4em' }}>2 ·</span>
                api request body <span style={{ color: 'rgba(255,255,255,0.4)' }}>· sent to server</span>
              </span>
              <span className="mono" style={{ fontSize: '0.85vw', color: 'rgba(255,255,255,0.4)' }}>
                query.ts → claude.ts
              </span>
            </div>
            <div
              className="rounded-lg"
              style={{
                padding: '1vh 1.1vw',
                background: 'rgba(34,211,238,0.06)',
                border: '1.5px solid rgba(34,211,238,0.35)',
                fontSize: '1.05vw',
                lineHeight: 1.55,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.88)' }}>
                <span style={{ color: '#67e8f9' }}>user:</span> "search the docs for X"
              </div>
              <div style={{ color: 'rgba(255,255,255,0.88)' }}>
                <span style={{ color: '#67e8f9' }}>assistant:</span> tool_use {'{'} id: <span style={{ color: '#fbbf24' }}>"abc"</span>, name: "search_docs" {'}'}
              </div>

              {/* cache_reference inset — green, pointer */}
              <div
                className="cep-stage rounded"
                style={{
                  animationDelay: `${t.stage2Ref}s`,
                  marginTop: '0.7vh',
                  padding: '0.7vh 0.8vw',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.45)',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.92)' }}>
                  <span style={{ color: '#6ee7b7' }}>user:</span> tool_result {'{'} cache_reference: <span style={{ color: '#86efac' }}>"abc"</span> {'}'}
                  <span style={{ color: '#6ee7b7', marginLeft: '0.5em' }}>← pointer, ~10 bytes</span>
                </div>
              </div>

              {/* cache_edits block — red, pinned */}
              <div
                className="cep-stage rounded"
                style={{
                  animationDelay: `${t.stage2Edit}s`,
                  marginTop: '0.6vh',
                  padding: '0.7vh 0.8vw',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.45)',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.92)' }}>
                  <span style={{ color: '#fca5a5' }}>cache_edits:</span> [ {'{'} type: <span style={{ color: '#fca5a5' }}>"delete"</span>, cache_reference: <span style={{ color: '#86efac' }}>"abc"</span> {'}'} ]
                </div>
                <div style={{ color: '#fca5a5', fontSize: '0.95vw', marginTop: '0.3vh' }}>
                  ▲ pinned, re-sent on every future request
                </div>
              </div>
            </div>
          </div>

          {/* ─── Arrow 2 · processed by Mycro ─── */}
          <div
            className="cep-arrow relative self-center"
            style={{
              animationDelay: `${t.arrow2}s`,
              width: '3px',
              height: '4.5vh',
              background: 'linear-gradient(180deg, rgba(34,211,238,0.55) 0%, rgba(245,158,11,0.55) 50%, rgba(239,68,68,0.4) 100%)',
              marginTop: '0.8vh',
              marginBottom: '0.4vh',
            }}
          >
            <div
              className="cep-packet absolute"
              style={{
                animationDelay: `${t.packet2}s`,
                left: '50%',
                top: 0,
                width: '1.25vw',
                height: '1.25vw',
                marginLeft: '-0.625vw',
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 22px rgba(245,158,11,0.8), 0 0 6px rgba(255,255,255,0.9) inset',
              }}
            />
            <div
              className="mono absolute"
              style={{
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '0.8vw',
                fontSize: '1.05vw',
                color: '#f59e0b',
                whiteSpace: 'nowrap',
              }}
            >
              processed by Mycro
            </div>
          </div>

          {/* ─── Stage 3 · Mycro KV page store ─── */}
          <div className="cep-stage" style={{ animationDelay: `${t.stage3}s`, marginTop: '0.4vh' }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: '0.5vh' }}>
              <span className="mono" style={{ fontSize: '1.0vw', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#f59e0b', marginRight: '0.4em' }}>3 ·</span>
                server · Mycro KV page store <span style={{ color: 'rgba(255,255,255,0.4)' }}>(GPU memory)</span>
              </span>
              <span className="mono" style={{ fontSize: '0.85vw', color: 'rgba(255,255,255,0.4)' }}>
                page_manager/index.rs
              </span>
            </div>
            <div
              className="rounded-lg"
              style={{
                padding: '1vh 1.1vw',
                background: 'rgba(16,185,129,0.06)',
                border: '1.5px solid rgba(16,185,129,0.3)',
                fontSize: '1.05vw',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <PageStoreRow
                delay={t.stage3Row1}
                label="prior_prefix"
                pages={5}
                kept
                note="→ K, V pages kept"
              />
              <PageStoreRow
                delay={t.stage3Row2}
                evictDelay={t.stage3Evict}
                label='"abc"'
                pages={5}
                evicted
                note="→ evicted, counted in cache_deleted_input_tokens"
              />
              <PageStoreRow
                delay={t.stage3Row3}
                label='"def"'
                pages={3}
                kept
                note="→ K, V pages kept (a different tool result)"
              />
            </div>
          </div>

          {/* Narrator at the bottom of left column */}
          <div
            className="cep-narr"
            style={{
              animationDelay: `${t.narr3}s`,
              marginTop: '1.1vh',
              padding: '0.8vh 1vw',
              borderRadius: '10px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              fontSize: '1.0vw',
              color: '#fcd34d',
              lineHeight: 1.5,
            }}
          >
            The K, V tensors for those tokens no longer exist on the server.
            The client's <span className="mono">messages[]</span> still has the text, but the model has nothing to attend to.
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT — Decode attention view (new token reaching surviving K,V)
            ════════════════════════════════════════════════════════════════ */}
        <div
          className="glass-card flex flex-col"
          style={{ flex: '1', padding: '1.8vh 1.5vw', maxHeight: '80vh' }}
        >
          <div className="cep-narr" style={{ animationDelay: `${t.decHeader}s` }}>
            <p className="mono uppercase" style={{
              fontSize: '1.25vw',
              color: '#f59e0b',
              letterSpacing: '0.14em',
              marginBottom: '0.6vh',
            }}>
              ▸ What the model sees at decode time
            </p>
            <p style={{ fontSize: '1.1vw', color: 'var(--dim)', lineHeight: 1.5, marginBottom: '1.2vh' }}>
              The prefix hashes at positions 1–3 and 6–8 are unchanged, so that
              cache stays valid. Only the targeted tokens at positions 4 and 5
              are dropped.
            </p>
          </div>

          <DecodeAttentionView t={t} />

          {/* Caption below SVG */}
          <p
            className="cep-narr mono"
            style={{
              animationDelay: `${t.decCaption}s`,
              marginTop: '1vh',
              fontSize: '1.05vw',
              color: '#fcd34d',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Q reaches the surviving K, V — evicted positions contribute zero.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92vw' }}>
              Surrounding cache stays valid; only the targeted tokens are forgotten.
            </span>
          </p>

          {/* Bottom callout: why this beats truncation */}
          <div
            className="cep-narr"
            style={{
              animationDelay: `${t.callout}s`,
              marginTop: '1.2vh',
              padding: '1.1vh 1.2vw',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(16,185,129,0.08) 100%)',
              border: '1px solid rgba(34,211,238,0.35)',
            }}
          >
            <p className="mono uppercase" style={{
              fontSize: '0.95vw',
              color: '#67e8f9',
              letterSpacing: '0.12em',
              marginBottom: '0.5vh',
            }}>
              ▸ why this beats truncation
            </p>
            <p style={{ fontSize: '1.05vw', color: 'var(--fg)', lineHeight: 1.55 }}>
              Removing a message from <span className="mono" style={{ color: '#a5f3fc' }}>messages[]</span> would change the prefix hash and
              force a full re-prefill of everything after it. With{' '}
              <span className="mono" style={{ color: '#86efac' }}>cache_edits</span> the structure is preserved — only the targeted
              pages are dropped, at zero re-prefill cost. Anthropic bills this as{' '}
              <span className="mono" style={{ color: '#fcd34d' }}>cache_deleted_input_tokens</span>, not fresh input.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components used by S11d_CacheEditPipeline ───────────────────────────

function PageStoreRow({
  delay,
  evictDelay,
  label,
  pages,
  kept,
  evicted,
  note,
}: {
  delay: number
  evictDelay?: number
  label: string
  pages: number
  kept?: boolean
  evicted?: boolean
  note: string
}) {
  return (
    <div
      className="cep-stage flex items-center gap-3"
      style={{ animationDelay: `${delay}s`, padding: '0.5vh 0' }}
    >
      <span
        className="mono"
        style={{
          width: '7vw',
          color: evicted ? '#fca5a5' : kept ? '#86efac' : 'rgba(255,255,255,0.8)',
          fontSize: '1.0vw',
        }}
      >
        {label}
      </span>
      <div className="flex gap-[4px]">
        {Array.from({ length: pages }).map((_, i) => (
          <div
            key={i}
            className={evicted ? 'cep-kv-evicted' : ''}
            style={{
              width: '1.5vw',
              height: '1.5vw',
              minWidth: '18px',
              minHeight: '18px',
              borderRadius: '4px',
              background: kept ? 'rgba(16,185,129,0.12)' : undefined,
              border: kept
                ? '1.5px solid rgba(16,185,129,0.55)'
                : '1.5px solid rgba(239,68,68,0.5)',
              ...(evicted && evictDelay !== undefined
                ? { animationDelay: `${evictDelay + i * 0.05}s` }
                : {}),
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: '0.92vw',
          color: evicted ? '#fca5a5' : 'rgba(255,255,255,0.6)',
          marginLeft: '0.5vw',
          lineHeight: 1.4,
        }}
      >
        {note}
      </span>
    </div>
  )
}

// Hoisted constants — avoid re-allocation on every render
const DECODE_LABELS = ['user', '"do X"', 'tool_use', 'result t₁', 'result t₂', 'asst', '"reply"', '"Q?"'] as const
const DECODE_EVICTED = new Set([3, 4])
const DECODE_SURVIVING = [0, 1, 2, 5, 6, 7] as const

function DecodeAttentionView({ t }: { t: Record<string, number> }) {
  const labels = DECODE_LABELS
  const evictedSet = DECODE_EVICTED

  // ViewBox is now 1400 × 760 (was 1380 × 480). The taller aspect ratio
  // makes the SVG render about 55 % taller at the same container width,
  // closing the empty gap below the glass-card on slide 14.
  const boxW = 144
  const boxH = 76
  const gap = 22
  const xAt = (i: number) => 92 + i * (boxW + gap)

  const kvY = 175
  const kvH = 84
  const newTokX = xAt(3) + boxW / 2 + (boxW + gap) * 0.5 // centered under positions 4-5 area
  const newTokY = 580

  const survivingIndices = DECODE_SURVIVING

  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
      <svg
        viewBox="0 0 1400 760"
        style={{ width: '100%', height: '100%', maxHeight: '76vh', overflow: 'visible' }}
      >
        {/* Section label: prefill positions */}
        <text
          className="cep-narr"
          x="40"
          y="42"
          fill="rgba(255,255,255,0.6)"
          fontSize="28"
          fontFamily="var(--font-body)"
          style={{ animationDelay: `${t.decHeader}s` }}
        >
          Prefill positions (token sequence)
        </text>

        {/* Token label boxes (top row) */}
        {labels.map((label, i) => {
          const isEvicted = evictedSet.has(i)
          return (
            <g
              key={`tok-${i}`}
              className="cep-stage"
              style={{ animationDelay: `${t.decPrefill + i * 0.12}s` }}
            >
              <rect
                x={xAt(i)}
                y={68}
                width={boxW}
                height={boxH}
                rx={14}
                fill={isEvicted ? 'rgba(255,255,255,0.03)' : 'rgba(129,140,248,0.1)'}
                stroke={isEvicted ? 'rgba(255,255,255,0.25)' : 'rgba(129,140,248,0.55)'}
                strokeWidth={isEvicted ? 1.8 : 2.4}
                strokeDasharray={isEvicted ? '6 5' : undefined}
              />
              <text
                x={xAt(i) + boxW / 2}
                y={68 + boxH / 2 + 10}
                textAnchor="middle"
                fill={isEvicted ? 'rgba(255,255,255,0.45)' : '#c7d2fe'}
                fontSize="30"
                fontFamily="var(--font-mono)"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* K,V page row */}
        {labels.map((_, i) => {
          const isEvicted = evictedSet.has(i)
          // The kept boxes appear early; the two evicted ones start as kept
          // then transition via the cep-evict pulse + class swap timed to t.decKVEvict.
          return (
            <g
              key={`kv-${i}`}
              className="cep-stage"
              style={{
                animationDelay: `${
                  isEvicted ? t.decKV + i * 0.12 : t.decKV + i * 0.12
                }s`,
              }}
            >
              {/* Base K,V rect — green if kept, toggled to hatched red via overlay if evicted */}
              <rect
                x={xAt(i)}
                y={kvY}
                width={boxW}
                height={kvH}
                rx={14}
                fill={isEvicted ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.12)'}
                stroke="rgba(16,185,129,0.6)"
                strokeWidth={2.4}
              />
              {!isEvicted && (
                <text
                  x={xAt(i) + boxW / 2}
                  y={kvY + 36}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="30"
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                >
                  K
                </text>
              )}
              {!isEvicted && (
                <text
                  x={xAt(i) + boxW / 2}
                  y={kvY + 72}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="30"
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                >
                  V
                </text>
              )}
            </g>
          )
        })}

        {/* Eviction overlay on positions 3 and 4 — appears at t.decKVEvict,
            drawn over the green rect to "destroy" it */}
        {[3, 4].map((i) => (
          <g
            key={`evict-${i}`}
            className="cep-stage"
            style={{ animationDelay: `${t.decKVEvict + (i - 3) * 0.25}s` }}
          >
            {/* Red translucent overlay */}
            <rect
              x={xAt(i)}
              y={kvY}
              width={boxW}
              height={kvH}
              rx={14}
              fill="rgba(239,68,68,0.14)"
              stroke="rgba(239,68,68,0.7)"
              strokeWidth={2.4}
              strokeDasharray="7 6"
            />
            {/* Diagonal hatching via two crossing lines */}
            <line
              x1={xAt(i) + 10}
              y1={kvY + 10}
              x2={xAt(i) + boxW - 10}
              y2={kvY + kvH - 10}
              stroke="rgba(239,68,68,0.55)"
              strokeWidth={2.5}
            />
            <line
              x1={xAt(i) + boxW - 10}
              y1={kvY + 10}
              x2={xAt(i) + 10}
              y2={kvY + kvH - 10}
              stroke="rgba(239,68,68,0.55)"
              strokeWidth={2.5}
            />
            <text
              x={xAt(i) + boxW / 2}
              y={kvY + kvH / 2 + 10}
              textAnchor="middle"
              fill="#fca5a5"
              fontSize="28"
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              evicted
            </text>
          </g>
        ))}

        {/* Eviction caption */}
        <text
          className="cep-narr"
          x={xAt(3) + boxW + gap / 2}
          y={kvY + kvH + 42}
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="24"
          fontFamily="var(--font-mono)"
          style={{ animationDelay: `${t.decEvictText + 0.3}s` }}
        >
          cache_edits removed K, V pages at positions 4 and 5
        </text>

        {/* Divider between prefill and decode */}
        <line
          x1="40"
          y1="360"
          x2="1360"
          y2="360"
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="7 7"
          strokeWidth={1.2}
          className="cep-narr"
          style={{ animationDelay: `${t.decKV + 0.4}s` }}
        />
        <text
          className="cep-narr"
          x="40"
          y="402"
          fill="rgba(255,255,255,0.6)"
          fontSize="28"
          fontFamily="var(--font-body)"
          style={{ animationDelay: `${t.decKV + 0.4}s` }}
        >
          Decode next token
        </text>

        {/* Attention lines — drawn from surviving K,V boxes to new token */}
        {survivingIndices.map((i, k) => {
          const x1 = xAt(i) + boxW / 2
          const y1 = kvY + kvH
          const x2 = newTokX
          const y2 = newTokY
          return (
            <line
              key={`attn-${i}`}
              className="cep-attn"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fbbf24"
              strokeWidth={3.5}
              strokeLinecap="round"
              style={{ animationDelay: `${t.decAttn0 + k * t.decAttnStep}s` }}
            />
          )
        })}

        {/* Faint lines from new token to the evicted positions — they lead
            to nothing (emphasise "zero contribution") */}
        {[3, 4].map((i) => (
          <line
            key={`void-${i}`}
            className="cep-attn-void"
            x1={newTokX}
            y1={newTokY}
            x2={xAt(i) + boxW / 2}
            y2={kvY + kvH - 4}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={2}
            style={{ animationDelay: `${t.decVoid + (i - 3) * 0.2}s` }}
          />
        ))}

        {/* New token box */}
        <g className="cep-newtoken" style={{ animationDelay: `${t.decNewTok}s` }}>
          <rect
            x={newTokX - 160}
            y={newTokY - 56}
            width={320}
            height={112}
            rx={18}
            fill="rgba(251,191,36,0.12)"
            stroke="#fbbf24"
            strokeWidth={3.5}
          />
          <text
            x={newTokX}
            y={newTokY - 14}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="32"
            fontFamily="var(--font-display)"
            fontWeight={700}
          >
            new token
          </text>
          <text
            x={newTokX}
            y={newTokY + 26}
            textAnchor="middle"
            fill="rgba(251,191,36,0.8)"
            fontSize="24"
            fontFamily="var(--font-mono)"
          >
            computes Q
          </text>
        </g>
      </svg>
    </div>
  )
}

// ─── Slide 12: L1 Before/After ───────────────────────────────────────────────

function S12_MicrocompactDemo() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-6">
      <p className="slide-h3">Layer 1 — In Action</p>
      <h2 className="slide-h2">Before <span style={{ color: '#10b981' }}>→</span> After</h2>

      <div className="flex gap-6 mt-4" style={{ width: '85vw' }}>
        {/* Before */}
        <div className="flex-1">
          <p className="mono text-sm mb-2" style={{ color: '#ef4444' }}>Before (15,847 tokens)</p>
          <div className="code-block" style={{ fontSize: '1.15vw', maxHeight: '40vh', overflow: 'auto' }}>
            <span style={{ color: '#6b6b66' }}>// tool_result from Read (2 hours ago)</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"1  import {'{'} useState {'}'} from &apos;react&apos;\n2  import {'{'} useEffect {'}'} ...\n3  // ... 2000 lines of component code\n4  export default App"</span>{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// tool_result from Bash (1 hour ago)</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"node_modules/.package-lock.json\nnode_modules/react/index.js\n... 847 lines of output"</span>{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// tool_result from Grep (45 min ago)</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"src/App.tsx:14:  const [state, setState]\nsrc/App.tsx:27:  useEffect(() ={'>'} {'{'}\n... 126 matches"</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="cascade-item" style={{ animationDelay: '0.6s' }}>
            <svg width="60" height="40" viewBox="0 0 60 40">
              <path d="M5 20 L45 20 M38 12 L48 20 L38 28" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            <p className="mono text-center" style={{ fontSize: '0.85vw', color: '#10b981' }}>✂️ clear</p>
          </div>
        </div>

        {/* After */}
        <div className="flex-1">
          <p className="mono text-sm mb-2" style={{ color: '#10b981' }}>After (312 tokens)</p>
          <div className="code-block" style={{ fontSize: '1.15vw', maxHeight: '40vh', overflow: 'auto' }}>
            <span style={{ color: '#6b6b66' }}>// tool_result from Read</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"[Old tool result content cleared]"</span>{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// tool_result from Bash</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"[Old tool result content cleared]"</span>{'\n\n'}
            <span style={{ color: '#6b6b66' }}>// tool_result from Grep</span>{'\n'}
            <span style={{ color: '#c084fc' }}>content</span>: <span style={{ color: '#86efac' }}>"[Old tool result content cleared]"</span>
          </div>
        </div>
      </div>

      <p className="slide-body" style={{ fontSize: '1.4vw' }}>
        <span className="accent mono">98%</span> token reduction. Zero information loss — the model already used these results.
      </p>
    </div>
  )
}

// ─── Slide 13: L2 Auto-Compact Concept ───────────────────────────────────────

function S13_AutoCompactConcept() {
  // Bar segments: left→right = [167K threshold | 13K buffer | 20K reserved] = 200K total
  const TOTAL = 200
  const segments = [
    {
      key: 'threshold',
      value: 167,
      title: 'Auto-Compact Threshold',
      sub: 'where compaction fires',
      color: '#10b981',
      delay: 0.3,
    },
    {
      key: 'buffer',
      value: 13,
      title: 'AUTOCOMPACT_BUFFER',
      sub: 'safety margin',
      color: '#fbbf24',
      delay: 0.9,
    },
    {
      key: 'reserved',
      value: 20,
      title: 'MAX_OUTPUT_TOKENS_FOR_SUMMARY',
      sub: 'p99.99 summary = 17,387',
      color: '#f59e0b',
      delay: 1.5,
    },
  ]

  // Pre-compute left offsets — single-pass prefix sum (was O(n²))
  const leftOffsets: number[] = [0]
  for (let i = 1; i < segments.length; i++) {
    leftOffsets[i] = leftOffsets[i - 1] + segments[i - 1].value
  }

  const otherBuffers = [
    { name: 'WARNING_THRESHOLD_BUFFER', value: '20K', color: '#fbbf24' },
    { name: 'ERROR_THRESHOLD_BUFFER', value: '20K', color: '#f43f5e' },
    { name: 'MANUAL_COMPACT_BUFFER', value: '3K', color: '#818cf8' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-5" style={{ paddingTop: '2vh' }}>
      <p className="slide-h3">Layer 2</p>
      <h2 className="slide-h2">Auto-Compact: <span style={{ color: '#3b82f6' }}>The Gatekeeper</span></h2>

      <div className="flex gap-5" style={{ width: '84vw' }}>
        <div className="flex-1 glass-card" style={{ padding: '2.2vh 1.6vw' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ fontSize: '2.2vw' }}>📊</div>
            <p className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#3b82f6', fontSize: '1.1vw', lineHeight: 1.25 }}>
              The orchestrator. Decides IF and HOW to compress.
            </p>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--dim)', fontSize: '0.85vw' }}>
            Called after micro-compact in the query loop. Runs a decision tree:
            recursion guard → feature flags → token threshold → circuit breaker → strategy selection.
          </p>
        </div>

        <div className="flex-1 glass-card" style={{ padding: '2.2vh 1.6vw' }}>
          <p className="mono font-bold mb-3" style={{ color: '#3b82f6', fontSize: '0.8vw', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategy Priority</p>
          <div className="flex gap-2">
            {[
              { n: '1st', label: 'Session Memory', color: '#f59e0b' },
              { n: '2nd', label: 'Full Compact', color: '#0ea5e9' },
              { n: 'last', label: 'Emergency Snip', color: '#f43f5e' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg" style={{ padding: '0.8vh 0.8vw', background: s.color + '15', border: `1px solid ${s.color}40` }}>
                <span className="mono font-bold" style={{ color: s.color, fontSize: '0.7vw' }}>{s.n}</span>
                <span style={{ color: 'var(--dim)', fontSize: '0.8vw' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Animated token-budget visualization ── */}
      <div className="glass-card" style={{ width: '84vw', padding: '2.5vh 2vw' }}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="mono font-bold" style={{ color: '#3b82f6', fontSize: '0.85vw', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Token Threshold Formula</p>
            <p style={{ color: 'var(--dim)', fontSize: '0.75vw', marginTop: '0.3vh' }}>
              How the auto-compact threshold is derived from the model's context window
            </p>
          </div>
          <div className="mono" style={{ color: '#6b6b66', fontSize: '0.8vw' }}>
            example: <span style={{ color: '#e8e8e3' }}>Opus 200K</span>
          </div>
        </div>

        {/* Scale markers above bar */}
        <div className="relative" style={{ height: '1.2vw', marginBottom: '0.4vh' }}>
          {[0, 50, 100, 150, 200].map(tick => (
            <div key={tick} className="absolute" style={{ left: `${(tick / TOTAL) * 100}%`, transform: 'translateX(-50%)' }}>
              <span className="mono" style={{ color: '#6b6b66', fontSize: '0.6vw' }}>{tick}K</span>
            </div>
          ))}
        </div>

        {/* The bar */}
        <div
          className="relative"
          style={{
            height: '6vh',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            overflow: 'visible',
          }}
        >
          {/* Segments */}
          {segments.map((seg, i) => (
            <div
              key={seg.key}
              className="token-seg absolute"
              style={{
                left: `${(leftOffsets[i] / TOTAL) * 100}%`,
                width: `${(seg.value / TOTAL) * 100}%`,
                top: 0,
                bottom: 0,
                background: `linear-gradient(180deg, ${seg.color}55, ${seg.color}22)`,
                borderLeft: i === 0 ? 'none' : `1px dashed ${seg.color}80`,
                borderTopLeftRadius: i === 0 ? 10 : 0,
                borderBottomLeftRadius: i === 0 ? 10 : 0,
                borderTopRightRadius: i === segments.length - 1 ? 10 : 0,
                borderBottomRightRadius: i === segments.length - 1 ? 10 : 0,
                animationDelay: `${seg.delay}s`,
              }}
            >
              {/* Inline label inside segment */}
              <div className="flex items-center justify-center h-full" style={{ padding: '0 0.4vw' }}>
                <span className="mono font-bold" style={{ color: '#fff', fontSize: '1vw', textShadow: `0 0 8px ${seg.color}` }}>
                  {seg.value}K
                </span>
              </div>
            </div>
          ))}

          {/* Threshold marker — vertical bar at 167K */}
          <div
            className="token-marker absolute"
            style={{
              left: `${(167 / TOTAL) * 100}%`,
              top: '-1.4vh',
              bottom: '-1.4vh',
              width: 2,
              background: '#fbbf24',
              transform: 'translateX(-1px)',
              borderRadius: 2,
            }}
          >
            <div
              className="absolute mono font-bold whitespace-nowrap"
              style={{
                top: '-2.4vh',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fbbf24',
                fontSize: '0.7vw',
                textShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
              }}
            >
              ▼ fires @ 167K
            </div>
          </div>
        </div>

        {/* Legend — each item gets equal width so long constant names don't overlap */}
        <div className="flex gap-3" style={{ marginTop: '1.4vh' }}>
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="token-label flex items-start gap-2 rounded-lg"
              style={{
                flex: '1 1 0',
                padding: '0.9vh 0.8vw',
                background: seg.color + '0d',
                border: `1px solid ${seg.color}28`,
                animationDelay: `${seg.delay + 0.4}s`,
              }}
            >
              <div
                style={{
                  width: '0.8vw',
                  height: '0.8vw',
                  minWidth: '0.8vw',
                  marginTop: '0.25vh',
                  borderRadius: 3,
                  background: seg.color,
                  boxShadow: `0 0 8px ${seg.color}80`,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="font-bold" style={{ color: seg.color, fontSize: '0.78vw', lineHeight: 1.2 }}>
                  <span className="mono">{seg.value}K</span>
                  {' · '}
                  {seg.title}
                </p>
                <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.68vw', marginTop: '0.25vh', lineHeight: 1.2 }}>
                  {seg.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Formula breakdown lines */}
        <div className="mt-2" style={{ padding: '1.4vh 1.4vw', background: '#12121a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <div className="token-formula-line mono" style={{ fontSize: '0.9vw', lineHeight: 1.7, animationDelay: '2.3s' }}>
            <span style={{ color: '#6b6b66' }}>// Opus 200K context window</span>
          </div>
          <div className="token-formula-line mono" style={{ fontSize: '0.9vw', lineHeight: 1.7, animationDelay: '2.5s' }}>
            <span style={{ color: '#e8e8e3' }}>effectiveWindow = </span>
            <span style={{ color: '#e8e8e3' }}>200,000</span>
            <span style={{ color: '#6b6b66' }}> − </span>
            <span style={{ color: '#f59e0b' }}>20,000</span>
            <span style={{ color: '#6b6b66' }}> = </span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>180,000</span>
            <span style={{ color: '#6b6b66' }}>  // minus MAX_OUTPUT_TOKENS_FOR_SUMMARY</span>
          </div>
          <div className="token-formula-line mono" style={{ fontSize: '0.9vw', lineHeight: 1.7, animationDelay: '2.7s' }}>
            <span style={{ color: '#e8e8e3' }}>threshold       = </span>
            <span style={{ color: '#10b981' }}>180,000</span>
            <span style={{ color: '#6b6b66' }}> − </span>
            <span style={{ color: '#fbbf24' }}>13,000</span>
            <span style={{ color: '#6b6b66' }}> = </span>
            <span style={{ color: '#fbbf24', fontWeight: 700, textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>167,000</span>
            <span style={{ color: '#6b6b66' }}>  // minus AUTOCOMPACT_BUFFER_TOKENS</span>
          </div>
          <div className="token-formula-line mono" style={{ fontSize: '0.9vw', lineHeight: 1.7, animationDelay: '2.9s' }}>
            <span style={{ color: '#6b6b66' }}>// fires when: tokenCount − snipTokensFreed ≥ threshold</span>
          </div>
        </div>

        {/* Other related thresholds */}
        <div className="flex items-center gap-3 mt-3">
          <span className="mono" style={{ color: '#6b6b66', fontSize: '0.7vw', textTransform: 'uppercase', letterSpacing: '0.08em' }}>other buffers:</span>
          {otherBuffers.map((b, i) => (
            <div
              key={i}
              className="token-formula-line flex items-center gap-1.5 rounded-md"
              style={{
                padding: '0.4vh 0.6vw',
                background: b.color + '12',
                border: `1px solid ${b.color}30`,
                animationDelay: `${3.1 + i * 0.12}s`,
              }}
            >
              <span className="mono font-bold" style={{ color: b.color, fontSize: '0.75vw' }}>{b.value}</span>
              <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.7vw' }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Slide 14: L2 Decision Tree (ReactFlow) ─────────────────────────────────

// Detail data for each decision tree node
const DECISION_DETAILS: Record<string, {
  icon: string; title: string; color: string; what: string; how: string;
  items?: { icon: string; label: string; result: string; highlight?: boolean }[];
  stats?: { label: string; value: string; sub?: string; color: string }[];
  code?: string; source: string; interactions: string;
}> = {
  start: {
    icon: '📊', title: 'autoCompactIfNeeded', color: '#3b82f6',
    what: 'Entry point called before every API sampling in the query loop. Decides whether context compression is needed.',
    how: 'Runs a 6-step decision tree. Each guard that fires short-circuits and returns messages unmodified. Only if all guards pass does compaction proceed.',
    items: [
      { icon: '🛡', label: 'querySource is "compact" / "session_memory" / "marble_origami"?', result: '→ Skip (recursion guard)' },
      { icon: '🚫', label: 'DISABLE_COMPACT or DISABLE_AUTO_COMPACT env var set?', result: '→ Skip' },
      { icon: '⚙', label: 'isAutoCompactEnabled() returns false (user config)?', result: '→ Skip' },
      { icon: '🔁', label: 'Reactive compact mode active (tengu_cobalt_raccoon)?', result: '→ Skip (let API error trigger)' },
      { icon: '🗜', label: 'Context collapse mode active?', result: '→ Skip (90%/95% thresholds conflict)' },
      { icon: '✅', label: 'tokenCount - snipTokensFreed >= threshold?', result: '→ Proceed to compaction', highlight: true },
    ],
    source: 'autoCompact.ts',
    interactions: 'Called by queryLoop (src/query.ts) before the normalize step. If compaction triggers, returns a modified message array to queryLoop. The query loop uses the compacted messages for the next API call.',
  },
  guard: {
    icon: '🛡️', title: 'Recursion Guard', color: '#64748b',
    what: 'Prevents compaction from triggering during a compaction call itself, which would cause infinite recursion.',
    how: 'Checks querySource against known compaction sources. If the current query was initiated by the compaction pipeline, skips entirely.',
    items: [
      { icon: '🔄', label: 'querySource === "compact"', result: '→ Skip (Full Compact calling itself)' },
      { icon: '🧠', label: 'querySource === "session_memory"', result: '→ Skip (Session Memory extraction)' },
      { icon: '🪨', label: 'querySource === "marble_origami"', result: '→ Skip (internal compaction)' },
    ],
    source: 'autoCompact.ts',
    interactions: 'First check in the autoCompactIfNeeded pipeline. If source matches, returns messages unchanged immediately.',
  },
  flags: {
    icon: '🚩', title: 'Feature Flag Check', color: '#64748b',
    what: 'Guards against compaction in scenarios where it would cause problems or is explicitly disabled.',
    how: 'Checks multiple feature flags and environment variables in order. The first guard that fires short-circuits the entire pipeline.',
    items: [
      { icon: '🚫', label: 'DISABLE_COMPACT env var', result: '→ Skip all compaction' },
      { icon: '🚫', label: 'DISABLE_AUTO_COMPACT env var', result: '→ Skip auto-compact' },
      { icon: '⚙', label: 'User config autoCompact: false', result: '→ Skip' },
      { icon: '🔁', label: 'tengu_cobalt_raccoon (reactive mode)', result: '→ Skip (API error triggers compact)' },
      { icon: '🗜', label: 'Context collapse active', result: '→ Skip (threshold conflict at 90%/93%/95%)' },
    ],
    source: 'autoCompact.ts',
    interactions: 'Receives control from autoCompactEntry. If any guard fires, returns unmodified messages. Otherwise, passes to Token Threshold Check.',
  },
  tokens: {
    icon: '🔢', title: 'Token Threshold Check', color: '#d97706',
    what: 'Calculates whether the current context exceeds the auto-compact threshold.',
    how: 'Uses a hybrid token estimation strategy: prefers exact API usage.input_tokens from the last response, falls back to roughTokenCountEstimation (charCount / 4 \u00d7 4/3 padding). Compares against a calculated threshold derived from the model\'s context window.',
    code: 'effectiveWindow = getContextWindow(model) - 20_000\nthreshold = effectiveWindow - 13_000\n// 200K model: 200K - 20K - 13K = 167K\n\nfires = tokenCountWithEstimation(msgs)\n        - snipTokensFreed >= threshold',
    stats: [
      { label: 'effectiveWindow', value: 'modelCtx - 20K', color: '#d97706' },
      { label: 'autoCompactThreshold', value: 'window - 13K', color: '#d97706' },
      { label: '200K model result', value: '167,000', sub: '200K - 20K - 13K', color: '#fbbf24' },
      { label: 'Reserved for summary', value: '20,000', sub: 'MAX_OUTPUT tokens', color: '#f59e0b' },
      { label: 'Buffer', value: '13,000', sub: 'AUTOCOMPACT_BUFFER', color: '#f59e0b' },
      { label: 'Rough estimation', value: 'chars/4 \u00d7 4/3', sub: 'padding factor', color: '#818cf8' },
    ],
    source: 'src/services/compact/autoCompact.ts',
    interactions: 'Receives from Feature Flag Check. If under threshold, context passes through unchanged. If over, triggers Circuit Breaker check. Also feeds Context Collapse (side branch) for large block folding.',
  },
  cb: {
    icon: '⚡', title: 'Circuit Breaker', color: '#f43f5e',
    what: 'Prevents infinite compaction retry loops by tracking consecutive failures.',
    how: 'Maintains a consecutiveFailures counter. After 3 consecutive failures, skips compaction entirely for the rest of the session. Based on BigQuery analysis: 1,279 sessions had 50+ consecutive failures (max 3,272), wasting ~250K API calls/day. Counter resets to 0 on any successful compaction.',
    items: [
      { icon: '✅', label: 'failures < 3', result: 'Try Session Memory \u2192 Full Compact' },
      { icon: '⚠️', label: 'failures = 1', result: 'Log warning, retry normally' },
      { icon: '⚠️', label: 'failures = 2', result: 'Log warning, last retry' },
      { icon: '🚨', label: 'failures \u2265 3', result: 'TRIPPED \u2014 skip to Snip Compact', highlight: true },
    ],
    stats: [
      { label: 'Max failures', value: '3', sub: 'MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES', color: '#f43f5e' },
      { label: 'BQ finding', value: '1,279', sub: 'sessions with 50+ failures', color: '#f59e0b' },
      { label: 'Worst case', value: '3,272', sub: 'consecutive failures in one session', color: '#f43f5e' },
      { label: 'Waste prevented', value: '~250K', sub: 'API calls/day', color: '#10b981' },
      { label: 'Reset trigger', value: 'On success', sub: 'any successful compaction', color: '#10b981' },
    ],
    source: 'autoCompact.ts',
    interactions: 'Receives from Token Analysis. Routes to: Session Memory (strategy 1, preferred), Full Compact (strategy 2, fallback), or Snip Compact (if breaker tripped, \u22653 failures).',
  },
  sm: {
    icon: '🧠', title: 'Try Session Memory (L4)', color: '#f59e0b',
    what: 'Uses pre-extracted session memories as the compression summary \u2014 no LLM call needed, completes in <10ms.',
    how: 'Session Memory is a structured file with 10 fixed sections, updated incrementally by a background Fork Agent after each turn (triggered when token growth \u2265 5K AND tool calls \u2265 3). The calculateMessagesToKeepIndex() algorithm expands backward from lastSummarizedIndex until both minTokens (10K) AND minTextBlockMessages (5) are met, capped at maxTokens (40K). Stops at CompactBoundary markers. Does NOT call an LLM at compaction time.',
    stats: [
      { label: 'Latency', value: '<10ms', sub: 'no LLM call', color: '#10b981' },
      { label: 'Success rate', value: '~70%', sub: 'of compaction attempts', color: '#f59e0b' },
      { label: 'Sections', value: '10', sub: 'fixed structure', color: '#f59e0b' },
      { label: 'Min tokens kept', value: '10K', sub: 'recent messages', color: '#818cf8' },
      { label: 'Min text blocks', value: '5', sub: 'messages preserved', color: '#818cf8' },
      { label: 'Max tokens kept', value: '40K', sub: 'total preserved', color: '#818cf8' },
      { label: 'Update trigger', value: '5K + 3', sub: 'token growth + tool calls', color: '#c084fc' },
      { label: 'Max per section', value: '2K', sub: 'tokens', color: '#c084fc' },
      { label: 'Max total file', value: '12K', sub: 'tokens', color: '#c084fc' },
    ],
    source: 'sessionMemoryCompact.ts',
    interactions: 'Preferred strategy (tried first). If returns null (stale memory or insufficient space freed), falls back to Full Compact. Uses pre-built session memory file.',
  },
  fc: {
    icon: '📝', title: 'Full Compact (L3)', color: '#0ea5e9',
    what: 'Fork Agent summarizes the entire conversation into a structured 9-section summary. Takes 5-30 seconds.',
    how: 'Creates a branch of current session that shares the main prompt cache. Preprocessing: stripImagesFromMessages \u2192 stripReinjectedAttachments \u2192 normalizeMessagesForAPI. Fork Agent generates <analysis> (chain-of-thought, deleted after) + <summary> (9 sections). Strong NO_TOOLS_PREAMBLE prevents tool calls (2.79% failure rate on Sonnet 4.6 without it vs 0.01% on Sonnet 4.5).',
    items: [
      { icon: '1', label: 'Preprocess', result: 'Strip images, attachments, normalize' },
      { icon: '2', label: 'Micro-Compact', result: 'Clear old tool results (-15-25% tokens)' },
      { icon: '3', label: 'Fork Agent', result: 'Single-turn LLM summary (5-30s)', highlight: true },
      { icon: '4', label: 'Format', result: 'Delete <analysis>, extract <summary>' },
      { icon: '5', label: 'Assemble', result: 'Summary + recent msgs + attachments' },
    ],
    stats: [
      { label: 'Latency', value: '5-30s', sub: 'LLM call required', color: '#f43f5e' },
      { label: 'Max output', value: '20K', sub: 'tokens (p99.99 = 17,387)', color: '#0ea5e9' },
      { label: 'Summary sections', value: '9', sub: 'structured sections', color: '#0ea5e9' },
      { label: 'Tool call failure', value: '2.79%', sub: 'on Sonnet 4.6 without preamble', color: '#f43f5e' },
      { label: 'PTL retries', value: 'Max 3', sub: 'truncate oldest 20%', color: '#f59e0b' },
      { label: 'Cache sharing', value: 'Yes', sub: 'via Fork Agent', color: '#10b981' },
    ],
    source: 'compact.ts',
    interactions: 'Fallback from Session Memory (when memory is stale or insufficient). Feeds into Micro-Compact for pre-cleanup, then Fork Agent Summarization, then Post-Compact Cleanup.',
  },
  skip: {
    icon: '⏭️', title: 'Skip (No-Op)', color: '#64748b',
    what: 'Messages pass through unchanged when any guard fires.',
    how: 'Returns the original messages array without modification. No compaction, no side effects. The query loop proceeds with the same context.',
    source: 'autoCompact.ts',
    interactions: 'Returned when feature flags are disabled or recursion is detected. Messages flow directly back to the query loop.',
  },
}

function S14_DecisionTree() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [popupOrigin, setPopupOrigin] = useState<{ x: number; y: number } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    const el = document.querySelector(`[data-id="${node.id}"]`)
    if (el) {
      const rect = el.getBoundingClientRect()
      setPopupOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    } else {
      setPopupOrigin(null)
    }
    setSelectedNode(node.id)
    setIsOpen(false)
    // Let the zoom start (InteractiveNode handles that), then expand popup
    setTimeout(() => setIsOpen(true), 350)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => { setSelectedNode(null); setPopupOrigin(null) }, 500)
  }, [])

  const nodes: Node[] = useMemo(() => [
    { id: 'start', type: 'iNode', position: { x: 250, y: 0 }, data: { icon: '📊', label: 'autoCompactIfNeeded', bg: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.3)', _posX: 250, _posY: 0 } },
    { id: 'guard', type: 'iNode', position: { x: 250, y: 100 }, data: { icon: '🛡️', label: 'Recursion Guard', detail: 'Skip if source is compact/session_memory', bg: 'rgba(100,116,139,0.2)', borderColor: 'rgba(100,116,139,0.4)', glow: 'rgba(100,116,139,0.3)', _posX: 250, _posY: 100 } },
    { id: 'flags', type: 'iNode', position: { x: 250, y: 200 }, data: { icon: '🚩', label: 'Feature Flags', detail: 'DISABLE_COMPACT, DISABLE_AUTO_COMPACT', bg: 'rgba(100,116,139,0.2)', borderColor: 'rgba(100,116,139,0.4)', glow: 'rgba(100,116,139,0.3)', _posX: 250, _posY: 200 } },
    { id: 'tokens', type: 'iNode', position: { x: 250, y: 300 }, data: { icon: '🔢', label: 'Token Threshold', detail: 'currentTokens > 167K?', badge: '167K', badgeBg: 'rgba(217,119,6,0.3)', badgeColor: '#fbbf24', bg: 'rgba(217,119,6,0.15)', borderColor: 'rgba(217,119,6,0.4)', glow: 'rgba(217,119,6,0.3)', _posX: 250, _posY: 300 } },
    { id: 'cb', type: 'iNode', position: { x: 250, y: 410 }, data: { icon: '⚡', label: 'Circuit Breaker', detail: 'failures >= 3 → emergency snip', bg: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.4)', glow: 'rgba(244,63,94,0.3)', _posX: 250, _posY: 410 } },
    { id: 'sm', type: 'iNode', position: { x: 80, y: 530 }, data: { icon: '🧠', label: 'Try Session Memory', detail: '~70% success rate, <10ms', badge: 'TRY FIRST', badgeBg: 'rgba(245,158,11,0.3)', badgeColor: '#f59e0b', bg: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', glow: 'rgba(245,158,11,0.3)', _posX: 80, _posY: 530 } },
    { id: 'fc', type: 'iNode', position: { x: 420, y: 530 }, data: { icon: '📝', label: 'Full Compact', detail: 'Fork Agent summarization, 5-30s', badge: 'FALLBACK', badgeBg: 'rgba(14,165,233,0.3)', badgeColor: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', borderColor: 'rgba(14,165,233,0.4)', glow: 'rgba(14,165,233,0.3)', _posX: 420, _posY: 530 } },
    { id: 'skip', type: 'iNode', position: { x: 550, y: 200 }, data: { icon: '⏭️', label: 'Skip', detail: 'Return messages unmodified', bg: 'rgba(75,85,99,0.2)', borderColor: 'rgba(75,85,99,0.4)', glow: 'rgba(75,85,99,0.2)', _posX: 550, _posY: 200 } },
  ], [])

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'start', target: 'guard', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e2', source: 'guard', target: 'flags', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } },
    { id: 'e3', source: 'flags', target: 'tokens', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } },
    { id: 'e3b', source: 'flags', target: 'skip', sourceHandle: 'right', animated: true, style: { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '4 4' }, label: 'disabled', labelStyle: { fill: '#6b6b66', fontSize: 10 } },
    { id: 'e4', source: 'tokens', target: 'cb', animated: true, style: { stroke: '#d97706', strokeWidth: 2 }, label: 'over threshold', labelStyle: { fill: '#d97706', fontSize: 10 } },
    { id: 'e5a', source: 'cb', target: 'sm', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, label: 'healthy', labelStyle: { fill: '#f59e0b', fontSize: 10 } },
    { id: 'e5b', source: 'cb', target: 'fc', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '4 4' }, label: '3+ fails', labelStyle: { fill: '#f43f5e', fontSize: 10 } },
    { id: 'e6', source: 'sm', target: 'fc', sourceHandle: 'right', targetHandle: 'left', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '6 4' }, label: 'null', labelStyle: { fill: '#6b6b66', fontSize: 10 } },
  ], [])

  const detail = selectedNode ? DECISION_DETAILS[selectedNode] : null

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="reveal-stagger flex flex-col items-center gap-2 pt-6 z-10">
        <p className="slide-h3">Layer 2 — Decision Tree</p>
        <h2 className="slide-h2" style={{ fontSize: '2.5vw' }}>Click any node to explore</h2>
      </div>
      <div className="flex-1 w-full" style={{ minHeight: '65vh' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={interactiveNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            nodesDraggable={false}
            onNodeClick={handleNodeClick}
            defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } }}
          >
            <Background color="rgba(255,255,255,0.02)" gap={40} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* ── Detail popup overlay ── */}
      {selectedNode && detail && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{
            background: isOpen ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
            backdropFilter: isOpen ? 'blur(6px)' : 'blur(0px)',
            zIndex: 100,
            transition: 'background 0.5s ease, backdrop-filter 0.5s ease',
          }}
          onClick={handleClose}
        >
          <div
            className="relative rounded-2xl border overflow-y-auto"
            style={{
              width: '86vw', maxHeight: '86vh',
              background: 'linear-gradient(180deg, rgba(18,18,28,0.85) 0%, rgba(12,12,18,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: isOpen ? detail.color + '35' : 'transparent',
              boxShadow: isOpen ? `0 0 80px ${detail.color}15, 0 24px 60px rgba(0,0,0,0.4)` : 'none',
              padding: '3.5vh 3.5vw',
              ['--dim' as string]: '#a0a098',
              ['--fg' as string]: '#f8f8f4',
              transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, border-color 0.4s ease, box-shadow 0.4s ease',
              transform: isOpen
                ? 'translate(0, 0) scale(1)'
                : popupOrigin
                  ? `translate(${popupOrigin.x - window.innerWidth / 2}px, ${popupOrigin.y - window.innerHeight / 2}px) scale(0.04)`
                  : 'scale(0.04)',
              opacity: isOpen ? 1 : 0,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              style={{ position: 'absolute', top: '1.5vh', right: '1.5vw', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-4" style={{ marginBottom: '2.5vh' }}>
              <div className="flex items-center justify-center rounded-2xl" style={{ width: '4.5vw', height: '4.5vw', background: detail.color + '15', border: `2px solid ${detail.color}30`, fontSize: '2.2vw' }}>
                {detail.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2vw', fontWeight: 700, color: detail.color, letterSpacing: '-0.02em' }}>
                  {detail.title}
                </h3>
                <p style={{ fontSize: '1.1vw', color: 'var(--dim)', marginTop: '0.3vh', maxWidth: '55vw', lineHeight: 1.5 }}>
                  {detail.what}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              {/* ── Left: How + Items ── */}
              <div style={{ flex: detail.stats && detail.stats.length > 0 ? '1 1 55%' : '1 1 100%' }}>
                <div style={{ marginBottom: '2vh' }}>
                  <p className="mono font-bold" style={{ color: detail.color, fontSize: '1vw', marginBottom: '0.8vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>How it works</p>
                  <p style={{ fontSize: '1vw', color: 'var(--dim)', lineHeight: 1.6, maxWidth: '50vw' }}>{detail.how}</p>
                </div>

                {/* Guards / Steps */}
                {detail.items && detail.items.length > 0 && (
                  <div className="flex flex-col gap-2" style={{ marginTop: '1vh' }}>
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl" style={{
                        padding: '1.2vh 1.2vw',
                        background: item.highlight ? detail.color + '18' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${item.highlight ? detail.color + '35' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                        <span style={{ fontSize: '1.3vw', lineHeight: 1 }}>{item.icon}</span>
                        <div className="flex-1">
                          <p style={{ fontSize: '0.95vw', color: 'var(--fg)', lineHeight: 1.4 }}>{item.label}</p>
                          <p className="mono" style={{ fontSize: '0.85vw', marginTop: '0.3vh', color: item.highlight ? detail.color : 'var(--dim)', fontWeight: item.highlight ? 700 : 400 }}>
                            {item.result}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Code block */}
                {detail.code && (
                  <div className="code-block" style={{ marginTop: '2vh', fontSize: '1vw', padding: '2vh 1.5vw' }}>
                    {detail.code.split('\n').map((line, i) => {
                      const commentIdx = line.indexOf('//')
                      return (
                        <span key={i}>
                          {commentIdx >= 0 ? (
                            <>
                              <span style={{ color: '#e8e8e3' }}>{line.slice(0, commentIdx)}</span>
                              <span style={{ color: '#8a8a82' }}>{line.slice(commentIdx)}</span>
                            </>
                          ) : (
                            <span style={{ color: '#e8e8e3' }}>{line}</span>
                          )}
                          {'\n'}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Right: Stats + Source ── */}
              {detail.stats && detail.stats.length > 0 && (
                <div style={{ flex: '1 1 42%' }}>
                  <p className="mono font-bold" style={{ color: detail.color, fontSize: '1vw', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Key Numbers</p>
                  <div className="grid grid-cols-2 gap-2">
                    {detail.stats.map((stat, i) => (
                      <div key={i} className="rounded-xl" style={{
                        padding: '1.3vh 1vw',
                        background: stat.color + '08',
                        border: `1px solid ${stat.color}20`,
                      }}>
                        <p className="mono font-bold" style={{ fontSize: '1.6vw', color: stat.color, lineHeight: 1.1 }}>{stat.value}</p>
                        <p style={{ fontSize: '0.85vw', color: 'var(--fg)', marginTop: '0.3vh' }}>{stat.label}</p>
                        {stat.sub && <p className="mono" style={{ fontSize: '0.75vw', color: 'var(--dim)', marginTop: '0.2vh' }}>{stat.sub}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Source + Interactions */}
                  <div className="rounded-xl" style={{ marginTop: '1.5vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono" style={{ fontSize: '0.85vw', color: 'var(--dim)' }}>
                      <span style={{ color: '#888' }}>Source: </span>
                      <code style={{ color: detail.color }}>{detail.source}</code>
                    </p>
                  </div>
                  <div className="rounded-xl" style={{ marginTop: '0.8vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono font-bold" style={{ fontSize: '0.85vw', color: detail.color, marginBottom: '0.4vh' }}>Interactions</p>
                    <p style={{ fontSize: '0.85vw', color: 'var(--dim)', lineHeight: 1.5 }}>{detail.interactions}</p>
                  </div>
                </div>
              )}

              {/* If no stats, show source/interactions inline */}
              {(!detail.stats || detail.stats.length === 0) && (
                <div style={{ flex: '0 0 30%' }}>
                  <div className="rounded-xl" style={{ padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono" style={{ fontSize: '0.85vw', color: 'var(--dim)' }}>
                      <span style={{ color: '#888' }}>Source: </span>
                      <code style={{ color: detail.color }}>{detail.source}</code>
                    </p>
                  </div>
                  <div className="rounded-xl" style={{ marginTop: '0.8vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono font-bold" style={{ fontSize: '0.85vw', color: detail.color, marginBottom: '0.4vh' }}>Interactions</p>
                    <p style={{ fontSize: '0.85vw', color: 'var(--dim)', lineHeight: 1.5 }}>{detail.interactions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Slide 15: L4 Session Memory ─────────────────────────────────────────────

function S15_SessionMemory() {
  const sections = [
    { name: 'Session Title', desc: 'What this session is about' },
    { name: 'Current State', desc: 'Status of the work right now' },
    { name: 'Task Spec', desc: 'Current task requirements' },
    { name: 'Files & Functions', desc: 'Key files being worked on' },
    { name: 'Workflow', desc: 'Steps and processes in use' },
    { name: 'Errors & Fixes', desc: 'Problems and resolutions' },
    { name: 'Codebase Docs', desc: 'Patterns and conventions' },
    { name: 'Learnings', desc: 'Insights gained this session' },
    { name: 'Key Results', desc: 'Outputs and measurements' },
    { name: 'Worklog', desc: 'Chronological action log' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-4">
      <p className="slide-h3">Layer 4 — Tried First</p>
      <h2 className="slide-h2">Session Memory: <span style={{ color: '#f59e0b' }}>The Librarian</span></h2>

      <div className="flex gap-6 mt-2" style={{ width: '88vw' }}>
        {/* ── Left: description + stats ── */}
        <div style={{ flex: '1 1 52%' }}>
          <div className="glass-card p-6" style={{ marginBottom: '1.5vh' }}>
            <div className="flex items-start gap-4">
              <div style={{ fontSize: '3.5rem' }}>🧠</div>
              <div>
                <p className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#f59e0b', fontSize: '1.4vw' }}>
                  No LLM call. Uses pre-extracted memories.
                </p>
                <p className="mt-2 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.05vw' }}>
                  A background Fork Agent (<code style={{ color: '#f59e0b' }}>extractMemories()</code>) incrementally builds
                  a structured summary <strong style={{ color: '#f59e0b' }}>after each turn</strong>. When compaction fires, Session Memory just <strong style={{ color: '#f59e0b' }}>swaps in</strong> the
                  already-built <strong style={{ color: '#f59e0b' }}>summary</strong> — no extra API call, completes in <strong style={{ color: '#10b981' }}>&lt;10ms</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Key stat cards */}
          <div className="grid grid-cols-3 gap-2" style={{ marginBottom: '1.5vh' }}>
            {[
              { label: 'Latency', value: '<10ms', sub: 'no LLM call', color: '#10b981' },
              { label: 'Success rate', value: '~70%', sub: 'of compaction attempts', color: '#f59e0b' },
              { label: 'Sections', value: '10', sub: 'fixed structure', color: '#f59e0b' },
              { label: 'Init threshold', value: '10K', sub: 'message tokens', color: '#818cf8' },
              { label: 'Update every', value: '5K + 3', sub: 'token growth + tool calls', color: '#818cf8' },
              { label: 'Max file size', value: '12K', sub: '2K per section', color: '#c084fc' },
            ].map((s, i) => (
              <div key={i} className="cascade-item rounded-xl" style={{
                animationDelay: `${0.3 + i * 0.08}s`,
                padding: '1.2vh 0.8vw',
                background: s.color + '08',
                border: `1px solid ${s.color}20`,
              }}>
                <p className="mono font-bold" style={{ fontSize: '1.6vw', color: s.color, lineHeight: 1.1 }}>{s.value}</p>
                <p style={{ fontSize: '0.95vw', color: 'var(--fg)', marginTop: '0.2vh' }}>{s.label}</p>
                <p className="mono" style={{ fontSize: '0.8vw', color: 'var(--dim)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Trigger condition */}
          <div className="glass-card p-4">
            <p className="mono font-bold mb-2" style={{ color: '#f59e0b', fontSize: '1.05vw' }}>Trigger Condition</p>
            <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '1.05vw' }}>
              <span className="mono px-2.5 py-1 rounded" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>tokens &ge; 5K growth</span>
              <span style={{ color: 'var(--dim)', fontWeight: 700 }}>AND</span>
              <span className="mono px-2.5 py-1 rounded" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>tool calls &ge; 3</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '1.05vw' }}>
              <span style={{ color: '#666', fontWeight: 700 }}>OR</span>
              <span className="mono px-2.5 py-1 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>tokens &ge; 5K</span>
              <span style={{ color: 'var(--dim)', fontWeight: 700 }}>AND</span>
              <span className="mono px-2.5 py-1 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>last turn had no tool calls</span>
            </div>
            <p className="mono mt-2" style={{ color: 'var(--dim)', fontSize: '0.85vw' }}>
              Remote config via GrowthBook <code style={{ color: '#f59e0b' }}>tengu_sm_config</code>
            </p>
          </div>
        </div>

        {/* ── Right: 10 sections with descriptions ── */}
        <div style={{ flex: '1 1 45%' }}>
          <p className="mono font-bold mb-2" style={{ color: '#f59e0b', fontSize: '1.05vw' }}>10 Fixed Sections (max 2K tokens each)</p>
          <div className="flex flex-col gap-2">
            {sections.map((section, i) => (
              <div
                key={i}
                className="cascade-item flex items-center gap-3 px-4 py-2.5 rounded-lg"
                style={{
                  animationDelay: `${0.3 + i * 0.07}s`,
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.12)',
                }}
              >
                <span className="mono font-bold" style={{ color: '#f59e0b', width: '1.5em', fontSize: '1vw' }}>{i + 1}</span>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--fg)', fontSize: '1vw' }}>{section.name}</span>
                  <span className="ml-2" style={{ color: 'var(--dim)', fontSize: '0.95vw' }}>— {section.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2" style={{ color: 'var(--dim)', fontSize: '0.9vw' }}>
            Customizable: <code style={{ color: '#f59e0b' }}>~/.claude/session-memory/config/template.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Compaction Algorithm Animation ──────────────────────────────────────────
// Auto-looping viz for slide 18. Cycles through 4 precomputed scenarios.
// Spec: docs/superpowers/specs/2026-04-10-compaction-algorithm-animation-design.md

type CompRole = 'user' | 'assistant' | 'tool_use' | 'tool_result'

type CompMessage = {
  role: CompRole
  tokens: number          // in K, e.g. 12 = 12K
  textBlock: boolean
  toolId?: string
  label?: string
}

type CompHighlight =
  | { kind: 'idle' }
  | { kind: 'check'; result: 'pass' | 'fail' }
  | { kind: 'expand'; addedIdx: number }
  | { kind: 'reject'; rejectedIdx: number; reason: 'maxTokens' }
  | { kind: 'boundary'; boundaryIdx: number }
  | { kind: 'fixup'; pulledIdx: number; orphanIdx: number; toolLabel: string }
  | { kind: 'return' }

type CompFrame = {
  windowStart: number
  tokens: number     // running total K
  blocks: number     // running text-block count
  highlight: CompHighlight
  narration: string
}

type CompScenario = {
  id: 's1-expand' | 's2-satisfied' | 's3-maxtokens' | 's4-boundary'
  label: string
  lastSummarized: number
  boundaryAfter?: number
  messages: CompMessage[]
  frames: CompFrame[]
}

const COMP_STEP_MS = 1200
const COMP_HOLD_MS = 2600

const COMP_COLORS = {
  user: '#60a5fa',
  assistant: '#818cf8',
  toolUse: '#fb923c',
  toolResult: '#2dd4bf',
  lastSummarized: '#fbbf24',
  window: '#10b981',
  bust: '#ef4444',
  boundary: '#c084fc',
  fixup: '#c084fc',
  dim: '#6b6b66',
} as const

function compRoleColor(role: CompRole): string {
  switch (role) {
    case 'user': return COMP_COLORS.user
    case 'assistant': return COMP_COLORS.assistant
    case 'tool_use': return COMP_COLORS.toolUse
    case 'tool_result': return COMP_COLORS.toolResult
  }
}

function compRoleGlyph(role: CompRole): string {
  switch (role) {
    case 'user': return 'u'
    case 'assistant': return 'a'
    case 'tool_use': return '🔧'
    case 'tool_result': return '📤'
  }
}

const SCENARIOS: CompScenario[] = [
  // ── S1 — Normal expand + API-invariant fixup ────────────────────────────
  {
    id: 's1-expand',
    label: 'normal expand + fixup',
    lastSummarized: 4,
    messages: [
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.8, textBlock: true,  toolId: 'T1+T2' },
      { role: 'tool_result', tokens: 1.0, textBlock: false, toolId: 'T1' },
      { role: 'tool_result', tokens: 12,  textBlock: false, toolId: 'T2' },
      { role: 'assistant',   tokens: 0.5, textBlock: true  },
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T3' },
      { role: 'tool_result', tokens: 0.8, textBlock: false, toolId: 'T3' },
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.5, textBlock: true  },
      { role: 'user',        tokens: 0.3, textBlock: true  },
    ],
    frames: [
      { windowStart: 5, tokens: 2.3,  blocks: 4, highlight: { kind: 'idle' },
        narration: 'init: window = [5..9] · 2.3K tokens · 4 blocks' },
      { windowStart: 5, tokens: 2.3,  blocks: 4, highlight: { kind: 'check', result: 'fail' },
        narration: 'step 3: tokens 2.3K < 10K · blocks 4 < 5 → expand' },
      { windowStart: 4, tokens: 2.8,  blocks: 5, highlight: { kind: 'expand', addedIdx: 4 },
        narration: 'step 4: ← msg 4 · blocks 4→5 ✓' },
      { windowStart: 3, tokens: 14.8, blocks: 5, highlight: { kind: 'expand', addedIdx: 3 },
        narration: 'step 4: ← msg 3 · +12K · tokens ✓ · stop' },
      // fixup detect: window still at 3, but orphan arc + both cards pulsing
      { windowStart: 3, tokens: 14.8, blocks: 5, highlight: { kind: 'fixup', pulledIdx: 1, orphanIdx: 3, toolLabel: 'T2' },
        narration: 'step 6: adjustIndexToPreserveAPIInvariants() · 📤 T2 @3 references 🔧 T2 @1 — outside window' },
      // fixup pull: window slides left to include msg 1 (and 2 as a side effect)
      { windowStart: 1, tokens: 15.6, blocks: 6, highlight: { kind: 'fixup', pulledIdx: 1, orphanIdx: 3, toolLabel: 'T2' },
        narration: 'step 6: pull in msg 1 (assistant w/ 🔧 T2) · window = [1..9]' },
      { windowStart: 1, tokens: 15.6, blocks: 6, highlight: { kind: 'return' },
        narration: 'return: window = [1..9]' },
    ],
  },
  // ── S2 — Already satisfied (no expansion) ───────────────────────────────
  {
    id: 's2-satisfied',
    label: 'already satisfied',
    lastSummarized: 2,
    messages: [
      { role: 'user',      tokens: 0.3, textBlock: true },
      { role: 'assistant', tokens: 0.5, textBlock: true },
      { role: 'user',      tokens: 0.3, textBlock: true },
      { role: 'assistant', tokens: 11,  textBlock: true },
      { role: 'user',      tokens: 0.3, textBlock: true },
      { role: 'assistant', tokens: 0.5, textBlock: true },
      { role: 'user',      tokens: 0.3, textBlock: true },
      { role: 'assistant', tokens: 0.5, textBlock: true },
      { role: 'user',      tokens: 0.3, textBlock: true },
      { role: 'assistant', tokens: 0.5, textBlock: true },
    ],
    frames: [
      { windowStart: 3, tokens: 13.4, blocks: 7, highlight: { kind: 'idle' },
        narration: 'init: window = [3..9] · 13.4K tokens · 7 blocks' },
      { windowStart: 3, tokens: 13.4, blocks: 7, highlight: { kind: 'check', result: 'pass' },
        narration: 'step 3: tokens 13.4K ≥ 10K ✓ · blocks 7 ≥ 5 ✓ → return early' },
      { windowStart: 3, tokens: 13.4, blocks: 7, highlight: { kind: 'return' },
        narration: 'return: window = [3..9] · zero expansion' },
    ],
  },
  // ── S3 — Expand hits maxTokens ──────────────────────────────────────────
  {
    id: 's3-maxtokens',
    label: 'hit maxTokens',
    lastSummarized: 5,
    messages: [
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.5, textBlock: true  },
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T1' },
      { role: 'tool_result', tokens: 25,  textBlock: false, toolId: 'T1' },
      { role: 'assistant',   tokens: 0.5, textBlock: true,  toolId: 'T2' },
      { role: 'tool_result', tokens: 18,  textBlock: false, toolId: 'T2' },
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T3' },
      { role: 'tool_result', tokens: 15,  textBlock: false, toolId: 'T3' },
      { role: 'user',        tokens: 0.3, textBlock: true  },
    ],
    frames: [
      { windowStart: 6, tokens: 16,   blocks: 3, highlight: { kind: 'idle' },
        narration: 'init: window = [6..9] · 16K tokens · 3 blocks' },
      { windowStart: 6, tokens: 16,   blocks: 3, highlight: { kind: 'check', result: 'fail' },
        narration: 'step 3: tokens 16K ≥ 10K ✓ · blocks 3 < 5 → expand' },
      { windowStart: 5, tokens: 34,   blocks: 3, highlight: { kind: 'expand', addedIdx: 5 },
        narration: 'step 4: ← msg 5 · +18K · tokens 34K' },
      { windowStart: 4, tokens: 34.5, blocks: 4, highlight: { kind: 'expand', addedIdx: 4 },
        narration: 'step 4: ← msg 4 · blocks 3→4' },
      { windowStart: 4, tokens: 34.5, blocks: 4, highlight: { kind: 'reject', rejectedIdx: 3, reason: 'maxTokens' },
        narration: 'step 4: ← msg 3 would be 59.5K > 40K · reject · stop' },
      { windowStart: 4, tokens: 34.5, blocks: 4, highlight: { kind: 'return' },
        narration: 'return: window = [4..9] · partial (max cap)' },
    ],
  },
  // ── S4 — Hit CompactBoundary ────────────────────────────────────────────
  {
    id: 's4-boundary',
    label: 'hit CompactBoundary',
    lastSummarized: 6,
    boundaryAfter: 4,
    messages: [
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.5, textBlock: true  },
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.4, textBlock: true  },
      { role: 'assistant',   tokens: 0.4, textBlock: false, toolId: 'T1' },
      { role: 'tool_result', tokens: 4,   textBlock: false, toolId: 'T1' },
      { role: 'assistant',   tokens: 0.4, textBlock: false, toolId: 'T2' },
      { role: 'tool_result', tokens: 2,   textBlock: false, toolId: 'T2' },
      { role: 'user',        tokens: 0.3, textBlock: true  },
      { role: 'assistant',   tokens: 0.5, textBlock: true  },
    ],
    frames: [
      { windowStart: 7, tokens: 2.8, blocks: 2, highlight: { kind: 'idle' },
        narration: 'init: window = [7..9] · 2.8K tokens · 2 blocks' },
      { windowStart: 7, tokens: 2.8, blocks: 2, highlight: { kind: 'check', result: 'fail' },
        narration: 'step 3: tokens 2.8K < 10K · expand' },
      { windowStart: 6, tokens: 3.2, blocks: 2, highlight: { kind: 'expand', addedIdx: 6 },
        narration: 'step 4: ← msg 6 · tool_use only' },
      { windowStart: 5, tokens: 7.2, blocks: 2, highlight: { kind: 'expand', addedIdx: 5 },
        narration: 'step 4: ← msg 5' },
      { windowStart: 5, tokens: 7.2, blocks: 2, highlight: { kind: 'boundary', boundaryIdx: 4 },
        narration: 'step 4: cannot cross CompactBoundary (4↔5) · stop · blocks 2 < 5' },
      { windowStart: 5, tokens: 7.2, blocks: 2, highlight: { kind: 'return' },
        narration: 'return: window = [5..9] · partial (boundary)' },
    ],
  },
]

function CompactionAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [visPaused, setVisPaused] = useState(
    typeof document !== 'undefined' && document.visibilityState !== 'visible'
  )
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const paused = hoverPaused || visPaused

  // Visibility listener
  useEffect(() => {
    const onVis = () => setVisPaused(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Reduced-motion preference listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Frame advance — two modes:
  //  - normal: step through each frame of a scenario, then advance scenario
  //  - reduced motion: skip straight to each scenario's final frame, rotate every 4s
  useEffect(() => {
    if (paused) return

    if (reducedMotion) {
      const scenario = SCENARIOS[scenarioIdx]
      const finalIdx = scenario.frames.length - 1
      if (frameIdx !== finalIdx) {
        setFrameIdx(finalIdx)
        return
      }
      const t = setTimeout(() => {
        setScenarioIdx((s) => (s + 1) % SCENARIOS.length)
        setFrameIdx(0)
        setFadeKey((k) => k + 1)
      }, 4000)
      return () => clearTimeout(t)
    }

    // Normal mode
    const scenario = SCENARIOS[scenarioIdx]
    const isLast = frameIdx === scenario.frames.length - 1
    const delay = isLast ? COMP_HOLD_MS : COMP_STEP_MS
    const t = setTimeout(() => {
      if (isLast) {
        setScenarioIdx((s) => (s + 1) % SCENARIOS.length)
        setFrameIdx(0)
        setFadeKey((k) => k + 1)
      } else {
        setFrameIdx((i) => i + 1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [paused, reducedMotion, scenarioIdx, frameIdx])

  const scenario = SCENARIOS[scenarioIdx]
  const frame = scenario.frames[frameIdx]

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      style={{
        padding: '1.2vh 1.1vw',
        background: '#0c0c14',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.05vh',
      }}
    >
      <style>{`
        @keyframes compFade {
          0% { opacity: 0; transform: translateY(2px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <CompHeader scenarioIdx={scenarioIdx} scenario={scenario} paused={paused} />
      <div
        key={fadeKey}
        style={{
          animation: reducedMotion ? 'none' : 'compFade 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <CompMessageStrip scenario={scenario} frame={frame} reducedMotion={reducedMotion} />
      </div>
      <CompCounters frame={frame} reducedMotion={reducedMotion} />
      <CompNarration text={frame.narration} />
    </div>
  )
}

function CompHeader({
  scenarioIdx,
  scenario,
  paused,
}: {
  scenarioIdx: number
  scenario: CompScenario
  paused: boolean
}) {
  return (
    <div className="flex items-center" style={{ gap: '0.7vw' }}>
      <p className="mono font-bold" style={{ color: '#10b981', fontSize: '1.18vw', margin: 0 }}>
        Compaction Algorithm
      </p>
      <span className="mono" style={{ fontSize: '0.9vw', color: COMP_COLORS.dim }}>
        (animated)
      </span>
      <div className="flex items-center" style={{ gap: '0.45vw', marginLeft: 'auto' }}>
        <span className="mono" style={{ fontSize: '0.9vw', color: COMP_COLORS.dim }}>
          scenario {scenarioIdx + 1}/{SCENARIOS.length} · {scenario.label}
        </span>
        <div className="flex items-center" style={{ gap: '0.3vw' }}>
          {SCENARIOS.map((_, i) => (
            <span
              key={i}
              style={{
                width: '0.55vw',
                height: '0.55vw',
                borderRadius: '50%',
                background: i === scenarioIdx ? COMP_COLORS.window : 'rgba(255,255,255,0.18)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>
        <span className="mono" style={{ fontSize: '0.9vw', color: COMP_COLORS.dim, minWidth: '1vw', textAlign: 'center' }}>
          {paused ? '⏸' : '⏵'}
        </span>
      </div>
    </div>
  )
}

function CompMessageStrip({
  scenario,
  frame,
  reducedMotion,
}: {
  scenario: CompScenario
  frame: CompFrame
  reducedMotion: boolean
}) {
  const startIdx = scenario.lastSummarized + 1

  return (
    <div style={{ position: 'relative', padding: '1.8vh 0 1.4vh 0' }}>
      {/* lastSummarized caret + label */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${(startIdx - 0.5) * 10}%`,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.15vh',
        }}
      >
        <span className="mono" style={{ fontSize: '0.78vw', color: COMP_COLORS.lastSummarized, whiteSpace: 'nowrap' }}>
          lastSummarized
        </span>
        <span style={{ fontSize: '0.9vw', color: COMP_COLORS.lastSummarized, lineHeight: 1 }}>▼</span>
      </div>

      {/* Message cards row */}
      <div className="flex" style={{ gap: '0.3vw', width: '100%' }}>
        {scenario.messages.map((msg, i) => {
          const inWindow = i >= frame.windowStart
          const color = compRoleColor(msg.role)
          const isRejected = frame.highlight.kind === 'reject' && frame.highlight.rejectedIdx === i
          const isJustAdded = frame.highlight.kind === 'expand' && frame.highlight.addedIdx === i
          const isFixupPull = frame.highlight.kind === 'fixup' && frame.highlight.pulledIdx === i
          const isFixupOrphan = frame.highlight.kind === 'fixup' && frame.highlight.orphanIdx === i

          let pulseBorder = inWindow ? color : 'rgba(255,255,255,0.08)'
          let pulseBg = inWindow ? `${color}22` : 'rgba(255,255,255,0.02)'
          let boxShadow: string | undefined
          if (isRejected) {
            pulseBorder = COMP_COLORS.bust
            pulseBg = `${COMP_COLORS.bust}33`
            boxShadow = `0 0 10px ${COMP_COLORS.bust}99`
          } else if (isJustAdded) {
            boxShadow = `0 0 8px ${COMP_COLORS.window}aa`
          } else if (isFixupPull || isFixupOrphan) {
            pulseBorder = COMP_COLORS.fixup
            pulseBg = `${COMP_COLORS.fixup}33`
            boxShadow = `0 0 14px ${COMP_COLORS.fixup}cc, 0 0 4px ${COMP_COLORS.fixup}ff`
          }

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center mono"
              style={{
                flex: 1,
                height: '4.8vh',
                borderRadius: 5,
                border: `1px solid ${pulseBorder}`,
                background: pulseBg,
                color: isRejected ? COMP_COLORS.bust : (isFixupPull || isFixupOrphan) ? COMP_COLORS.fixup : inWindow ? color : 'rgba(255,255,255,0.25)',
                fontSize: '1.02vw',
                transition: reducedMotion ? 'none' : 'all 300ms ease',
                position: 'relative',
                boxShadow,
                transform: !reducedMotion && (isRejected || isJustAdded || isFixupPull || isFixupOrphan) ? 'scale(1.12)' : 'scale(1)',
                zIndex: (isFixupPull || isFixupOrphan) ? 2 : 1,
              }}
            >
              <span style={{ lineHeight: 1 }}>{compRoleGlyph(msg.role)}</span>
              <span style={{ fontSize: '0.66vw', opacity: 0.7, lineHeight: 1, marginTop: '0.25vh' }}>{i}</span>
            </div>
          )
        })}
      </div>

      {/* API-invariants fixup overlay — arc from orphan 📤 back to pulled 🔧 */}
      {frame.highlight.kind === 'fixup' && (() => {
        const { orphanIdx, pulledIdx } = frame.highlight
        // Each card spans 10% of strip width; center of card N is at (N + 0.5) * 10%.
        const orphanPct = (orphanIdx + 0.5) * 10
        const pulledPct = (pulledIdx + 0.5) * 10
        // SVG viewBox: 100 wide, 30 tall. Arc peaks near y=14 to stay below lastSummarized.
        const d = `M ${orphanPct} 27 C ${orphanPct} 14, ${pulledPct} 14, ${pulledPct} 27`
        return (
          <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: '1.8vh',
              left: 0,
              width: '100%',
              height: '5.2vh',
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 3,
            }}
          >
            <defs>
              <marker
                id="compFixupArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COMP_COLORS.fixup} />
              </marker>
            </defs>
            <path
              d={d}
              fill="none"
              stroke={COMP_COLORS.fixup}
              strokeWidth="0.6"
              strokeDasharray="1.2 0.8"
              markerEnd="url(#compFixupArrow)"
              opacity={0.95}
              style={{
                filter: `drop-shadow(0 0 3px ${COMP_COLORS.fixup})`,
              }}
            />
          </svg>
        )
      })()}

      {/* CompactBoundary dashed line (only if scenario defines boundaryAfter) */}
      {scenario.boundaryAfter !== undefined && (() => {
        const isPulsing = frame.highlight.kind === 'boundary' && frame.highlight.boundaryIdx === scenario.boundaryAfter
        return (
          <div
            style={{
              position: 'absolute',
              top: '1.8vh',
              bottom: '1.4vh',
              left: `${(scenario.boundaryAfter + 1) * 10}%`,
              width: 0,
              borderLeft: `${isPulsing ? 4 : 2}px dashed ${COMP_COLORS.boundary}`,
              transform: 'translateX(-50%)',
              boxShadow: isPulsing ? `0 0 14px ${COMP_COLORS.boundary}` : undefined,
              transition: 'border-left-width 200ms ease, box-shadow 300ms ease',
            }}
          />
        )
      })()}

      {/* Fixup label — shown below cards during fixup frames to avoid the lastSummarized caret */}
      {frame.highlight.kind === 'fixup' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '0.6vh',
            marginBottom: '0.2vh',
            pointerEvents: 'none',
          }}
        >
          <span
            className="mono"
            style={{
              padding: '0.35vh 0.7vw',
              background: `${COMP_COLORS.fixup}22`,
              border: `1px solid ${COMP_COLORS.fixup}`,
              borderRadius: 4,
              fontSize: '0.82vw',
              color: COMP_COLORS.fixup,
              whiteSpace: 'nowrap',
              fontWeight: 600,
              boxShadow: `0 0 10px ${COMP_COLORS.fixup}66`,
            }}
          >
            tool_use ↔ tool_result · {frame.highlight.toolLabel}
          </span>
        </div>
      )}

      {/* Kept window bracket */}
      {(() => {
        const isFixupFrame = frame.highlight.kind === 'fixup'
        const bracketColor = isFixupFrame ? COMP_COLORS.fixup : COMP_COLORS.window
        return (
          <div
            style={{
              position: 'relative',
              height: '1.6vh',
              marginTop: '0.4vh',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${frame.windowStart * 10}%`,
                width: `${(10 - frame.windowStart) * 10}%`,
                height: '100%',
                borderLeft: `${isFixupFrame ? 3 : 2}px solid ${bracketColor}`,
                borderRight: `${isFixupFrame ? 3 : 2}px solid ${bracketColor}`,
                borderBottom: `${isFixupFrame ? 3 : 2}px solid ${bracketColor}`,
                borderTopWidth: 0,
                borderRadius: '0 0 4px 4px',
                boxShadow: isFixupFrame ? `0 0 10px ${COMP_COLORS.fixup}aa` : undefined,
                transition: reducedMotion
                  ? 'none'
                  : 'left 400ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1), border-color 300ms ease, box-shadow 300ms ease',
              }}
            />
            <span
              className="mono"
              style={{
                position: 'absolute',
                left: `${frame.windowStart * 10 + (10 - frame.windowStart) * 5}%`,
                transform: 'translateX(-50%)',
                top: '1.4vh',
                fontSize: '0.78vw',
                color: bracketColor,
                whiteSpace: 'nowrap',
                transition: reducedMotion ? 'none' : 'left 400ms cubic-bezier(0.16,1,0.3,1), color 300ms ease',
              }}
            >
              {isFixupFrame ? 'API invariants fix-up' : 'kept window'}
            </span>
          </div>
        )
      })()}
    </div>
  )
}

function CompCounters({ frame, reducedMotion }: { frame: CompFrame; reducedMotion: boolean }) {
  const isReject = frame.highlight.kind === 'reject'
  // During a reject frame, visually show the would-be overflow (100% red).
  const tokensPct = isReject ? 100 : Math.min(100, (frame.tokens / 40) * 100)
  const tokensColor = isReject || frame.tokens > 40 ? COMP_COLORS.bust : COMP_COLORS.window

  return (
    <div className="flex flex-col" style={{ gap: '0.7vh', marginTop: '1.9vh' }}>
      {/* tokens bar */}
      <div className="flex items-center" style={{ gap: '0.75vw' }}>
        <span className="mono" style={{ fontSize: '0.9vw', color: COMP_COLORS.dim, width: '3.6vw' }}>tokens</span>
        <div
          style={{
            flex: 1,
            height: '1.25vh',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${tokensPct}%`,
              height: '100%',
              background: tokensColor,
              transition: reducedMotion
                ? 'none'
                : 'width 400ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: '0.9vw', color: tokensColor, minWidth: '6vw', textAlign: 'right' }}>
          {frame.tokens.toFixed(1)}K / 40K
        </span>
      </div>
      {/* blocks pips */}
      <div className="flex items-center" style={{ gap: '0.75vw' }}>
        <span className="mono" style={{ fontSize: '0.9vw', color: COMP_COLORS.dim, width: '3.6vw' }}>blocks</span>
        <div className="flex" style={{ gap: '0.38vw', flex: 1 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const lit = i < frame.blocks
            return (
              <span
                key={i}
                style={{
                  width: '1vw',
                  height: '1vw',
                  borderRadius: '50%',
                  background: lit ? COMP_COLORS.window : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${lit ? COMP_COLORS.window : 'rgba(255,255,255,0.15)'}`,
                  transition: 'background 300ms ease',
                }}
              />
            )
          })}
        </div>
        <span className="mono" style={{ fontSize: '0.9vw', color: frame.blocks >= 5 ? COMP_COLORS.window : COMP_COLORS.dim, minWidth: '6vw', textAlign: 'right' }}>
          {frame.blocks} / 5 {frame.blocks >= 5 ? '✓' : ''}
        </span>
      </div>
    </div>
  )
}

function CompNarration({ text }: { text: string }) {
  return (
    <div
      className="mono"
      style={{
        fontSize: '0.94vw',
        color: '#d1d5db',
        minHeight: '1.7vh',
        padding: '0.65vh 0.5vw',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '0.55vh',
      }}
    >
      ▸ {text}
    </div>
  )
}

// ─── Slide 15b: Session Memory — Under the Hood ─────────────────────────────

function S15b_SessionMemoryDeep() {
  return (
    <div className="reveal-stagger flex flex-col items-center" style={{ gap: '0.6vh', maxHeight: '100vh', paddingTop: '1vh', paddingBottom: '3vh' }}>
      <p className="slide-h3" style={{ fontSize: '1.5vw' }}>Layer 4 — Under the Hood</p>
      <h2 className="slide-h2" style={{ fontSize: '2.3vw', margin: 0 }}>Session vs Persistent <span style={{ color: '#f59e0b' }}>Memory</span> and Session Compact Algorithm</h2>

      <div className="flex gap-5" style={{ width: '92vw', marginTop: '0.5vh' }}>
        {/* ── Left: Comparison table ── */}
        <div style={{ flex: '1 1 48%' }}>
          <p className="mono font-bold mb-1" style={{ color: '#c084fc', fontSize: '1.4vw' }}>Key Differences</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex-1 mono font-bold" style={{ color: '#666', width: '28%', padding: '0.85vh 0.9vw', fontSize: '0.98vw' }}>Dimension</div>
              <div className="flex-1 mono font-bold" style={{ color: '#f59e0b', padding: '0.85vh 0.9vw', fontSize: '0.98vw' }}>Session Memory</div>
              <div className="flex-1 mono font-bold" style={{ color: '#c084fc', padding: '0.85vh 0.9vw', fontSize: '0.98vw' }}>Persistent Memory</div>
            </div>
            {[
              { dim: 'Lifecycle', session: 'Current session only', persistent: 'Permanent across sessions' },
              { dim: 'File count', session: '1 file', persistent: 'Multiple .md files' },
              { dim: 'Trigger', session: 'Post-sampling hook (thresholds)', persistent: 'Stop Hook (end of query round)' },
              { dim: 'Primary purpose', session: 'Serves context compression', persistent: 'Cross-session knowledge' },
              { dim: 'Extractor tools', session: 'Fork Agent (FileEdit only)', persistent: 'Fork Agent (Read/Write/Edit/Grep)' },
              { dim: 'Format', session: '10 fixed sections', persistent: 'Free-form + YAML frontmatter' },
            ].map((row, i) => (
              <div key={i} className="cascade-item flex" style={{
                animationDelay: `${0.3 + i * 0.08}s`,
                background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div className="flex-1 font-semibold" style={{ color: 'var(--fg)', width: '28%', fontSize: '1vw', padding: '0.7vh 0.9vw' }}>{row.dim}</div>
                <div className="flex-1" style={{ color: 'var(--dim)', fontSize: '1vw', padding: '0.7vh 0.9vw' }}>{row.session}</div>
                <div className="flex-1" style={{ color: 'var(--dim)', fontSize: '1vw', padding: '0.7vh 0.9vw' }}>{row.persistent}</div>
              </div>
            ))}
          </div>

          {/* Tuning Constants & API Invariants — supports the right-side pipeline */}
          <div
            className="cascade-item glass-card"
            style={{
              animationDelay: '1.05s',
              borderColor: 'rgba(192,132,252,0.18)',
              padding: '1.75vh 1.3vw',
              marginTop: '1.8vh',
            }}
          >
            <p className="mono font-bold mb-2" style={{ color: '#c084fc', fontSize: '1.22vw' }}>
              Tuning Constants &amp; Invariants <span style={{ color: '#6b6b66', fontWeight: 400, fontSize: '0.88vw' }}>(remotely configured via GrowthBook and dynamically adjusted)</span>
            </p>

            {/* Constants row */}
            <div className="flex" style={{ gap: '0.52vw', marginBottom: '1.4vh' }}>
              {[
                { name: 'minTokens', value: '10K', desc: 'lower bound for kept window', color: '#fbbf24' },
                { name: 'maxTokens', value: '40K', desc: 'hard cap — never exceed', color: '#ef4444' },
                { name: 'minTextBlocks', value: '5', desc: 'min text-bearing messages', color: '#10b981' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex-1 rounded-lg"
                  style={{
                    padding: '0.95vh 0.8vw',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-baseline" style={{ gap: '0.48vw' }}>
                    <span className="mono font-bold" style={{ fontSize: '1.28vw', color: c.color }}>{c.value}</span>
                    <span className="mono" style={{ fontSize: '0.83vw', color: 'var(--dim)' }}>{c.name}</span>
                  </div>
                  <p className="mono" style={{ fontSize: '0.76vw', color: '#6b6b66', marginTop: '0.4vh', lineHeight: 1.35 }}>
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* API invariants — what step 5 of the pipeline must preserve */}
            <p className="mono" style={{ fontSize: '0.93vw', color: '#c084fc', marginBottom: '0.7vh' }}>
              <span style={{ color: '#6b6b66' }}>after expand:</span> adjustIndexToPreserveAPIInvariants() <span style={{ color: '#6b6b66', fontWeight: 400 }}>(more on slide 30)</span>
            </p>
            <div className="flex flex-col" style={{ gap: '0.62vh' }}>
              <div
                className="rounded flex items-start"
                style={{
                  padding: '0.78vh 0.85vw',
                  gap: '0.65vw',
                  background: 'rgba(192,132,252,0.05)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              >
                <span className="mono" style={{ fontSize: '1.05vw', color: '#c084fc', lineHeight: 1.3 }}>🔗</span>
                <div className="flex-1">
                  <span className="mono font-bold" style={{ fontSize: '0.9vw', color: '#c084fc' }}>
                    tool_use ↔ tool_result pairing
                  </span>
                  <p className="mono" style={{ fontSize: '0.78vw', color: 'var(--dim)', lineHeight: 1.4, marginTop: '0.22vh' }}>
                    pull earlier assistant msgs in so orphaned tool_results don&apos;t reference a missing tool_use
                  </p>
                </div>
              </div>
              <div
                className="rounded flex items-start"
                style={{
                  padding: '0.78vh 0.85vw',
                  gap: '0.65vw',
                  background: 'rgba(192,132,252,0.05)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              >
                <span className="mono" style={{ fontSize: '1.05vw', color: '#c084fc', lineHeight: 1.3 }}>🧠</span>
                <div className="flex-1">
                  <span className="mono font-bold" style={{ fontSize: '0.9vw', color: '#c084fc' }}>
                    thinking-block grouping
                  </span>
                  <p className="mono" style={{ fontSize: '0.78vw', color: 'var(--dim)', lineHeight: 1.4, marginTop: '0.22vh' }}>
                    messages sharing the same <span style={{ color: '#fbbf24' }}>message.id</span> stay together — normalizeMessagesForAPI would otherwise drop thinking blocks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Template + Compaction algorithm ── */}
        <div style={{ flex: '1 1 48%' }}>
          <p className="mono font-bold mb-1" style={{ color: '#f59e0b', fontSize: '1.1vw' }}>Real Template Format</p>
          <div
            style={{
              fontSize: '0.95vw',
              padding: '1.4vh 1.15vw',
              background: '#0c0c14',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
              lineHeight: 1.45,
              color: 'var(--fg)',
            }}
          >
            {/* H1 */}
            <div
              style={{
                fontSize: '1.28vw',
                fontWeight: 700,
                color: '#e8e8e3',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                paddingBottom: '0.4vh',
                marginBottom: '0.65vh',
              }}
            >
              Session Memory
            </div>

            {[
              { h: 'Session Title', p: 'Brief description of what this session is about' },
              { h: 'Current State', p: 'What is the current status of the work' },
              { h: 'Task specification', p: 'Detailed description of current task requirements' },
              { h: 'Files and Functions', p: 'Key files and functions being worked on' },
              { h: 'Workflow', p: 'Steps being followed or processes in use' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: '0.55vh' }}>
                <div
                  style={{
                    fontSize: '1.04vw',
                    fontWeight: 600,
                    color: '#818cf8',
                    marginBottom: '0.12vh',
                  }}
                >
                  {s.h}
                </div>
                <div style={{ fontStyle: 'italic', color: '#8a8a86', fontSize: '0.88vw' }}>{s.p}</div>
              </div>
            ))}

            <div style={{ color: '#6b6b66', fontStyle: 'italic', marginTop: '0.4vh', fontSize: '0.88vw' }}>
              … + Errors, Docs, Learnings, Results, Worklog
            </div>
          </div>

          <div style={{ marginTop: '1.6vh' }}>
            <CompactionAnimation />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 16: L4 What Survives ──────────────────────────────────────────────

function S16_WhatSurvives() {
  const msgs = [
    { role: 'user', text: 'Please fix the login bug...', tokens: '245' },
    { role: 'assistant', text: 'I\'ll look at the auth code...', tokens: '1,847' },
    { role: 'tool', text: 'Read: src/auth.ts (847 lines)', tokens: '12,340' },
    { role: 'assistant', text: 'The issue is in validateToken...', tokens: '2,156' },
    { role: 'tool', text: 'Edit: src/auth.ts', tokens: '890' },
    { role: 'user', text: 'Also check the session handler', tokens: '156' },
    { role: 'tool', text: 'Read: src/session.ts (1200 lines)', tokens: '18,230' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-5">
      <p className="slide-h3">Layer 4 — What Survives</p>
      <h2 className="slide-h2" style={{ fontSize: '3vw' }}>Old messages <span style={{ color: '#ef4444' }}>removed</span>, then <span style={{ color: '#10b981' }}>replaced</span></h2>

      <div className="flex gap-6 mt-3" style={{ width: '88vw' }}>
        {/* ── Left: messages that appear then get struck through ── */}
        <div className="flex-1">
          <p className="mono font-bold mb-3" style={{ color: '#ef4444', fontSize: '1.2vw' }}>🗑️ Removed (old messages)</p>
          <div className="flex flex-col gap-2">
            {msgs.map((msg, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg msg-appear-then-strike"
                style={{
                  padding: '1.3vh 1.1vw',
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  animationDelay: `${0.2 + i * 0.15}s`,
                }}
              >
                <span className="mono rounded" style={{ padding: '0.2vh 0.55vw', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '1vw' }}>{msg.role}</span>
                <span className="truncate" style={{ color: 'var(--dim)', fontSize: '1.15vw' }}>{msg.text}</span>
                <span className="ml-auto mono" style={{ color: '#f87171', fontSize: '0.95vw' }}>{msg.tokens}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Arrow ── */}
        <div className="flex items-center">
          <div className="cascade-item" style={{ animationDelay: '1.6s' }}>
            <svg width="50" height="50" viewBox="0 0 50 50">
              <path d="M8 25 L38 25 M30 16 L40 25 L30 34" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* ── Right: replacement cards slide in after strikethrough ── */}
        <div className="flex-1">
          <p className="mono font-bold mb-3" style={{ color: '#10b981', fontSize: '1.2vw' }}>✅ Replaced with (summary + recent)</p>
          <div className="flex flex-col gap-3">
            <div className="cascade-item rounded-xl" style={{ padding: '1.8vh 1.4vw', animationDelay: '1.8s', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <p className="mono font-bold" style={{ color: '#f59e0b', fontSize: '1.2vw' }}>📋 Memory Summary</p>
              <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.1vw' }}>Compact boundary + extracted session memory covering all dropped turns</p>
            </div>
            <div className="cascade-item rounded-xl" style={{ padding: '1.8vh 1.4vw', animationDelay: '2.1s', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p className="mono font-bold" style={{ color: '#10b981', fontSize: '1.2vw' }}>💬 Recent Messages (kept)</p>
              <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.1vw' }}>Last 5+ text messages, 10-40K tokens of recent context preserved</p>
            </div>
            <div className="cascade-item rounded-xl" style={{ padding: '1.8vh 1.4vw', animationDelay: '2.4s', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.25)' }}>
              <p className="mono font-bold" style={{ color: '#818cf8', fontSize: '1.2vw' }}>📎 Reinjected Attachments</p>
              <p className="mt-1 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.1vw' }}>Top 5 recently-read files, plan file, MCP/skill deltas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 17: The Memory System ─────────────────────────────────────────────

function S17_MemorySystem() {
  // Tiers ordered bottom-to-top (session → persistent → team)
  const tiers = [
    {
      name: 'Session Memory', scope: 'Current session only', icon: '🧠', color: '#f59e0b',
      trigger: 'Post-sampling hook (thresholds)', storage: 'Single file under session dir', latency: '<10ms',
      detail: '10 fixed sections, 2K tokens each, 12K max. Updated after 5K token growth + 3 tool calls.',
    },
    {
      name: 'Persistent Memory', scope: 'Cross-session, per-project', icon: '💾', color: '#c084fc',
      trigger: 'Stop Hook (end of query round)', storage: '~/.claude/projects/<id>/memory/', latency: '~50ms',
      detail: 'MEMORY.md index (max 200 lines / 25KB). Each entry → standalone .md with YAML frontmatter.',
    },
    {
      name: 'Team Memory', scope: 'Cross-user, per-repo', icon: '👥', color: '#818cf8',
      trigger: 'File watcher (2s debounce)', storage: 'REST API + local mirror', latency: '~200ms',
      detail: 'Pull: GET+ETag → validate → parallel write. Push: SHA-256 delta → bin-pack ≤200KB → optimistic lock.',
    },
  ] as const

  const memTypes = [
    { type: 'user', desc: 'Role, goals, knowledge', color: '#3b82f6', scope: 'private' },
    { type: 'feedback', desc: 'Corrections & confirmed approaches', color: '#10b981', scope: 'private' },
    { type: 'project', desc: 'Work progress, goals, deadlines', color: '#f59e0b', scope: 'team-biased' },
    { type: 'reference', desc: 'Pointers to external systems', color: '#818cf8', scope: 'team' },
  ] as const

  return (
    <div className="flex flex-col items-center" style={{ gap: '0.8vh' }}>
      <div className="reveal-stagger flex flex-col items-center" style={{ gap: '0.2vh' }}>
        <p className="slide-h3" style={{ color: '#c084fc' }}>Beyond Compression</p>
        <h2 className="slide-h2">The <span style={{ color: '#c084fc' }}>Memory</span> System</h2>
      </div>

      {/* ═══ Architecture Diagram — tiers rendered top-to-bottom (Team → Session) ═══ */}
      <div className="flex" style={{ width: '92vw', gap: '1.2vw' }}>

        {/* ── LEFT: Stacked tier diagram (the hero) ── */}
        <div className="flex flex-col items-center" style={{ flex: '1 1 60%', gap: 0 }}>
          {/* Render reversed: Team on top, Session at bottom */}
          {[...tiers].reverse().map((t, i) => {
            const ri = tiers.length - 1 - i
            const delay = 0.3 + ri * 0.55 // Session first, Team last

            return (
              <div key={t.name} className="flex flex-col items-center w-full">
                {/* Flow connector — animated dashed pipe between tiers */}
                {i > 0 && (
                  <div className="flex items-center justify-center" style={{ height: '3.2vh', position: 'relative', width: '100%' }}>
                    <div
                      className="mem-flow-connector cascade-item"
                      style={{
                        height: '100%',
                        animationDelay: `${delay - 0.2}s`,
                        ['--flow-from' as string]: [...tiers].reverse()[i - 1].color,
                        ['--flow-to' as string]: t.color,
                      }}
                    />
                    {/* Flow direction label */}
                    <span
                      className="cascade-item mono absolute"
                      style={{
                        animationDelay: `${delay}s`,
                        right: '2vw',
                        fontSize: '0.7vw',
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {i === 1 ? '▲ shared across users' : '▲ persists across sessions'}
                    </span>
                  </div>
                )}

                {/* Tier card — pyramid: Team widest, Session narrowest */}
                <div
                  className="mem-tier mem-tier-card rounded-xl"
                  style={{
                    animationDelay: `${delay}s`,
                    width: `${100 - i * 15}%`,
                    padding: '1.6vh 1.5vw',
                    background: `linear-gradient(135deg, ${t.color}0c 0%, ${t.color}03 100%)`,
                    border: `1.5px solid ${t.color}28`,
                    borderLeft: `4px solid ${t.color}`,
                    ['--tier-color' as string]: `${t.color}50`,
                    ['--tier-glow' as string]: `${t.color}18`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span style={{ fontSize: '1.6vw' }}>{t.icon}</span>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: t.color, fontSize: '1.3vw', letterSpacing: '-0.01em' }}>
                      {t.name}
                    </span>
                    <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.8vw', marginLeft: '0.3vw' }}>
                      {t.scope}
                    </span>
                    <span className="mono ml-auto px-2 py-0.5 rounded-full" style={{ fontSize: '0.72vw', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                      {t.latency}
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="mono rounded-lg flex-1" style={{ padding: '0.6vh 0.8vw', background: t.color + '0a', border: `1px solid ${t.color}20`, fontSize: '0.78vw' }}>
                      <span style={{ color: '#555' }}>Trigger </span><span style={{ color: t.color }}>{t.trigger}</span>
                    </div>
                    <div className="mono rounded-lg flex-1" style={{ padding: '0.6vh 0.8vw', background: t.color + '0a', border: `1px solid ${t.color}20`, fontSize: '0.78vw' }}>
                      <span style={{ color: '#555' }}>Storage </span><span style={{ color: t.color }}>{t.storage}</span>
                    </div>
                  </div>

                  <p className="mt-1.5" style={{ color: 'var(--dim)', fontSize: '0.82vw', lineHeight: 1.45 }}>
                    {t.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── RIGHT: Persistent Memory types + system mechanics ── */}
        <div className="flex flex-col" style={{ flex: '1 1 38%', gap: '1vh' }}>
          {/* 4 memory types */}
          <div>
            <p className="cascade-item mono font-bold mb-2" style={{ animationDelay: '1.6s', color: '#c084fc', fontSize: '0.9vw', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Persistent Memory — 4 Types
            </p>
            <div className="flex flex-col gap-1.5">
              {memTypes.map((m, i) => (
                <div
                  key={m.type}
                  className="cascade-item mem-type-badge flex items-center gap-2.5 rounded-xl"
                  style={{
                    animationDelay: `${1.7 + i * 0.12}s`,
                    padding: '0.9vh 1vw',
                    background: m.color + '08',
                    border: `1px solid ${m.color}22`,
                    ['--badge-glow' as string]: `${m.color}35`,
                    cursor: 'default',
                  }}
                >
                  <span className="mono font-bold rounded-lg" style={{
                    padding: '0.25vh 0.55vw',
                    background: m.color + '20',
                    color: m.color,
                    fontSize: '0.85vw',
                    border: `1px solid ${m.color}35`,
                    minWidth: '5vw',
                    textAlign: 'center',
                  }}>{m.type}</span>
                  <div className="flex-1">
                    <p style={{ color: 'var(--fg)', fontSize: '0.88vw', lineHeight: 1.25 }}>{m.desc}</p>
                    <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.7vw' }}>{m.scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System mechanics cards */}
          <div className="cascade-item rounded-xl" style={{
            animationDelay: '2.3s',
            padding: '1.1vh 1vw',
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.18)',
            borderLeft: '3px solid rgba(16,185,129,0.5)',
          }}>
            <p className="mono font-bold" style={{ color: '#10b981', fontSize: '0.85vw', marginBottom: '0.3vh' }}>Auto-Extraction</p>
            <p style={{ color: 'var(--dim)', fontSize: '0.78vw', lineHeight: 1.45 }}>
              Fire-and-forget fork agent. Max <strong style={{ color: 'var(--fg)' }}>5 turns</strong>, read-only Bash, writes confined to memory dir. Skips if user manually saved.
            </p>
          </div>

          <div className="cascade-item rounded-xl" style={{
            animationDelay: '2.45s',
            padding: '1.1vh 1vw',
            background: 'rgba(192,132,252,0.05)',
            border: '1px solid rgba(192,132,252,0.18)',
            borderLeft: '3px solid rgba(192,132,252,0.5)',
          }}>
            <p className="mono font-bold" style={{ color: '#c084fc', fontSize: '0.85vw', marginBottom: '0.3vh' }}>MEMORY.md Index</p>
            <p style={{ color: 'var(--dim)', fontSize: '0.78vw', lineHeight: 1.45 }}>
              Index, not storage. Max <strong style={{ color: 'var(--fg)' }}>200 lines / 25KB</strong>. Each entry → .md with YAML frontmatter. 6 exclusion categories: code patterns, git history, debug recipes, CLAUDE.md content, temp tasks, activity summaries.
            </p>
          </div>

          <div className="cascade-item rounded-xl" style={{
            animationDelay: '2.6s',
            padding: '1.1vh 1vw',
            background: 'rgba(129,140,248,0.05)',
            border: '1px solid rgba(129,140,248,0.18)',
            borderLeft: '3px solid rgba(129,140,248,0.5)',
          }}>
            <p className="mono font-bold" style={{ color: '#818cf8', fontSize: '0.85vw', marginBottom: '0.3vh' }}>AI-Driven Recall</p>
            <p style={{ color: 'var(--dim)', fontSize: '0.78vw', lineHeight: 1.45 }}>
              Sonnet scans frontmatter (max <strong style={{ color: 'var(--fg)' }}>200 files</strong>) → selects <strong style={{ color: 'var(--fg)' }}>5</strong> relevant. Freshness as <em>&quot;X days ago&quot;</em>. Verifies paths before recommending.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 18: L3 Full Compact ───────────────────────────────────────────────

// Precise template for each of the 9 summary sections — shown on hover
const SUMMARY_TEMPLATE: { num: string; label: string; title: string; body: string }[] = [
  {
    num: '1',
    label: '1. Primary Request & Intent',
    title: 'Primary Request and Intent',
    body: '[Detailed description of all user requests and intents]',
  },
  {
    num: '2',
    label: '2. Key Technical Concepts',
    title: 'Key Technical Concepts',
    body: '- [Concept 1]\n- [Concept 2]',
  },
  {
    num: '3',
    label: '3. Files & Code Sections',
    title: 'Files and Code Sections',
    body: '- [Filename 1]\n    - [Why this file matters]\n    - [Code snippet]\n- [Filename 2]\n    - [Code snippet]',
  },
  {
    num: '4',
    label: '4. Errors and Fixes',
    title: 'Errors and fixes',
    body: '- [Error description]:\n    - [How it was fixed]\n    - [User feedback]',
  },
  {
    num: '5',
    label: '5. Problem Solving',
    title: 'Problem Solving',
    body: '[Problem-solving process]',
  },
  {
    num: '6',
    label: '6. All User Messages',
    title: 'All user messages',
    body: '- [List every non-tool-result user message]',
  },
  {
    num: '7',
    label: '7. Pending Tasks',
    title: 'Pending Tasks',
    body: '- [Task 1]\n- [Task 2]',
  },
  {
    num: '8',
    label: '8. Current Work',
    title: 'Current Work',
    body: '[Precise description of current work, including filenames and code snippets]',
  },
  {
    num: '9',
    label: '9. Next Step',
    title: 'Optional Next Step',
    body: '[Next step plan, with direct references to recent conversation]',
  },
]

function S17_FullCompact() {
  const inputMsgs = [
    { role: 'user', text: 'Fix the auth bug in login.ts', color: '#3b82f6' },
    { role: 'assistant', text: 'I\'ll read the auth module...', color: '#818cf8' },
    { role: 'tool', text: 'Read: src/auth/login.ts (800 lines)', color: '#f59e0b' },
    { role: 'assistant', text: 'Found the issue in validateJWT', color: '#818cf8' },
    { role: 'tool', text: 'Edit: src/auth/login.ts', color: '#f59e0b' },
    { role: 'user', text: 'Now add rate limiting to /api', color: '#3b82f6' },
    { role: 'tool', text: 'Read: src/routes/api.ts (380 lines)', color: '#f59e0b' },
  ]

  const [hoveredSection, setHoveredSection] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  const handleSectionEnter = useCallback((idx: number, e: React.MouseEvent<HTMLParagraphElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverPos({ x: rect.left, y: rect.top + rect.height / 2 })
    setHoveredSection(idx)
  }, [])

  const handleSectionLeave = useCallback(() => {
    setHoveredSection(null)
  }, [])

  return (
    <div className="flex flex-col items-center w-full h-full" style={{ gap: '1vh' }}>
      <div className="reveal-stagger flex flex-col items-center gap-1 pt-2">
        <p className="slide-h3">Layer 3 — Fallback</p>
        <h2 className="slide-h2" style={{ fontSize: '3vw' }}>Full Compact: <span style={{ color: '#d97706' }}>The Author</span></h2>
      </div>

      <div className="flex items-center flex-1 w-full" style={{ padding: '0 3vw', gap: '1vw' }}>
        {/* ═══ LEFT: Input messages (consumed by robot) ═══ */}
        <div style={{ flex: '1 1 26%' }}>
          {/* ── Preprocessing pipeline ── */}
          <div
            className="cascade-item rounded-xl mb-3"
            style={{
              animationDelay: '0.02s',
              padding: '1.2vh 1vw',
              background: 'rgba(129,140,248,0.06)',
              border: '1px dashed rgba(129,140,248,0.35)',
            }}
          >
            <p
              className="mono font-bold mb-1.5"
              style={{
                color: '#818cf8',
                fontSize: '0.85vw',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Preprocessing
            </p>

            <div className="flex flex-col items-start" style={{ gap: '0.3vh' }}>
              {/* Raw messages */}
              <div
                className="mono rounded"
                style={{
                  fontSize: '0.85vw',
                  color: '#888',
                  padding: '0.2vh 0.6vw',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Raw messages
              </div>
              <span className="mono" style={{ color: '#555', fontSize: '0.85vw', paddingLeft: '0.4vw' }}>↓</span>

              {/* stripImagesFromMessages */}
              <div
                className="mono rounded"
                style={{
                  fontSize: '0.85vw',
                  color: '#818cf8',
                  padding: '0.2vh 0.6vw',
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.3)',
                }}
              >
                stripImagesFromMessages()
              </div>
              <p
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: 'var(--dim)',
                  paddingLeft: '1.1vw',
                  lineHeight: 1.35,
                }}
              >
                Images → <span style={{ color: '#c084fc' }}>"[image]"</span>, Documents → <span style={{ color: '#c084fc' }}>"[document]"</span>
                <br />
                <span style={{ color: '#555' }}>prevents compression request from exceeding context limit</span>
              </p>
              <span className="mono" style={{ color: '#555', fontSize: '0.85vw', paddingLeft: '0.4vw' }}>↓</span>

              {/* stripReinjectedAttachments */}
              <div
                className="mono rounded"
                style={{
                  fontSize: '0.85vw',
                  color: '#818cf8',
                  padding: '0.2vh 0.6vw',
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.3)',
                }}
              >
                stripReinjectedAttachments()
              </div>
              <p
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: 'var(--dim)',
                  paddingLeft: '1.1vw',
                  lineHeight: 1.35,
                }}
              >
                Removes skill discovery/listing attachments
                <br />
                <span style={{ color: '#555' }}>auto-reinjected after compression</span>
              </p>
              <span className="mono" style={{ color: '#555', fontSize: '0.85vw', paddingLeft: '0.4vw' }}>↓</span>

              {/* normalizeMessagesForAPI */}
              <div
                className="mono rounded"
                style={{
                  fontSize: '0.85vw',
                  color: '#818cf8',
                  padding: '0.2vh 0.6vw',
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.3)',
                }}
              >
                normalizeMessagesForAPI()
              </div>
              <p
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: 'var(--dim)',
                  paddingLeft: '1.1vw',
                  lineHeight: 1.35,
                }}
              >
                Normalizes message format
              </p>
            </div>
          </div>

          <p className="cascade-item mono font-bold mb-2" style={{ animationDelay: '0.1s', color: '#818cf8', fontSize: '1.1vw' }}>
            Input — 35K tokens
          </p>
          <div className="flex flex-col gap-1.5">
            {inputMsgs.map((m, i) => (
              <div key={i} className="msg-consume flex items-center gap-2 rounded-lg" style={{
                padding: '0.9vh 0.8vw',
                animationDelay: `${0.2 + i * 0.15}s`,
                background: m.color + '0a',
                border: `1px solid ${m.color}20`,
              }}>
                <span className="mono font-bold rounded" style={{ padding: '0.15vh 0.45vw', fontSize: '0.88vw', background: m.color + '20', color: m.color }}>{m.role}</span>
                <span className="truncate" style={{ fontSize: '0.95vw', color: 'var(--dim)' }}>{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CENTER: Claude Spinner + Label ═══ */}
        <div className="robot-enter flex flex-col items-center justify-center" style={{ flex: '0 0 20vw', animationDelay: '0.8s' }}>
          <ClaudeForkSpinner />

          <p className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.55vw', color: '#d97706', marginTop: '0.5vh' }}>
            Fork Agent
          </p>
          <p className="mono" style={{ fontSize: '1.1vw', color: '#c084fc', marginTop: '0.2vh' }}>Single-turn reply</p>
          <p className="mono" style={{ fontSize: '1.05vw', color: '#888' }}>5-30s · shares prompt cache</p>
        </div>

        {/* ═══ RIGHT: Output (emerges from robot) ═══ */}
        <div style={{ flex: '1 1 28%' }}>
          <p className="cascade-item mono font-bold mb-2" style={{ animationDelay: '2.8s', color: '#10b981', fontSize: '1.25vw' }}>
            Output — ~8K tokens
          </p>

          {/* <analysis> — appears then struck through */}
          <div className="analysis-strike rounded-lg mb-2" style={{
            padding: '1.6vh 1.2vw',
            animationDelay: '2.8s',
            background: 'rgba(244,63,94,0.1)',
            border: '2px solid rgba(244,63,94,0.35)',
          }}>
            <p className="mono font-bold" style={{ fontSize: '1.15vw', color: '#f43f5e' }}>&lt;analysis&gt;</p>
            <p style={{ fontSize: '1.1vw', color: '#f43f5e', opacity: 0.7 }}>Chain-of-thought reasoning draft...</p>
            <p className="mono font-bold" style={{ fontSize: '1.15vw', color: '#f43f5e' }}>&lt;/analysis&gt;</p>
            <p className="mono font-bold mt-1.5 rounded inline-block" style={{ padding: '0.3vh 0.7vw', fontSize: '1.05vw', color: '#fff', background: 'rgba(244,63,94,0.6)' }}>DELETED after generation</p>
            <p className="mt-1.5 leading-relaxed" style={{ fontSize: '0.95vw', color: 'var(--dim)' }}>
              Chain-of-thought improves summary quality but wastes tokens if kept — only the &lt;summary&gt; enters compressed context.
            </p>
          </div>

          {/* <summary> — sections emerge one by one, each hoverable */}
          <div className="section-emerge rounded-lg" style={{
            padding: '1.3vh 1.2vw',
            animationDelay: '3.5s',
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.2)',
          }}>
            <p className="mono font-bold" style={{ fontSize: '1.1vw', color: '#0ea5e9' }}>&lt;summary&gt;</p>
            {SUMMARY_TEMPLATE.map((s, i) => (
              <p
                key={i}
                className="section-emerge mono summary-item"
                style={{
                  animationDelay: `${3.7 + i * 0.12}s`,
                  fontSize: '1.05vw',
                  color: '#0ea5e9',
                  opacity: hoveredSection === null || hoveredSection === i ? 0.95 : 0.45,
                  paddingLeft: '0.9vw',
                  lineHeight: 1.45,
                  cursor: 'help',
                  transition: 'opacity 0.2s ease, transform 0.2s ease, text-shadow 0.2s ease',
                  transform: hoveredSection === i ? 'translateX(4px)' : 'translateX(0)',
                  textShadow: hoveredSection === i ? '0 0 10px rgba(14,165,233,0.6)' : 'none',
                }}
                onMouseEnter={(e) => handleSectionEnter(i, e)}
                onMouseLeave={handleSectionLeave}
              >
                {s.label}
              </p>
            ))}
            <p className="mono font-bold mt-1" style={{ fontSize: '1.1vw', color: '#0ea5e9' }}>&lt;/summary&gt;</p>
          </div>
        </div>
      </div>

      {/* ── Floating hover popup showing the template for the hovered section ── */}
      {hoveredSection !== null && hoverPos && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: hoverPos.x - 24,
            top: hoverPos.y,
            transform: 'translate(-100%, -50%)',
            zIndex: 200,
          }}
        >
          <div
            className="summary-popup relative rounded-xl border"
            style={{
              width: '32vw',
              padding: '2vh 1.6vw',
              background: 'linear-gradient(180deg, rgba(18,22,32,0.97) 0%, rgba(10,12,18,0.97) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(14,165,233,0.45)',
              boxShadow: '0 0 60px rgba(14,165,233,0.22), 0 20px 50px rgba(0,0,0,0.55)',
            }}
          >
            {/* Arrow pointing right toward the hovered item */}
            <div
              style={{
                position: 'absolute',
                right: -9,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
                width: 16,
                height: 16,
                background: 'rgba(14,14,22,0.97)',
                borderRight: '1px solid rgba(14,165,233,0.45)',
                borderTop: '1px solid rgba(14,165,233,0.45)',
              }}
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="mono font-bold rounded flex items-center justify-center"
                style={{
                  width: '1.8vw',
                  height: '1.8vw',
                  background: 'rgba(14,165,233,0.18)',
                  border: '1px solid rgba(14,165,233,0.4)',
                  color: '#0ea5e9',
                  fontSize: '1.1vw',
                }}
              >
                {SUMMARY_TEMPLATE[hoveredSection].num}
              </span>
              <span
                className="font-bold"
                style={{
                  color: '#0ea5e9',
                  fontSize: '1.2vw',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em',
                }}
              >
                {SUMMARY_TEMPLATE[hoveredSection].title}
              </span>
            </div>

            {/* Template body */}
            <pre
              className="mono"
              style={{
                fontSize: '0.95vw',
                color: '#cbd5e1',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.35)',
                padding: '1.2vh 1vw',
                borderRadius: 8,
                border: '1px solid rgba(14,165,233,0.18)',
                margin: 0,
              }}
            >
              {SUMMARY_TEMPLATE[hoveredSection].body}
            </pre>

            <p
              className="mono"
              style={{
                marginTop: '1vh',
                fontSize: '0.75vw',
                color: '#6b7280',
                fontStyle: 'italic',
              }}
            >
              from compact.ts — fork agent summary template
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Slide 21: Full-Compact Under the Hood ───────────────────────────────────

function S18_CompactDetails() {
  // Post-compaction assembled message sequence
  const postSeq = [
    { idx: '1', name: 'CompactBoundaryMessage', desc: 'Marks compaction boundary with token stats + trigger type', color: '#0ea5e9' },
    { idx: '2', name: 'SummaryUserMessage', desc: 'Formatted 9-section summary (after <analysis> stripped)', color: '#0ea5e9' },
    { idx: '3', name: 'messagesToKeep', desc: 'Preserved recent messages (if any survived compaction)', color: '#10b981' },
    { idx: '4', name: 'Attachments', desc: 'Top 5 recently-read files · plan file · MCP / skill / agent deltas', color: '#c084fc', sub: '50K budget · each ≤ 5K tokens' },
    { idx: '5', name: 'HookResults', desc: 'PreCompact / PostCompact user hooks', color: '#818cf8' },
  ]

  // PTL retry algorithm steps — matches truncateHeadForPTLRetry()
  const ptlSteps = [
    { step: '1', label: 'Group messages by API round', result: 'never split tool pairs' },
    { step: '2', label: 'Drop oldest message groups until token gap is closed', result: 'fallback: drop oldest 20%' },
    { step: '3', label: 'Clamp dropCount ≤ groups.length − 1', result: 'keep ≥ 1 group' },
    { step: '4', label: 'Re-prepend user marker if first = assistant', result: 'API needs user first' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center" style={{ gap: '0.8vh', paddingTop: '0.4vh' }}>
      <p className="slide-h3">Layer 3 — Under the Hood</p>
      <h2 className="slide-h2" style={{ fontSize: '2.3vw' }}>
        Full-Compact <span style={{ color: '#0ea5e9' }}>Production Mechanics</span>
      </h2>

      <div className="flex" style={{ width: '94vw', gap: '1.3vw' }}>

        {/* ═══════════ LEFT: Strong Anti-Tool-Call Preamble (full column, oversized) ═══════════ */}
        <div
          className="cascade-item glass-card relative flex flex-col"
          style={{
            flex: '1 1 58%',
            animationDelay: '0.25s',
            padding: '1.5vh 1.4vw',
            borderColor: 'rgba(244,63,94,0.3)',
            background: 'linear-gradient(180deg, rgba(244,63,94,0.06), rgba(20,20,28,0.6))',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: '1.9vw' }}>🚫</span>
            <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#f43f5e', fontSize: '1.55vw', letterSpacing: '-0.01em' }}>
              Strong Anti-Tool-Call Preamble and Trailer
            </h3>
          </div>
          <p style={{ fontSize: '0.92vw', color: 'var(--dim)', marginBottom: '0.9vh', lineHeight: 1.4 }}>
            Placed at <strong style={{ color: 'var(--fg)' }}>both ends</strong> of the prompt — aggressive bookends that adaptive-thinking models can't ignore.
          </p>

          {/* ── Prompt layout sandwich — 5 stacked rows, bookends highlighted ── */}
          <div style={{ marginBottom: '0.9vh' }}>
            <p
              className="mono"
              style={{
                fontSize: '0.75vw',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.4vh',
              }}
            >
              Prompt layout — bookend placement
            </p>
            <div
              className="flex flex-col rounded-md overflow-hidden"
              style={{ border: '1px solid rgba(244,63,94,0.25)' }}
            >
              {[
                { label: 'NO_TOOLS_PREAMBLE', note: 'start — strict ban', bread: true, icon: '▲' },
                { label: 'DETAILED_ANALYSIS_INSTRUCTION', note: '<analysis> draft', bread: false },
                { label: 'MAIN_PROMPT', note: '9-section format', bread: false },
                { label: 'Custom Instructions', note: 'user-provided', bread: false },
                { label: 'NO_TOOLS_TRAILER', note: 'end — reiterated', bread: true, icon: '▼' },
              ].map((row, i) => (
                <div
                  key={i}
                  className="cascade-item flex items-center justify-between"
                  style={{
                    animationDelay: `${0.4 + i * 0.07}s`,
                    padding: '0.45vh 0.85vw',
                    background: row.bread ? 'rgba(244,63,94,0.16)' : 'rgba(255,255,255,0.025)',
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {row.icon && (
                      <span className="mono" style={{ fontSize: '0.78vw', color: '#f43f5e' }}>{row.icon}</span>
                    )}
                    <span
                      className="mono font-bold"
                      style={{
                        fontSize: '0.88vw',
                        color: row.bread ? '#f43f5e' : '#a0a098',
                      }}
                    >
                      {row.label}
                    </span>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: '0.76vw',
                      color: row.bread ? '#f87171' : '#777',
                      fontStyle: row.bread ? 'normal' : 'italic',
                    }}
                  >
                    {row.note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Code excerpts: preamble (start) and trailer (end) ── */}
          <div className="flex flex-col" style={{ gap: '0.5vh' }}>
            {/* Preamble (start) */}
            <div>
              <p
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: '#f43f5e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.35vh',
                }}
              >
                ▲ preamble — start of prompt
              </p>
              <div
                className="rounded-md mono"
                style={{
                  padding: '0.85vh 1vw',
                  background: '#0c0c14',
                  border: '1px solid rgba(244,63,94,0.25)',
                  fontSize: '0.85vw',
                  lineHeight: 1.5,
                }}
              >
                <div className="preamble-line" style={{ animationDelay: '0.85s' }}>
                  <span style={{ color: '#f43f5e', fontWeight: 700 }}>CRITICAL:</span>{' '}
                  <span style={{ color: '#e8e8e3' }}>Respond with </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>TEXT ONLY</span>
                  <span style={{ color: '#e8e8e3' }}>. Do NOT call any tools.</span>
                </div>
                <div className="preamble-line" style={{ animationDelay: '0.95s', color: '#a0a098', marginTop: '0.25vh' }}>
                  - Do NOT use <span style={{ color: '#fbbf24' }}>Read</span>, <span style={{ color: '#fbbf24' }}>Bash</span>, <span style={{ color: '#fbbf24' }}>Grep</span>, <span style={{ color: '#fbbf24' }}>Glob</span>, <span style={{ color: '#fbbf24' }}>Edit</span>, <span style={{ color: '#fbbf24' }}>Write</span>, or ANY other tool.
                </div>
                <div className="preamble-line" style={{ animationDelay: '1.05s', color: '#a0a098' }}>
                  - You already have all the context you need in the conversation above.
                </div>
                <div className="preamble-line" style={{ animationDelay: '1.15s', color: '#a0a098' }}>
                  - Tool calls will be <span style={{ color: '#f43f5e', fontWeight: 700 }}>REJECTED</span> and will waste your only turn — you will <span style={{ color: '#f43f5e', fontWeight: 700 }}>fail the task</span>.
                </div>
                <div className="preamble-line" style={{ animationDelay: '1.25s', color: '#a0a098' }}>
                  - Your entire response must be plain text: an <span style={{ color: '#fbbf24' }}>&lt;analysis&gt;</span> block followed by a <span style={{ color: '#fbbf24' }}>&lt;summary&gt;</span> block.
                </div>
              </div>
            </div>

            {/* Trailer (end) */}
            <div>
              <p
                className="mono"
                style={{
                  fontSize: '0.72vw',
                  color: '#f43f5e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.35vh',
                }}
              >
                ▼ trailer — end of prompt
              </p>
              <div
                className="rounded-md mono"
                style={{
                  padding: '0.85vh 1vw',
                  background: '#0c0c14',
                  border: '1px solid rgba(244,63,94,0.25)',
                  fontSize: '0.85vw',
                  lineHeight: 1.5,
                }}
              >
                <div className="preamble-line" style={{ animationDelay: '1.25s' }}>
                  <span style={{ color: '#f43f5e', fontWeight: 700 }}>REMINDER:</span>{' '}
                  <span style={{ color: '#e8e8e3' }}>Do NOT call any tools. Respond with </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>plain text only</span>
                  <span style={{ color: '#e8e8e3' }}> —</span>
                </div>
                <div className="preamble-line" style={{ animationDelay: '1.4s', color: '#a0a098' }}>
                  an <span style={{ color: '#fbbf24' }}>&lt;analysis&gt;</span> block followed by a <span style={{ color: '#fbbf24' }}>&lt;summary&gt;</span> block.
                </div>
                <div className="preamble-line" style={{ animationDelay: '1.55s', color: '#a0a098' }}>
                  Tool calls will be <span style={{ color: '#f43f5e', fontWeight: 700 }}>rejected</span> and you will <span style={{ color: '#f43f5e', fontWeight: 700 }}>fail the task</span>.
                </div>
              </div>
            </div>
          </div>

          {/* ── Comparison stats: regression across model versions ── */}
          <div className="flex items-center justify-around" style={{ padding: '0.7vh 0', marginTop: '0.5vh' }}>
            <div className="cascade-item text-center" style={{ animationDelay: '1.35s' }}>
              <p
                className="mono font-bold"
                style={{
                  color: '#10b981',
                  fontSize: '1.7vw',
                  lineHeight: 1,
                  textShadow: '0 0 14px rgba(16,185,129,0.5)',
                }}
              >
                0.01%
              </p>
              <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.78vw', marginTop: '0.3vh' }}>
                Sonnet 4.5
              </p>
            </div>
            <div className="flex flex-col items-center" style={{ gap: '0.25vh', maxWidth: '13vw' }}>
              <span style={{ color: '#888', fontSize: '1.6vw', lineHeight: 1 }}>→</span>
              <span
                className="mono"
                style={{
                  color: '#f87171',
                  fontSize: '0.72vw',
                  lineHeight: 1.3,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                more advanced model<br />fails more (tool calling)
              </span>
            </div>
            <div className="cascade-item text-center" style={{ animationDelay: '1.5s' }}>
              <p
                className="mono font-bold"
                style={{
                  color: '#f43f5e',
                  fontSize: '1.7vw',
                  lineHeight: 1,
                  textShadow: '0 0 14px rgba(244,63,94,0.5)',
                }}
              >
                2.79%
              </p>
              <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.78vw', marginTop: '0.3vh' }}>
                Sonnet 4.6
              </p>
            </div>
          </div>

          {/* ── Why so aggressive — root-cause explanation ── */}
          <div
            className="cascade-item rounded-md mt-auto"
            style={{
              animationDelay: '1.7s',
              padding: '0.6vh 0.8vw',
              background: 'rgba(244,63,94,0.08)',
              border: '1px dashed rgba(244,63,94,0.35)',
            }}
          >
            <p className="mono font-bold" style={{ color: '#f43f5e', fontSize: '0.88vw', marginBottom: '0.45vh' }}>
              Why so aggressive? — two requirements collide
            </p>
            <p style={{ fontSize: '0.82vw', color: 'var(--dim)', lineHeight: 1.45, marginBottom: '0.4vh' }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>1.</span> Cache sharing needs the <strong style={{ color: 'var(--fg)' }}>full tool set</strong> — the forked compact agent inherits the parent's complete tool definitions so the API request prefix is byte-identical (required for a cache hit).
            </p>
            <p style={{ fontSize: '0.82vw', color: 'var(--dim)', lineHeight: 1.45, marginBottom: '0.4vh' }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>2.</span> The compact agent <strong style={{ color: 'var(--fg)' }}>must not use tools</strong> — it only needs to write a text summary.
            </p>
            <p style={{ fontSize: '0.82vw', color: 'var(--dim)', lineHeight: 1.45 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>3.</span> More advanced models <strong style={{ color: 'var(--fg)' }}>break the tool-calling limit more frequently.</strong>
            </p>
          </div>
        </div>

        {/* ═══════════ RIGHT COLUMN: Post-Compaction Sequence + Prompt-Too-Long Retry ═══════════ */}
        <div className="flex flex-col" style={{ flex: '1 1 50%', gap: '1vh' }}>

        {/* ─── RIGHT-TOP: Post-Compaction Message Sequence ─── */}
        <div
          className="cascade-item glass-card flex flex-col"
          style={{
            animationDelay: '0.4s',
            padding: '1.2vh 1.1vw',
            borderColor: 'rgba(14,165,233,0.3)',
            background: 'linear-gradient(180deg, rgba(14,165,233,0.06), rgba(20,20,28,0.6))',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: '1.5vw' }}>📋</span>
            <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#0ea5e9', fontSize: '1.2vw', letterSpacing: '-0.01em' }}>
              Post-Compaction Message Sequence
            </h3>
          </div>
          <p style={{ fontSize: '0.75vw', color: 'var(--dim)', marginBottom: '0.7vh', lineHeight: 1.35 }}>
            After compaction the message array is re-assembled in this <strong style={{ color: 'var(--fg)' }}>exact order</strong>:
          </p>

          <div className="flex flex-col" style={{ gap: '0.55vh' }}>
            {postSeq.map((item, i) => (
              <div
                key={i}
                className="cascade-item flex items-start gap-2.5 rounded-md"
                style={{
                  animationDelay: `${0.7 + i * 0.12}s`,
                  padding: '0.7vh 0.85vw',
                  background: item.color + '10',
                  border: `1px solid ${item.color}30`,
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <span
                  className="mono font-bold flex items-center justify-center rounded-full"
                  style={{
                    width: '1.5vw',
                    minWidth: '1.5vw',
                    height: '1.5vw',
                    background: item.color + '25',
                    color: item.color,
                    fontSize: '0.8vw',
                    marginTop: '0.15vh',
                  }}
                >
                  {item.idx}
                </span>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p className="mono font-bold" style={{ color: item.color, fontSize: '0.92vw', lineHeight: 1.3 }}>
                    {item.name}
                  </p>
                  <p style={{ color: 'var(--dim)', fontSize: '0.8vw', lineHeight: 1.35, marginTop: '0.1vh' }}>{item.desc}</p>
                  {item.sub && (
                    <p className="mono" style={{ color: '#666', fontSize: '0.7vw', marginTop: '0.1vh' }}>{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT-BOTTOM: Prompt-Too-Long Retry Mechanism ─── */}
        <div
          className="cascade-item glass-card flex flex-col"
          style={{
            animationDelay: '0.55s',
            padding: '1.4vh 1.3vw',
            borderColor: 'rgba(245,158,11,0.3)',
            background: 'linear-gradient(180deg, rgba(245,158,11,0.06), rgba(20,20,28,0.6))',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: '1.75vw' }}>🔁</span>
            <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#f59e0b', fontSize: '1.4vw', letterSpacing: '-0.01em' }}>
              Prompt-Too-Long Retry
            </h3>
          </div>
          <p style={{ fontSize: '0.88vw', color: 'var(--dim)', marginBottom: '0.8vh', lineHeight: 1.4 }}>
            <strong style={{ color: '#fbbf24', fontWeight: 700, background: 'rgba(245,158,11,0.14)', padding: '0.05vh 0.35vw', borderRadius: '0.25vw' }}>
              Even the compaction request itself can be too long.
            </strong>{' '}
            <span className="mono" style={{ color: '#f59e0b', fontWeight: 700 }}>truncateHeadForPTLRetry()</span> trims oldest API rounds from the head and re-sends — up to{' '}
            <span className="mono" style={{ color: '#f59e0b', fontWeight: 700 }}>MAX_PTL_RETRIES = 3</span>.
          </p>

          {/* Retry attempts visualization */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="mono" style={{ fontSize: '0.82vw', color: 'var(--dim)' }}>attempts</span>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="ptl-attempt flex items-center justify-center rounded-full mono font-bold"
                style={{
                  animationDelay: `${0.85 + n * 0.18}s`,
                  width: '2vw',
                  height: '2vw',
                  background: 'rgba(245,158,11,0.12)',
                  border: '2px solid rgba(245,158,11,0.55)',
                  color: '#f59e0b',
                  fontSize: '0.95vw',
                  boxShadow: '0 0 10px rgba(245,158,11,0.25)',
                }}
              >
                {n}
              </div>
            ))}
            <span className="mono ml-auto" style={{ fontSize: '0.8vw', color: '#777' }}>
              then → propagate error
            </span>
          </div>

          <div className="flex flex-col" style={{ gap: '0.5vh' }}>
            {ptlSteps.map((s, i) => (
              <div
                key={i}
                className="cascade-item flex items-start gap-2.5 rounded-md"
                style={{
                  animationDelay: `${1.35 + i * 0.09}s`,
                  padding: '0.7vh 0.9vw',
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <span className="mono font-bold" style={{ color: '#f59e0b', fontSize: '1vw', minWidth: '1.3vw' }}>{s.step}.</span>
                <span style={{ fontSize: '1vw', color: 'var(--fg)', flex: 1, lineHeight: 1.35 }}>{s.label}</span>
                <span className="mono" style={{ fontSize: '0.92vw', color: '#999', fontStyle: 'italic' }}>→ {s.result}</span>
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>
    </div>
  )
}

// ─── Slide 19: Snip Compact ──────────────────────────────────────────────────

function S19_Snip() {
  const turns = [
    { role: 'user', text: 'Fix the auth bug in login.ts', tokens: '180' },
    { role: 'assistant', text: 'Looking at the auth module...', tokens: '2,400' },
    { role: 'tool', text: 'Read: src/auth/login.ts (640 lines)', tokens: '9,800' },
    { role: 'assistant', text: 'Found the issue in validateJWT...', tokens: '3,100' },
    { role: 'tool', text: 'Edit: src/auth/login.ts', tokens: '750' },
    { role: 'user', text: 'Now add rate limiting to /api/login', tokens: '210' },
    { role: 'assistant', text: 'Adding express-rate-limit...', tokens: '1,900' },
    { role: 'tool', text: 'Read: src/routes/api.ts (380 lines)', tokens: '5,600' },
  ]
  const cutAfter = 5 // first 5 dropped, last 3 kept

  return (
    <div className="reveal-stagger flex flex-col items-center gap-4">
      <p className="slide-h3" style={{ color: '#f43f5e' }}>Emergency</p>
      <h2 className="slide-h2" style={{ fontSize: '3.2vw' }}>Snip Compact: <span style={{ color: '#f43f5e' }}>The Emergency Exit</span></h2>

      <div className="flex gap-8 mt-2" style={{ width: '90vw' }}>
        {/* ── Left: description ── */}
        <div style={{ flex: '1 1 38%' }}>
          <div className="glass-card p-6" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🚨</div>
            <p className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#f43f5e', fontSize: '1.3vw' }}>
              Oldest-first discard. No summary.
            </p>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--dim)', fontSize: '1.05vw' }}>
              When everything else fails — circuit breaker tripped, reactive compact exhausted —
              snip removes entire API rounds from the oldest end. No summary generated.
              Everything in dropped rounds is <strong style={{ color: '#f43f5e' }}>permanently lost</strong>.
            </p>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Info loss', value: '~85%', color: '#f43f5e' },
              { label: 'Latency', value: '~0ms', color: '#10b981' },
              { label: 'Buffer target', value: '3,000', sub: 'MANUAL_COMPACT_BUFFER', color: '#f59e0b' },
              { label: 'LLM cost', value: 'None', sub: 'raw deletion', color: '#818cf8' },
            ].map((s, i) => (
              <div key={i} className="cascade-item rounded-xl" style={{
                animationDelay: `${0.4 + i * 0.12}s`,
                padding: '1vh 0.8vw',
                background: s.color + '08',
                border: `1px solid ${s.color}20`,
              }}>
                <p className="mono font-bold" style={{ fontSize: '1.5vw', color: s.color, lineHeight: 1.1 }}>{s.value}</p>
                <p style={{ fontSize: '0.9vw', color: 'var(--fg)', marginTop: '0.2vh' }}>{s.label}</p>
                {s.sub && <p className="mono" style={{ fontSize: '0.75vw', color: 'var(--dim)' }}>{s.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: animated turn list ── */}
        <div style={{ flex: '1 1 58%' }}>
          <p className="mono font-bold mb-2" style={{ fontSize: '1.1vw', color: 'var(--fg)' }}>
            Conversation turns — oldest dropped first
          </p>
          <div className="relative flex flex-col gap-2">
            {turns.map((turn, i) => {
              const isCut = i < cutAfter
              const roleColor = turn.role === 'user' ? '#3b82f6' : turn.role === 'assistant' ? '#818cf8' : '#f59e0b'
              return (
                <div
                  key={i}
                  className={isCut ? 'snip-remove' : 'snip-keep'}
                  style={{
                    animationDelay: `${0.2 + i * 0.12}s`,
                    display: 'flex', alignItems: 'center', gap: '0.8vw',
                    padding: '0.8vh 1.2vw',
                    borderRadius: '0.6vw',
                    background: isCut ? 'rgba(244,63,94,0.06)' : 'rgba(16,185,129,0.06)',
                    border: `1.5px solid ${isCut ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  }}
                >
                  {/* Turn number */}
                  <span className="mono font-bold" style={{ fontSize: '1vw', color: isCut ? '#f43f5e' : '#10b981', width: '2.5vw', textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  {/* Role badge */}
                  <span className="mono font-bold px-2 py-0.5 rounded" style={{ fontSize: '0.85vw', background: roleColor + '18', color: roleColor, minWidth: '5vw', textAlign: 'center' }}>
                    {turn.role}
                  </span>
                  {/* Content */}
                  <span className="truncate" style={{ flex: 1, fontSize: '1vw', color: isCut ? 'var(--dim)' : 'var(--fg)' }}>
                    {turn.text}
                  </span>
                  {/* Tokens */}
                  <span className="mono" style={{ fontSize: '0.85vw', color: isCut ? '#f43f5e80' : '#10b981' }}>
                    {turn.tokens}
                  </span>
                  {/* Status */}
                  <span className="mono font-bold" style={{ fontSize: '0.85vw', color: isCut ? '#f43f5e' : '#10b981', width: '5vw', textAlign: 'right' }}>
                    {isCut ? '✕ drop' : '✓ kept'}
                  </span>
                </div>
              )
            })}

            {/* Animated cut line */}
            <div className="absolute left-0 right-0 flex items-center" style={{ top: `${cutAfter * 12.5}%`, transform: 'translateY(1.6vh)' }}>
              <div className="snip-line" style={{
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #f43f5e 10%, #f43f5e 90%, transparent)',
                animationDelay: '0.3s',
                position: 'relative',
              }}>
                <span className="absolute -top-3 right-0 mono font-bold" style={{ fontSize: '1vw', color: '#f43f5e', whiteSpace: 'nowrap' }}>
                  ✂️ snip boundary
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 20: Progressive Degradation Scale ─────────────────────────────────

// ─── Slide 20: Degradation Scale — "Signal Erosion" design ─────────────────

const S20_LAYERS = [
  {
    name: 'L1 Micro-Compact', preserved: 100, color: '#10b981', icon: '✂️',
    latency: '<1ms', cost: 'No LLM',
    lossLabel: 'Lossless',
    lost: [] as string[],
    kept: ['All semantic content', 'Tool use blocks', 'Prompt cache (via cache_edits)'],
  },
  {
    name: 'L4 Session Memory', preserved: 70, color: '#f59e0b', icon: '🧠',
    latency: '<10ms', cost: 'No LLM',
    lossLabel: '~30% info loss',
    lost: ['Exact code snippets', 'Specific error messages', 'Intermediate reasoning'],
    kept: ['10-section structured summary', 'Recent 10-40K tokens', 'Key decisions & context'],
  },
  {
    name: 'L3 Full Compact', preserved: 50, color: '#0ea5e9', icon: '📝',
    latency: '5-30s', cost: '1 API call',
    lossLabel: '~50% info loss',
    lost: ['Full conversation flow', 'Thinking blocks deleted', 'Debug attempts lost'],
    kept: ['9-section summary (20K max)', 'Primary request & intent', 'Files, errors, tasks'],
  },
  {
    name: 'Snip Compact', preserved: 15, color: '#f43f5e', icon: '🚨',
    latency: '~0ms', cost: 'No LLM',
    lossLabel: '~85% info loss',
    lost: ['All dropped rounds — raw deletion', 'User instructions & code', 'No summary at all'],
    kept: ['Only most recent messages'],
  },
] as const

const S20_CIRC = 2 * Math.PI * 48

// Erosion grid: 32 cols × 3 rows = 96 elements (down from 160).
// Precomputed as flat array with column-based delay grouping.
const EROSION_COLS = 32
const EROSION_ROWS = 3
const EROSION_PCTS = [100, 70, 50, 15]
const EROSION_GRID = /* @__PURE__ */ (() => {
  const grid: { alive: boolean; stage: number; col: number }[] = []
  for (let r = 0; r < EROSION_ROWS; r++) {
    for (let c = 0; c < EROSION_COLS; c++) {
      const stage = Math.min(Math.floor(c / 8), 3)
      const pct = EROSION_PCTS[stage]
      const hash = ((c * 7 + r * 13 + 37) * 31 + c * r * 3) % 100
      grid.push({ alive: hash < pct, stage, col: c })
    }
  }
  return grid
})()

// Pre-compute one delay per column (all rows in a column share the same delay).
// Avoids 96 unique inline styles — browser can batch same-delay animations.
const EROSION_COL_DELAYS = /* @__PURE__ */ (() => {
  const d: string[] = []
  for (let c = 0; c < EROSION_COLS; c++) d.push(`${0.6 + c * 0.065}s`)
  return d
})()

// Single rAF loop replaces setInterval polling + setTimeout chain.
// One effect, no intermediate re-renders until the final value.
function AnimatedPct({ target, color, delay }: { target: number; color: string; delay: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    let start = 0
    const duration = 900 // ms for count-up
    const delayMs = delay * 1000
    const tick = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      if (elapsed < delayMs) { raf = requestAnimationFrame(tick); return }
      const progress = Math.min((elapsed - delayMs) / duration, 1)
      setVal(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, delay])
  return (
    <text x="60" y="54" textAnchor="middle" fill={color} fontSize="30" fontWeight="800" fontFamily="var(--font-display)">
      {val}%
    </text>
  )
}

function S20_DegradationScale() {
  return (
    <div className="reveal-stagger flex flex-col items-center" style={{ gap: '1.2vh' }}>
      <p className="slide-h3" style={{ color: '#818cf8' }}>The Spectrum</p>
      <h2 className="slide-h2">Progressive <span style={{ color: '#f43f5e' }}>Information Loss</span></h2>

      {/* ═══ Erosion Grid — the hero visualization ═══ */}
      <div style={{ width: '88vw' }}>
        {/* Stage labels above the grid */}
        <div className="flex" style={{ marginBottom: '0.6vh' }}>
          {S20_LAYERS.map((l, i) => (
            <div key={i} className="erosion-label flex items-center justify-center gap-1.5" style={{ flex: 1, animationDelay: `${0.3 + i * 0.4}s` }}>
              <span style={{ fontSize: '1vw' }}>{l.icon}</span>
              <span className="mono font-bold" style={{ fontSize: '0.8vw', color: l.color, letterSpacing: '0.06em' }}>{l.name}</span>
              <span className="mono" style={{ fontSize: '0.7vw', color: l.color, opacity: 0.6 }}>({l.preserved}%)</span>
            </div>
          ))}
        </div>

        {/* The grid — 96 cells (32×3), column-batched delays */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${EROSION_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${EROSION_ROWS}, 1fr)`,
            gap: '3px',
            padding: '1.2vh 0.8vw',
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 12,
          }}
        >
          {EROSION_GRID.map((cell, idx) => (
            <div
              key={idx}
              className={cell.alive ? 'erosion-alive' : 'erosion-dead'}
              style={{
                aspectRatio: '1',
                animationDelay: EROSION_COL_DELAYS[cell.col],
                ['--cell-color' as string]: S20_LAYERS[cell.stage].color,
              }}
            />
          ))}
        </div>

        {/* Axis labels */}
        <div className="flex justify-between" style={{ marginTop: '0.5vh', padding: '0 0.8vw' }}>
          <span className="mono" style={{ fontSize: '0.75vw', color: '#10b981', letterSpacing: '0.1em' }}>FULL SIGNAL</span>
          <span className="mono" style={{ fontSize: '0.75vw', color: '#f43f5e', letterSpacing: '0.1em' }}>NEAR TOTAL LOSS</span>
        </div>
      </div>

      {/* ═══ Detail columns — ring gauges + LOST/KEPT ═══ */}
      <div className="flex items-start" style={{ width: '90vw', gap: '0.5vw' }}>
        {S20_LAYERS.map((l, i) => {
          const fill = S20_CIRC * (l.preserved / 100)
          const redTint = ((100 - l.preserved) / 100) * 0.08
          const baseDelay = 0.8 + i * 0.35
          const listBase = baseDelay + 1.6

          return (
            <div key={i} className="flex items-center" style={{ flex: 1 }}>
              <div
                className="cascade-item degrad-card flex flex-col items-center w-full"
                style={{
                  animationDelay: `${baseDelay}s`,
                  padding: '1.4vh 0.4vw 1.6vh',
                  borderLeft: `3px solid ${l.color}`,
                  background: `rgba(239,68,68,${redTint})`,
                  ['--card-color' as string]: `${l.color}55`,
                  ['--card-glow' as string]: `${l.color}25`,
                }}
              >
                {/* Ring Gauge — no drop-shadow filter, uses stroke opacity for glow */}
                <svg viewBox="0 0 120 120" style={{ width: '7.5vw', height: '7.5vw' }}>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                  {/* Soft glow layer — thicker, lower opacity, no filter */}
                  <circle
                    cx="60" cy="60" r="48" fill="none" stroke={l.color} strokeWidth="14"
                    strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.15"
                    style={{
                      strokeDasharray: `${fill.toFixed(1)} ${S20_CIRC.toFixed(1)}`,
                      strokeDashoffset: fill.toFixed(1),
                      animationDelay: `${baseDelay + 0.5}s`,
                    }}
                    className="gauge-fill"
                  />
                  {/* Main arc */}
                  <circle
                    cx="60" cy="60" r="48" fill="none" stroke={l.color} strokeWidth="7"
                    strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.9"
                    style={{
                      strokeDasharray: `${fill.toFixed(1)} ${S20_CIRC.toFixed(1)}`,
                      strokeDashoffset: fill.toFixed(1),
                      animationDelay: `${baseDelay + 0.5}s`,
                    }}
                    className="gauge-fill"
                  />
                  {l.preserved < 100 && (
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth="7"
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ strokeDasharray: `${(S20_CIRC - fill).toFixed(1)} ${S20_CIRC.toFixed(1)}`, strokeDashoffset: `${-(fill).toFixed(1)}` }}
                    />
                  )}
                  <AnimatedPct target={l.preserved} color={l.color} delay={baseDelay + 0.6} />
                  <text x="60" y="74" textAnchor="middle" fill="#888" fontSize="12" fontFamily="var(--font-mono)">preserved</text>
                </svg>

                {/* Loss label pill */}
                <span className="cascade-item mono font-bold" style={{
                  animationDelay: `${baseDelay + 0.8}s`,
                  fontSize: '0.8vw',
                  padding: '0.3vh 0.6vw',
                  borderRadius: 6,
                  marginTop: '0.3vh',
                  background: l.preserved === 100 ? 'rgba(16,185,129,0.12)' : l.preserved >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.15)',
                  color: l.preserved === 100 ? '#10b981' : l.preserved >= 50 ? '#f59e0b' : '#f43f5e',
                }}>
                  {l.lossLabel}
                </span>

                {/* Metrics */}
                <div className="flex gap-1 mt-1">
                  <span className="cascade-item mono px-1.5 py-0.5 rounded-full" style={{ animationDelay: `${baseDelay + 1.0}s`, fontSize: '0.7vw', background: l.color + '15', color: l.color, border: `1px solid ${l.color}30` }}>{l.latency}</span>
                  <span className="cascade-item mono px-1.5 py-0.5 rounded-full" style={{ animationDelay: `${baseDelay + 1.1}s`, fontSize: '0.7vw', background: 'rgba(255,255,255,0.04)', color: '#999', border: '1px solid rgba(255,255,255,0.08)' }}>{l.cost}</span>
                </div>

                {/* LOST — staggered strikethrough */}
                <div className="mt-2 w-full px-2">
                  <p className="cascade-item mono font-bold" style={{ animationDelay: `${listBase}s`, fontSize: '0.82vw', color: '#f43f5e', marginBottom: '0.3vh', letterSpacing: '0.05em' }}>LOST:</p>
                  {l.lost.length > 0 ? (
                    l.lost.map((item, j) => (
                      <p key={j} className="lost-item-anim" style={{ animationDelay: `${listBase + 0.15 + j * 0.22}s`, fontSize: '0.78vw', color: '#ef4444', lineHeight: 1.4, marginBottom: '0.12vh' }}>
                        <span style={{ color: '#f4434580' }}>{'× '}</span>{item}
                      </p>
                    ))
                  ) : (
                    <p className="kept-item-anim" style={{ animationDelay: `${listBase + 0.15}s`, fontSize: '0.78vw', color: '#10b981', lineHeight: 1.4, fontStyle: 'italic' }}>
                      <span style={{ color: '#10b98180' }}>{'— '}</span>nothing (lossless)
                    </p>
                  )}
                </div>

                {/* KEPT — staggered check pop */}
                <div className="mt-2 w-full px-2">
                  <p className="cascade-item mono font-bold" style={{ animationDelay: `${listBase + 0.7}s`, fontSize: '0.82vw', color: '#10b981', marginBottom: '0.3vh', letterSpacing: '0.05em' }}>KEPT:</p>
                  {l.kept.map((item, j) => (
                    <p key={j} className="kept-item-anim" style={{ animationDelay: `${listBase + 0.85 + j * 0.15}s`, fontSize: '0.78vw', color: '#10b981', lineHeight: 1.4, marginBottom: '0.12vh' }}>
                      <span style={{ color: '#10b98180' }}>{'✓ '}</span>{item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Pulsing flow arrow */}
              {i < 3 && (
                <div className="cascade-item flex items-center" style={{ animationDelay: `${baseDelay + 0.6}s`, marginTop: '-4vh' }}>
                  <div className="degrad-arrow">
                    <svg width="28" height="28" viewBox="0 0 32 32">
                      <defs>
                        <linearGradient id={`arrGrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={l.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={S20_LAYERS[i + 1].color} stopOpacity="0.7" />
                        </linearGradient>
                      </defs>
                      <path d="M4 16 L22 16 M17 10 L24 16 L17 22" stroke={`url(#arrGrad${i})`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="mono text-sm" style={{ color: 'var(--dim)', marginTop: '0.2vh' }}>
        Level 2 complete — press → for the machinery
      </p>
    </div>
  )
}

// ─── Slide 24: Level 2 → Level 3 separator ───────────────────────────────────

function S20b_ToMachinery() {
  const chips = [
    'Query Loop',
    'Token Math',
    'Circuit Breaker',
    'Reactive Compact',
    'Context Collapse',
    'API Invariants',
    'Post-Compact Cleanup',
    'Fork Cache Sharing',
    'Memory Security',
  ]

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Ambient particles (matches S10_GoDeeper) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${8 + Math.random() * 84}%`,
            background: '#f43f5e',
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
            width: `${3 + Math.random() * 4}px`,
            height: `${3 + Math.random() * 4}px`,
          }}
        />
      ))}

      <div className="reveal-stagger flex flex-col items-center gap-6 z-10" style={{ maxWidth: '78vw' }}>
        {/* Kicker — Level 2 closing */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-1 rounded" style={{ background: '#818cf8' }} />
          <span className="mono text-sm" style={{ color: '#818cf8', letterSpacing: '0.12em' }}>Level 2 complete</span>
          <div className="w-12 h-1 rounded" style={{ background: '#818cf8' }} />
        </div>

        {/* Title — announces Level 3 */}
        <h2 className="slide-h2 text-center">
          Now for <span style={{ color: '#f43f5e' }}>the machinery</span>.
        </h2>

        {/* Lead line — sets the "appreciate, don't memorize" tone */}
        <p className="slide-body text-center" style={{ maxWidth: '100%', fontSize: '1.7vw', lineHeight: 1.35 }}>
          The real software-engineering magic that makes <span style={{ color: '#f43f5e' }}>the whole thing actually work</span>.
        </p>

        {/* Expectation setter */}
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.15vw',
            color: '#9a9a92',
            fontStyle: 'italic',
            maxWidth: '58vw',
            lineHeight: 1.45,
            marginTop: '-0.5vh',
          }}
        >
          You are <strong style={{ color: '#cbd5e1' }}>not expected to understand</strong> every detail —
          just to appreciate how much scaffolding it takes.
        </p>

        {/* Chip cloud — topics ahead */}
        <div className="flex flex-wrap gap-3 justify-center" style={{ maxWidth: '70vw', marginTop: '1vh' }}>
          {chips.map((name, i) => (
            <div
              key={i}
              className="cascade-item mono"
              style={{
                padding: '0.7vh 1.1vw',
                fontSize: '1vw',
                borderRadius: '9999px',
                border: '1px solid rgba(244,63,94,0.35)',
                background: 'rgba(244,63,94,0.06)',
                color: '#f43f5e',
                animationDelay: `${0.7 + i * 0.08}s`,
                letterSpacing: '0.02em',
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <p className="mono text-sm mt-4" style={{ color: 'var(--dim)' }}>
          press → to enter Level 3
        </p>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const level2Slides = [
  S11_MicrocompactConcept,
  S12_MicrocompactDemo,
  S11b_TwoSubPaths,
  S11d_CacheEditPipeline,
  S11c_CachedEditInternals,
  S13_AutoCompactConcept,
  S14_DecisionTree,
  S15_SessionMemory,
  S16_WhatSurvives,
  S15b_SessionMemoryDeep,
  S17_MemorySystem,
  S17_FullCompact,
  S18_CompactDetails,
  S19_Snip,
  S20_DegradationScale,
  S20b_ToMachinery,
]
