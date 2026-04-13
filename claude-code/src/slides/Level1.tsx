/**
 * Level 1 — The Big Picture (Slides 1-10)
 * Introduces the problem, the solution, and the 4-layer model.
 */

import { useCallback, useMemo, useState, memo } from 'react'
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import { ClaudeForkSpinner } from './Level2'

// ─── Shared components ───────────────────────────────────────────────────────

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

// ─── Slide 1: Cover ──────────────────────────────────────────────────────────

function S01_Cover() {
  return (
    <div className="relative w-full h-full">
      <Particles count={20} />

      {/* Top group — spinner + heading + title, anchored above the midline */}
      <div
        className="reveal-stagger absolute left-0 right-0 flex flex-col items-center gap-5 z-10"
        style={{ bottom: '52%' }}
      >
        <div className="robot-enter" style={{ animationDelay: '0.05s' }}>
          <ClaudeForkSpinner size="16vw" />
        </div>
        <p className="slide-h3" style={{ animationDelay: '0.1s' }}>Claude Code Deep Dive</p>
        <h1 className="slide-title gradient-text text-center" style={{ fontSize: '6vw' }}>
          Context Management
        </h1>
      </div>

      {/* Middle — tagline sits on the geometric center of the slide */}
      <div
        className="absolute left-0 right-0 flex justify-center z-10"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <p className="slide-body" style={{ maxWidth: '65%' }}>
          How Claude Code keeps working when the conversation outgrows the context window.
        </p>
      </div>

      {/* Bottom — author + stats */}
      <div
        className="reveal-stagger absolute left-0 right-0 flex flex-col items-center gap-4 z-10"
        style={{ top: '62%' }}
      >
        <p className="mono text-sm" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>Song Li</p>
        <div className="flex items-center gap-3">
          <span className="mono text-sm" style={{ color: 'var(--dim)' }}>32 slides</span>
          <span style={{ color: 'var(--line)' }}>|</span>
          <span className="mono text-sm" style={{ color: 'var(--dim)' }}>3 depth levels</span>
          <span style={{ color: 'var(--line)' }}>|</span>
          <span className="mono text-sm" style={{ color: 'var(--dim)' }}>progressive detail</span>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 2: The Problem ────────────────────────────────────────────────────

function S02_Problem() {
  return (
    <div className="reveal-stagger flex flex-col items-center gap-8">
      <p className="slide-h3">The Problem</p>
      <h2 className="slide-h2 text-center" style={{ maxWidth: '80%' }}>
        Every conversation has a <span className="accent">hard limit</span>.
      </h2>
      <div className="flex items-end gap-6 mt-4" style={{ height: '30vh' }}>
        {/* Context window tank visualization */}
        <div className="relative flex flex-col items-center gap-2">
          <div
            className="relative overflow-hidden border-2 rounded-xl"
            style={{
              width: '22vw', height: '28vh',
              borderColor: 'rgba(217,119,6,0.3)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            {/* Fill level */}
            <div
              className="absolute bottom-0 left-0 right-0 animate-fill"
              style={{
                height: '85%',
                background: 'linear-gradient(180deg, rgba(239,68,68,0.7) 0%, rgba(217,119,6,0.4) 40%, rgba(16,185,129,0.3) 100%)',
                borderRadius: '0 0 10px 10px',
              }}
            />
            {/* 93% threshold line */}
            <div
              className="absolute left-0 right-0"
              style={{ top: '7%', borderTop: '2px dashed rgba(217,119,6,0.7)' }}
            >
              <span className="absolute right-2 -top-5 mono text-sm" style={{ color: '#d97706' }}>
                93% → compress
              </span>
            </div>
            {/* Labels inside */}
            <div className="absolute inset-0 flex flex-col justify-end p-3 gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(16,185,129,0.6)' }} />
                <span className="mono text-sm" style={{ color: 'var(--fg)' }}>system prompt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(217,119,6,0.6)' }} />
                <span className="mono text-sm" style={{ color: 'var(--fg)' }}>conversation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.6)' }} />
                <span className="mono text-sm" style={{ color: 'var(--fg)' }}>tool results</span>
              </div>
            </div>
          </div>
          <span className="mono text-sm accent">200K tokens</span>
        </div>

        <div className="flex flex-col gap-4" style={{ maxWidth: '40vw' }}>
          <p className="slide-body text-left" style={{ maxWidth: '100%', fontSize: '1.6vw' }}>
            Claude&apos;s context window is <span className="accent mono">200K tokens</span>.
          </p>
          <p className="slide-body text-left" style={{ maxWidth: '100%', fontSize: '1.6vw' }}>
            Every turn adds tokens. At <span className="accent mono">93% capacity (~167K)</span>, the compression pipeline activates.
          </p>
          <p className="slide-body text-left" style={{ maxWidth: '100%', fontSize: '1.6vw' }}>
            Cheap strategies first, expensive ones <span className="accent">only if needed</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Slide 3: What fills context ─────────────────────────────────────────────

function S03_WhatFillsContext() {
  const bars = [
    { label: 'System prompt + CLAUDE.md', pct: 8, color: '#10b981' },
    { label: 'User messages', pct: 12, color: '#3b82f6' },
    { label: 'Assistant responses', pct: 25, color: '#818cf8' },
    { label: 'Tool calls (Bash, Read, Edit...)', pct: 35, color: '#d97706' },
    { label: 'Tool results (file contents, output)', pct: 20, color: '#f43f5e' },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-6">
      <p className="slide-h3">Anatomy of Context</p>
      <h2 className="slide-h2">What fills the window?</h2>
      <div className="flex flex-col gap-4 mt-4" style={{ width: '70vw' }}>
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="mono text-sm text-right" style={{ width: '28vw', color: 'var(--dim)' }}>
              {bar.label}
            </span>
            <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div
                className="h-full rounded-lg animate-fill"
                style={{
                  width: `${bar.pct}%`,
                  background: bar.color,
                  animationDelay: '0.4s',
                  animationDuration: '1.2s',
                }}
              />
            </div>
            <span className="mono text-sm" style={{ color: bar.color, width: '4vw' }}>{bar.pct}%</span>
          </div>
        ))}
      </div>
      <p className="slide-body mt-4" style={{ fontSize: '1.65vw' }}>
        Tool results are the biggest consumer — a single <span className="mono accent">Read</span> of a 2000-line file is <span className="mono accent">~15K tokens</span>.
      </p>
    </div>
  )
}

// ─── Slide 4: Growth visualization ───────────────────────────────────────────

// Precomputed once at module load — avoids Math.random() on every render
const GROWTH_TURNS = Array.from({ length: 15 }, (_, i) => ({
  turn: i + 1,
  tokens: Math.min(195, 12 + i * 14 + Math.random() * 8),
}))

function S04_Growth() {
  const chartH = 35 // vh
  const turns = GROWTH_TURNS

  return (
    <div className="reveal-stagger flex flex-col items-center gap-6">
      <p className="slide-h3">The Growth Curve</p>
      <h2 className="slide-h2">Context grows <span className="accent">fast</span>.</h2>

      {/* Bar chart */}
      <div className="relative mt-4" style={{ height: `${chartH}vh`, width: '75vw' }}>
        {/* 200K limit line */}
        <div
          className="absolute left-0 right-0 z-10"
          style={{ bottom: `${(187 / 200) * 100}%`, borderTop: '2px dashed rgba(239,68,68,0.5)' }}
        >
          <span className="absolute right-0 -top-5 mono text-sm" style={{ color: '#ef4444' }}>
            200K limit
          </span>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1">
          {turns.map((t, i) => {
            const barH = (t.tokens / 200) * chartH
            const isOver = t.tokens > 180
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t animate-grow-up"
                  style={{
                    height: `${barH}vh`,
                    background: isOver
                      ? 'linear-gradient(180deg, #ef4444, #dc2626)'
                      : `linear-gradient(180deg, rgba(217,119,6,${0.4 + barH / chartH / 2}), rgba(217,119,6,0.2))`,
                    animationDelay: `${0.5 + i * 0.25}s`,
                    animationDuration: '0.5s',
                  }}
                />
                <span className="mono mt-1" style={{ fontSize: '0.7vw', color: 'var(--dim)' }}>
                  {t.turn}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="slide-body" style={{ fontSize: '1.65vw' }}>
        Without compression, sessions die after <span className="accent">~10-15 turns</span>.
      </p>
    </div>
  )
}

// ─── Slide 5: What happens at overflow ───────────────────────────────────────

function S05_Overflow() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const cards = [
    {
      icon: '💀', label: 'Session dies', desc: 'All progress lost',
      explanation: 'The AI has a memory limit. Once the conversation gets too long, it simply can\'t read any more — like a notebook that ran out of pages. Everything you discussed is gone.',
    },
    {
      icon: '🔄', label: 'Start over', desc: 'Re-explain everything',
      explanation: 'You have to open a fresh conversation and re-explain your entire project from scratch — the files, the bug, what you already tried. All that back-and-forth, repeated.',
    },
    {
      icon: '😤', label: 'User frustrated', desc: 'Time wasted',
      explanation: 'You were 45 minutes into a complex debugging session and suddenly the AI can\'t respond. The momentum is lost, and there\'s no way to pick up where you left off.',
    },
  ]

  return (
    <div className="reveal-stagger flex flex-col items-center gap-8">
      <p className="slide-h3">When Context Overflows</p>
      <h2 className="slide-h2">The AI <span style={{ color: '#ef4444' }}>refuses to respond</span>.</h2>

      <div className="code-block" style={{ fontSize: '1.4vw' }}>
        <span style={{ color: '#ef4444' }}>{'{'}</span>{'\n'}
        {'  '}<span style={{ color: '#c084fc' }}>"type"</span>: <span style={{ color: '#86efac' }}>"error"</span>,{'\n'}
        {'  '}<span style={{ color: '#c084fc' }}>"error"</span>: {'{'}{'\n'}
        {'    '}<span style={{ color: '#c084fc' }}>"type"</span>: <span style={{ color: '#86efac' }}>"invalid_request_error"</span>,{'\n'}
        {'    '}<span style={{ color: '#c084fc' }}>"message"</span>: <span style={{ color: '#86efac' }}>"prompt is too long: 213847 tokens &gt; 200000 maximum"</span>{'\n'}
        {'  '}{'}'}{'\n'}
        <span style={{ color: '#ef4444' }}>{'}'}</span>
      </div>

      <div className="flex gap-8 mt-4">
        {cards.map((item, i) => (
          <div
            key={i}
            className="glass-card p-6 text-center relative"
            style={{ width: '18vw', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div style={{ fontSize: '3vw' }}>{item.icon}</div>
            <p className="mono text-sm mt-2" style={{ color: 'var(--fg)' }}>{item.label}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--dim)' }}>{item.desc}</p>

            {hoveredIdx === i && (
              <div
                className="absolute left-1/2 bottom-full mb-3 p-6 rounded-xl border text-left"
                style={{
                  transform: 'translateX(-50%)',
                  width: '30vw',
                  background: 'rgba(14,14,22,0.97)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                  zIndex: 20,
                }}
              >
                <p className="leading-relaxed" style={{ color: 'var(--fg)', fontSize: '1.25vw' }}>
                  {item.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mono text-sm" style={{ color: 'var(--dim)' }}>hover over each card to learn more</p>
    </div>
  )
}

// ─── Slide 6: The Answer ─────────────────────────────────────────────────────

function S06_Answer() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const cards = [
    {
      icon: '💰', label: 'Token Cost', color: '#f59e0b',
      desc: 'LLM API calls are expensive — every summary costs real money',
      explanation: 'Think of tokens like a taxi meter. Every word the AI reads or writes costs money. Asking the AI to summarize a long conversation is like taking an extra taxi ride — it works, but you\'re paying for it. Cheap strategies like clearing old outputs cost nothing.',
    },
    {
      icon: '🎯', label: 'Information Accuracy', color: '#0ea5e9',
      desc: 'Compression loses context — the model forgets details it needs',
      explanation: 'Imagine summarizing a 2-hour meeting into 3 bullet points. You\'d lose the nuance — the exact error message, the file path, why you ruled out option B. The AI faces the same problem: every compression loses details that might matter later.',
    },
    {
      icon: '⚡', label: 'Model Performance', color: '#f43f5e',
      desc: 'Summaries take 5-30s, and too much context dilutes attention',
      explanation: 'Two problems: first, generating a summary blocks you for 5-30 seconds while you wait. Second, even when context fits, the AI pays less attention to things in the middle of a very long conversation — like how you skim the middle of a long email. Compression helps the AI focus on what matters.',
    },
  ]

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <Particles count={15} color="#818cf8" />
      <div className="reveal-stagger flex flex-col items-center gap-6 z-10">
        <p className="slide-h3">The Answer</p>
        <h1 className="slide-title gradient-text-warm text-center" style={{ fontSize: '5vw' }}>
          Progressive<br />Compression
        </h1>
        <p className="slide-big mt-4" style={{ fontSize: '2vw', maxWidth: '75%' }}>
          A balancing act between three forces:
        </p>

        <div className="flex gap-6 mt-2">
          {cards.map((item, i) => (
            <div
              key={i}
              className="cascade-item glass-card p-5 text-center relative"
              style={{ animationDelay: `${0.6 + i * 0.2}s`, width: '20vw', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div style={{ fontSize: '2.5vw' }}>{item.icon}</div>
              <p className="font-semibold text-sm mt-2" style={{ fontFamily: 'var(--font-display)', color: item.color }}>
                {item.label}
              </p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--dim)' }}>{item.desc}</p>

              {hoveredIdx === i && (
                <div
                  className="absolute left-1/2 bottom-full mb-3 p-6 rounded-xl border text-left"
                  style={{
                    transform: 'translateX(-50%)',
                    width: '32vw',
                    background: 'rgba(14,14,22,0.97)',
                    borderColor: item.color + '50',
                    boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 20px ${item.color}15`,
                    zIndex: 20,
                  }}
                >
                  <p className="leading-relaxed" style={{ color: 'var(--fg)', fontSize: '1.25vw' }}>
                    {item.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="slide-body mt-4" style={{ fontSize: '1.65vw', maxWidth: '70%' }}>
          So: delay expensive operations as long as possible.
          Only discard information as a <span className="accent">last resort</span>.
        </p>
      </div>
    </div>
  )
}

// ─── Slide 7: The 4 Layers (ReactFlow) ──────────────────────────────────────

function LayerNode({ data }: { data: Record<string, unknown> }) {
  const { setCenter } = useReactFlow()
  const onClick = useCallback(() => {
    const x = (data._posX as number) ?? 0
    const y = (data._posY as number) ?? 0
    setCenter(x + 130, y + 60, { zoom: 1.55, duration: 600 })
  }, [data._posX, data._posY, setCenter])

  return (
    <div
      onClick={onClick}
      className="ctx-node-inner px-5 py-4 rounded-2xl border-2 text-white shadow-lg cursor-pointer transition-all duration-200 hover:brightness-125"
      style={{
        background: data.bg as string,
        borderColor: data.borderColor as string,
        minWidth: 260,
        boxShadow: `0 0 30px 4px ${data.glow as string}`,
        ['--glow-color' as string]: data.glow as string,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '1.5rem' }}>{String(data.icon)}</span>
        <span className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          {String(data.label)}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{String(data.latency)}</span>
        <span style={{ color: data.lossColor as string }}>{String(data.loss)}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{String(data.cost)}</span>
      </div>
      <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 280 }}>
        {String(data.desc)}
      </p>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

const layerNodeTypes = { layerNode: LayerNode }

// ─── Slide 7: Layer detail content (shown in click-to-zoom popup) ────────────

const LAYER_DETAILS: Record<string, {
  icon: string; title: string; color: string; what: string; how: string;
  items?: { icon: string; label: string; result: string; highlight?: boolean }[];
  stats?: { label: string; value: string; sub?: string; color: string }[];
  source: string; interactions: string;
}> = {
  l1: {
    icon: '✂️', title: 'L1 — Micro-Compact', color: '#10b981',
    what: 'Rule-based cleanup of old tool results after they drop out of the prompt cache.',
    how: 'Walks the message history and strips tool_result blocks beyond the cache boundary. No LLM, no summary — just deletes bytes the model already processed. Lossless because the content was only ever stale cache filler.',
    stats: [
      { label: 'Latency', value: '<1ms', sub: 'pure JS', color: '#10b981' },
      { label: 'Loss', value: 'Lossless', sub: 'no information lost', color: '#10b981' },
      { label: 'Tokens freed', value: '15–25%', sub: 'typical per run', color: '#10b981' },
      { label: 'LLM calls', value: '0', sub: 'no model cost', color: '#10b981' },
    ],
    source: 'microCompact.ts',
    interactions: 'Runs on every turn. Also invoked inside Full Compact as its preprocessing step, so L1 work is never wasted.',
  },
  l2: {
    icon: '📊', title: 'L2 — Auto-Compact', color: '#3b82f6',
    what: 'The orchestrator. Watches context size and picks the cheapest strategy that fits when the threshold is crossed.',
    how: 'Runs a 6-step decision tree: recursion guard → feature flags → token threshold → circuit breaker → strategy pick. Always tries the cheapest path first (Session Memory), falls back to Full Compact, and escalates to Emergency Snip only as a last resort.',
    items: [
      { icon: '🧠', label: 'Try Session Memory (L4)', result: '~70% success, <10ms — no LLM', highlight: true },
      { icon: '📝', label: 'Fall back to Full Compact (L3)', result: 'LLM summary, 5–30s' },
      { icon: '🚨', label: 'Escalate to Emergency Snip', result: 'only if the circuit breaker trips' },
    ],
    stats: [
      { label: 'Threshold', value: '167K', sub: '200K model – 20K – 13K', color: '#d97706' },
      { label: 'Reserved', value: '20K', sub: 'MAX_OUTPUT tokens', color: '#f59e0b' },
      { label: 'Buffer', value: '13K', sub: 'AUTOCOMPACT_BUFFER', color: '#f59e0b' },
      { label: 'Circuit breaker', value: '3', sub: 'consecutive failures', color: '#f43f5e' },
    ],
    source: 'autoCompact.ts',
    interactions: 'Called by the query loop before every API sampling. Routes traffic into L4, L3, or snip.',
  },
  l4: {
    icon: '🧠', title: 'L4 — Session Memory', color: '#f59e0b',
    what: 'Use pre-extracted session memories as the compression summary — no LLM call at compact time.',
    how: 'A background Fork Agent keeps a 10-section memory file up to date after each turn (triggered on 5K token growth + 3 tool calls). At compact time, the orchestrator swaps the file in place of old messages and keeps 10–40K tokens of recent context. Fastest working layer.',
    stats: [
      { label: 'Latency', value: '<10ms', sub: 'no LLM call', color: '#10b981' },
      { label: 'Success rate', value: '~70%', sub: 'of compact attempts', color: '#f59e0b' },
      { label: 'Sections', value: '10', sub: 'fixed structure', color: '#f59e0b' },
      { label: 'Recent kept', value: '10–40K', sub: 'tokens preserved', color: '#818cf8' },
      { label: 'Max file size', value: '12K', sub: 'tokens total', color: '#c084fc' },
      { label: 'Update trigger', value: '5K + 3', sub: 'growth + tool calls', color: '#c084fc' },
    ],
    source: 'sessionMemoryCompact.ts',
    interactions: 'Tried first by Auto-Compact. If stale or insufficient → returns null → Full Compact takes over. One slice of a 3-tier memory architecture (Session, Persistent, Team).',
  },
  l3: {
    icon: '📝', title: 'L3 — Full Compact', color: '#0ea5e9',
    what: 'Fork Agent reads the whole conversation and writes a structured 9-section summary. The expensive option.',
    how: 'Preprocess (strip images, attachments, normalize) → micro-compact → Fork Agent single-turn LLM call produces <analysis> + <summary> → delete <analysis>, keep <summary> → reassemble with recent messages and attachments. A NO_TOOLS_PREAMBLE prevents the fork from accidentally calling tools.',
    items: [
      { icon: '1', label: 'Preprocess', result: 'Strip images, attachments, normalize' },
      { icon: '2', label: 'Micro-Compact', result: 'Clear stale tool results first' },
      { icon: '3', label: 'Fork Agent', result: 'Single-turn LLM summary (5–30s)', highlight: true },
      { icon: '4', label: 'Format', result: 'Delete <analysis>, keep <summary>' },
      { icon: '5', label: 'Assemble', result: 'Summary + recent msgs + attachments' },
    ],
    stats: [
      { label: 'Latency', value: '5–30s', sub: 'LLM call required', color: '#f43f5e' },
      { label: 'Max output', value: '20K', sub: 'tokens (p99.99 ≈ 17.4K)', color: '#0ea5e9' },
      { label: 'Sections', value: '9', sub: 'structured summary', color: '#0ea5e9' },
      { label: 'PTL retries', value: 'Max 3', sub: 'truncate oldest 20%', color: '#f59e0b' },
    ],
    source: 'compact.ts',
    interactions: 'Fallback from Session Memory when memory is stale or insufficient. Shares the main prompt cache via Fork Agent.',
  },
  snip: {
    icon: '🚨', title: 'Emergency Snip', color: '#f43f5e',
    what: 'Drop the oldest messages. No summary, no backup, no ceremony. Last resort to keep the session alive.',
    how: 'Only fires when the circuit breaker trips after 3 consecutive compact failures. Rips out the oldest ~20% of the conversation until the window fits. Loses a lot of context, but the session stays up.',
    items: [
      { icon: '✅', label: 'failures < 3', result: 'Snip does not run — normal strategies try first' },
      { icon: '🚨', label: 'failures ≥ 3', result: 'TRIPPED — skip straight to snip', highlight: true },
    ],
    stats: [
      { label: 'Loss', value: 'HIGH', sub: 'no summary kept', color: '#f43f5e' },
      { label: 'Latency', value: '~0ms', sub: 'no LLM', color: '#10b981' },
      { label: 'BQ finding', value: '1,279', sub: 'sessions with 50+ failures', color: '#f59e0b' },
      { label: 'Waste prevented', value: '~250K', sub: 'API calls/day', color: '#10b981' },
    ],
    source: 'autoCompact.ts (snip path)',
    interactions: 'Invoked only when the circuit breaker trips. Should almost never fire in practice — its job is to keep a broken session breathing long enough for the user to reset it.',
  },
}

function S07_FourLayers() {
  return (
    <ReactFlowProvider>
      <S07FourLayersInner />
    </ReactFlowProvider>
  )
}

function S07FourLayersInner() {
  const { setNodes } = useReactFlow()
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
    // Let the zoom start (LayerNode handles that), then expand popup
    setTimeout(() => setIsOpen(true), 350)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    // Actively clear ReactFlow's selected class on all nodes so the CSS
    // transition on .ctx-node-inner fires (glow fades out, siblings undim
    // gradually over 0.5s) instead of the selection staying stuck visually.
    setNodes(ns => ns.map(n => (n.selected ? { ...n, selected: false } : n)))
    setTimeout(() => { setSelectedNode(null); setPopupOrigin(null) }, 500)
  }, [setNodes])

  const nodes: Node[] = useMemo(() => [
    {
      id: 'l1', type: 'layerNode', position: { x: 250, y: 0 },
      data: {
        icon: '✂️', label: 'L1 — Micro-Compact', latency: '<1ms', loss: 'Lossless', cost: 'No LLM',
        desc: 'Clear old tool results after cache expires',
        bg: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.15)', lossColor: '#10b981',
        _posX: 250, _posY: 0,
      },
    },
    {
      id: 'l2', type: 'layerNode', position: { x: 250, y: 150 },
      data: {
        icon: '📊', label: 'L2 — Auto-Compact', latency: '~0ms', loss: 'None', cost: 'No LLM',
        desc: 'Orchestrator: checks threshold, picks strategy',
        bg: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.15)', lossColor: '#3b82f6',
        _posX: 250, _posY: 150,
      },
    },
    {
      id: 'l4', type: 'layerNode', position: { x: 100, y: 320 },
      data: {
        icon: '🧠', label: 'L4 — Session Memory', latency: '<10ms', loss: 'Medium', cost: 'No LLM',
        desc: 'Use pre-extracted memories as summary',
        bg: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.15)', lossColor: '#f59e0b',
        _posX: 100, _posY: 320,
      },
    },
    {
      id: 'l3', type: 'layerNode', position: { x: 400, y: 320 },
      data: {
        icon: '📝', label: 'L3 — Full Compact', latency: '5-30s', loss: 'Medium', cost: '1 API call',
        desc: 'Fork Agent summarizes into 9 sections',
        bg: 'rgba(14,165,233,0.2)', borderColor: 'rgba(14,165,233,0.5)', glow: 'rgba(14,165,233,0.15)', lossColor: '#f59e0b',
        _posX: 400, _posY: 320,
      },
    },
    {
      id: 'snip', type: 'layerNode', position: { x: 250, y: 490 },
      data: {
        icon: '🚨', label: 'Emergency Snip', latency: '~0ms', loss: 'HIGH', cost: 'No LLM',
        desc: 'Drop oldest messages — absolute last resort',
        bg: 'rgba(244,63,94,0.2)', borderColor: 'rgba(244,63,94,0.5)', glow: 'rgba(244,63,94,0.15)', lossColor: '#f43f5e',
        _posX: 250, _posY: 490,
      },
    },
  ], [])

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'l1', target: 'l2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e2a', source: 'l2', target: 'l4', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, label: 'try first', labelStyle: { fill: '#6b6b66', fontSize: 11, fontFamily: 'var(--font-mono)' } },
    { id: 'e2b', source: 'l2', target: 'l3', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, label: 'fallback', labelStyle: { fill: '#6b6b66', fontSize: 11, fontFamily: 'var(--font-mono)' } },
    { id: 'e3', source: 'l4', target: 'snip', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 4' }, label: 'if fails', labelStyle: { fill: '#6b6b66', fontSize: 11, fontFamily: 'var(--font-mono)' } },
    { id: 'e4', source: 'l3', target: 'snip', animated: true, style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '6 4' }, label: 'if fails', labelStyle: { fill: '#6b6b66', fontSize: 11, fontFamily: 'var(--font-mono)' } },
  ], [])

  const detail = selectedNode ? LAYER_DETAILS[selectedNode] : null

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      <div className="reveal-stagger flex flex-col items-center gap-2 pt-8 z-10">
        <p className="slide-h3">The Architecture</p>
        <h2 className="slide-h2">4 Layers of Compression</h2>
        <p className="mono text-sm" style={{ color: 'var(--dim)' }}>click any layer to explore</p>
      </div>
      <div className="flex-1 w-full" style={{ minHeight: '60vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={layerNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={handleNodeClick}
        >
          <Background color="rgba(255,255,255,0.02)" gap={40} />
        </ReactFlow>
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
                <p style={{ fontSize: '1.35vw', color: 'var(--dim)', marginTop: '0.3vh', maxWidth: '55vw', lineHeight: 1.5 }}>
                  {detail.what}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              {/* ── Left: How + Items ── */}
              <div style={{ flex: detail.stats && detail.stats.length > 0 ? '1 1 55%' : '1 1 100%' }}>
                <div style={{ marginBottom: '2vh' }}>
                  <p className="mono font-bold" style={{ color: detail.color, fontSize: '1.15vw', marginBottom: '0.8vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>How it works</p>
                  <p style={{ fontSize: '1.2vw', color: 'var(--dim)', lineHeight: 1.6, maxWidth: '50vw' }}>{detail.how}</p>
                </div>

                {/* Items */}
                {detail.items && detail.items.length > 0 && (
                  <div className="flex flex-col gap-2" style={{ marginTop: '1vh' }}>
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl" style={{
                        padding: '1.2vh 1.2vw',
                        background: item.highlight ? detail.color + '18' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${item.highlight ? detail.color + '35' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                        <span style={{ fontSize: '1.55vw', lineHeight: 1 }}>{item.icon}</span>
                        <div className="flex-1">
                          <p style={{ fontSize: '1.15vw', color: 'var(--fg)', lineHeight: 1.4 }}>{item.label}</p>
                          <p className="mono" style={{ fontSize: '1.0vw', marginTop: '0.3vh', color: item.highlight ? detail.color : 'var(--dim)', fontWeight: item.highlight ? 700 : 400 }}>
                            {item.result}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Stats + Source ── */}
              {detail.stats && detail.stats.length > 0 && (
                <div style={{ flex: '1 1 42%' }}>
                  <p className="mono font-bold" style={{ color: detail.color, fontSize: '1.15vw', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Key Numbers</p>
                  <div className="grid grid-cols-2 gap-2">
                    {detail.stats.map((stat, i) => (
                      <div key={i} className="rounded-xl" style={{
                        padding: '1.3vh 1vw',
                        background: stat.color + '08',
                        border: `1px solid ${stat.color}20`,
                      }}>
                        <p className="mono font-bold" style={{ fontSize: '1.9vw', color: stat.color, lineHeight: 1.1 }}>{stat.value}</p>
                        <p style={{ fontSize: '1.05vw', color: 'var(--fg)', marginTop: '0.3vh' }}>{stat.label}</p>
                        {stat.sub && <p className="mono" style={{ fontSize: '0.9vw', color: 'var(--dim)', marginTop: '0.2vh' }}>{stat.sub}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Source + Interactions */}
                  <div className="rounded-xl" style={{ marginTop: '1.5vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono" style={{ fontSize: '1.0vw', color: 'var(--dim)' }}>
                      <span style={{ color: '#888' }}>Source: </span>
                      <code style={{ color: detail.color }}>{detail.source}</code>
                    </p>
                  </div>
                  <div className="rounded-xl" style={{ marginTop: '0.8vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono font-bold" style={{ fontSize: '1.0vw', color: detail.color, marginBottom: '0.4vh' }}>Interactions</p>
                    <p style={{ fontSize: '1.0vw', color: 'var(--dim)', lineHeight: 1.5 }}>{detail.interactions}</p>
                  </div>
                </div>
              )}

              {/* If no stats, show source/interactions inline */}
              {(!detail.stats || detail.stats.length === 0) && (
                <div style={{ flex: '0 0 30%' }}>
                  <div className="rounded-xl" style={{ padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono" style={{ fontSize: '1.0vw', color: 'var(--dim)' }}>
                      <span style={{ color: '#888' }}>Source: </span>
                      <code style={{ color: detail.color }}>{detail.source}</code>
                    </p>
                  </div>
                  <div className="rounded-xl" style={{ marginTop: '0.8vh', padding: '1.2vh 1vw', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="mono font-bold" style={{ fontSize: '1.0vw', color: detail.color, marginBottom: '0.4vh' }}>Interactions</p>
                    <p style={{ fontSize: '1.0vw', color: 'var(--dim)', lineHeight: 1.5 }}>{detail.interactions}</p>
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


// ─── Slide 9: Progressive Compression ───────────────────────────────────────

// ── Precomputed chart data for S09 — avoids recalculating on every render ────
const S09_LEVELS = [
  { icon: '✂️', name: 'L1 Micro-Compact', desc: 'Rule-based cleanup of old tool outputs', latency: '<1ms', loss: 'Lossless', lossColor: '#10b981', source: 'microCompact.ts', color: '#10b981' },
  { icon: '🎛️', name: 'L2 Auto-Compact Orchestrator', desc: 'Threshold check, circuit breaker, picks strategy', latency: '~0ms', loss: 'None', lossColor: '#10b981', source: 'autoCompact.ts', color: '#3b82f6' },
  { icon: '🧠', name: 'L4 Session Memory', desc: 'Pre-extracted memory as compression summary', latency: '<10ms', loss: 'Medium', lossColor: '#f59e0b', source: 'sessionMemoryCompact.ts', color: '#f59e0b' },
  { icon: '🤖', name: 'L3 Full Compact', desc: 'LLM summarizes conversation into 9 sections', latency: '5-30s', loss: 'Medium', lossColor: '#f59e0b', source: 'compact.ts', color: '#818cf8' },
  { icon: '🚨', name: 'Emergency Snip', desc: 'Oldest-first discard — absolute last resort', latency: '~0ms', loss: 'HIGH', lossColor: '#f43f5e', source: 'query.ts', color: '#f43f5e' },
] as const

const s09tx = (turn: number) => 60 + (turn - 1) * 37.5
const s09ty = (tokens: number) => 265 - (tokens / 180) * 240

const S09_LINE_DATA: [number, number][] = [
  [1,15],[2,25],[3,42],[4,55],[5,65],[6,85],[7,115],[8,170],
  [8,53],[9,65],[10,120],[11,170],
  [11,30],[12,70],[13,140],[14,172],[15,175],[16,175],[17,178],[18,180],
  [18,20],[19,35],[20,100],[21,165],
  [21,35],[22,165],[22,52],[23,165],[23,53],[24,165],[24,55],[25,165],[25,60],
]
const S09_PATH_D = S09_LINE_DATA.map(([t, v], i) =>
  `${i === 0 ? 'M' : 'L'} ${s09tx(t).toFixed(1)},${s09ty(v).toFixed(1)}`
).join(' ')

const S09_NORMAL_PTS: [number, number][] = [
  [1,15],[2,25],[3,42],[4,55],[5,65],[6,85],[7,115],[9,65],[10,120],[12,70],[13,140],[19,35],[20,100],
]
const S09_ABOVE_PTS: [number, number][] = [[14,172],[15,175],[16,175],[17,178]]
const S09_COMPACT_PTS: [number, number][] = [[8,167],[11,167],[18,167],[21,165],[22,165],[23,165],[24,165],[25,165]]
const S09_FREED_PTS: [number, number][] = [[8,53],[11,30],[18,20],[21,35],[22,52],[23,53],[24,55],[25,60]]
const S09_DROPS = [
  { turn: 8, from: 170, to: 53, label: '-117K' },
  { turn: 11, from: 170, to: 30, label: '-140K' },
  { turn: 18, from: 180, to: 20, label: '-160K' },
  { turn: 21, from: 165, to: 35, label: '-130K' },
  { turn: 22, from: 165, to: 52, label: '113K' },
  { turn: 23, from: 165, to: 53, label: '112K' },
  { turn: 24, from: 165, to: 55, label: '110K' },
  { turn: 25, from: 165, to: 60, label: '109K' },
] as const
const S09_COMPACT_TURNS = new Set([8, 9, 11, 18, 19, 21, 22, 23, 24, 25])
const S09_X_LABELS = [1, 3, 5, 7, 8, 9, 11, 13, 15, 17, 18, 19, 21, 22, 23, 24, 25] as const

function S09_ProgressiveCompression() {
  const levels = S09_LEVELS
  const tx = s09tx
  const ty = s09ty
  const pathD = S09_PATH_D
  const normalPts = S09_NORMAL_PTS
  const aboveThresholdPts = S09_ABOVE_PTS
  const compactPts = S09_COMPACT_PTS
  const freedPts = S09_FREED_PTS
  const drops = S09_DROPS
  const compactTurns = S09_COMPACT_TURNS
  const xLabels = S09_X_LABELS

  return (
    <div className="flex flex-col w-full" style={{ gap: '1.2vh' }}>
      {/* ── Title row ── */}
      <div className="cascade-item flex items-center justify-between" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 3, height: '2.2vw', background: '#10b981', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.65vw', fontWeight: 700, letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--fg)' }}>PRO</span>
            <span style={{ color: '#10b981' }}>GRESS</span>
            <span style={{ color: 'var(--fg)' }}>IVE COMPRESSION</span>
          </span>
        </div>
        <p className="mono" style={{ color: 'var(--dim)', fontSize: '0.8vw', maxWidth: '35%', textAlign: 'right', fontStyle: 'italic' }}>
          Delay expensive LLM calls as long as possible — only discard information as a last resort
        </p>
      </div>

      {/* ── Compression level cards ── */}
      <div className="flex gap-3 mobile-stack">
        {levels.map((lvl, i) => (
          <div
            key={i}
            className="cascade-item flex-1 rounded-xl"
            style={{
              animationDelay: `${0.2 + i * 0.1}s`,
              padding: '1vh 0.8vw',
              background: i === 4 ? 'rgba(244,63,94,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${lvl.color}22`,
              borderLeft: `3px solid ${lvl.color}`,
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4vh' }}>
              <span style={{ fontSize: '1.15vw' }}>{lvl.icon}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9vw', fontWeight: 700, color: lvl.color }}>
                {lvl.name}
              </span>
            </div>
            <p style={{ fontSize: '0.75vw', lineHeight: 1.4, color: 'var(--dim)', marginBottom: '0.6vh' }}>{lvl.desc}</p>
            <div className="flex gap-3 mono" style={{ fontSize: '0.65vw' }}>
              <div>
                <div style={{ fontSize: '0.55vw', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latency</div>
                <div style={{ color: '#10b981' }}>{lvl.latency}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.55vw', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Info Loss</div>
                <div style={{ color: lvl.lossColor, fontWeight: lvl.loss === 'HIGH' ? 800 : 400 }}>{lvl.loss}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.55vw', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source</div>
                <div style={{ color: 'var(--dim)' }}>{lvl.source}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cost gradient bar ── */}
      <div className="cascade-item flex items-center gap-2" style={{ animationDelay: '0.8s' }}>
        <span className="mono" style={{ fontSize: '0.7vw', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Cheap / Fast
        </span>
        <div className="flex-1" style={{ height: 4, borderRadius: 4, background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 40%, #f43f5e 100%)' }} />
        <span className="mono" style={{ fontSize: '0.7vw', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Expensive / Lossy
        </span>
      </div>

      {/* ── Context Token Timeline chart ── */}
      <div className="cascade-item flex-1 rounded-xl" style={{
        animationDelay: '1.0s',
        padding: '1vh 1vw',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5vh' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.0vw', fontWeight: 600, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Context Token Timeline
          </span>
          <span className="mono" style={{ fontSize: '0.75vw', color: 'var(--dim)' }}>26 turns</span>
        </div>

        <svg viewBox="0 0 1000 330" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="chartLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Y-axis label */}
          <text x="16" y={ty(90)} textAnchor="middle" fill="#666" fontSize="12" fontFamily="var(--font-mono)" transform={`rotate(-90, 16, ${ty(90)})`}>
            Tokens
          </text>

          {/* Y-axis grid + labels */}
          {[0, 50, 100, 150, 180].map(v => (
            <g key={v}>
              <line x1={60} y1={ty(v)} x2={970} y2={ty(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <text x={52} y={ty(v) + 4} textAnchor="end" fill="#555" fontSize="13" fontFamily="var(--font-mono)">
                {v === 0 ? '0' : `${v}K`}
              </text>
            </g>
          ))}

          {/* Threshold line (167K) — orange dashed */}
          <line x1={60} y1={ty(167)} x2={970} y2={ty(167)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8,5" opacity="0.7" />
          {/* Threshold label on left y-axis */}
          <text x={55} y={ty(167) + 5} fill="#f59e0b" fontSize="14" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="end">
            167K
          </text>

          {/* Drop lines (green dashed) + labels */}
          {drops.map((d, i) => (
            <g key={`drop-${i}`} className="chart-fade-in" style={{ animationDelay: `${1.6 + i * 0.12}s` }}>
              <line
                x1={tx(d.turn)} y1={ty(d.from)} x2={tx(d.turn)} y2={ty(d.to)}
                stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeDasharray="4,3"
              />
              <text
                x={tx(d.turn) + (i >= 4 ? 2 : 6)}
                y={(ty(d.from) + ty(d.to)) / 2 + 4}
                fill="#f59e0b" fontSize={i >= 4 ? '11' : '13'} fontWeight="700" fontFamily="var(--font-mono)"
              >
                {d.label}
              </text>
            </g>
          ))}

          {/* Main sawtooth line — purple */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#chartLineGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="draw-path-long"
            style={{ animationDelay: '1.2s' }}
          />

          {/* Normal points (purple/lavender) */}
          {normalPts.map(([t, v], i) => (
            <circle
              key={`n-${i}`}
              cx={tx(t)} cy={ty(v)} r="4.5"
              fill="#a78bfa" stroke="#5b21b6" strokeWidth="1.2"
              className="chart-fade-in"
              style={{ animationDelay: `${2.0 + i * 0.05}s` }}
            />
          ))}

          {/* Above-threshold points (first yellow, rest red) */}
          {aboveThresholdPts.map(([t, v], i) => (
            <circle
              key={`r-${i}`}
              cx={tx(t)} cy={ty(v)} r="5"
              fill={i === aboveThresholdPts.length - 1 ? '#f59e0b' : '#ef4444'} stroke={i === aboveThresholdPts.length - 1 ? '#92400e' : '#991b1b'} strokeWidth="1.2"
              className="chart-fade-in"
              style={{ animationDelay: `${2.2 + i * 0.07}s` }}
            />
          ))}

          {/* Compacted points (orange) */}
          {compactPts.map(([t, v], i) => (
            <circle
              key={`c-${i}`}
              cx={tx(t)} cy={ty(v)} r="5"
              fill="#f59e0b" stroke="#92400e" strokeWidth="1.2"
              className="chart-fade-in"
              style={{ animationDelay: `${2.3 + i * 0.07}s` }}
            />
          ))}

          {/* Freed points (green, at bottom of drops) */}
          {freedPts.map(([t, v], i) => (
            <circle
              key={`f-${i}`}
              cx={tx(t)} cy={ty(v)} r="4"
              fill="#10b981" stroke="#064e3b" strokeWidth="1.2"
              className="chart-fade-in"
              style={{ animationDelay: `${2.5 + i * 0.07}s` }}
            />
          ))}

          {/* X-axis turn labels — compaction turns in green */}
          {xLabels.map(t => (
            <text
              key={`xl-${t}`}
              x={tx(t)} y={288}
              textAnchor="middle"
              fill={compactTurns.has(t) ? '#10b981' : '#555'}
              fontSize="12"
              fontWeight={compactTurns.has(t) ? '700' : '400'}
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          ))}

          {/* X-axis label */}
          <text x={515} y={308} textAnchor="middle" fill="#666" fontSize="12" fontFamily="var(--font-mono)">
            Turns
          </text>

          {/* Legend */}
          <g transform="translate(250, 325)">
            <circle cx="0" cy="0" r="4" fill="#a78bfa" />
            <text x="10" y="4" fill="#888" fontSize="12" fontFamily="var(--font-mono)">Normal</text>
            <circle cx="90" cy="0" r="4" fill="#f59e0b" />
            <text x="100" y="4" fill="#888" fontSize="12" fontFamily="var(--font-mono)">Compacted</text>
            <circle cx="200" cy="0" r="4" fill="#ef4444" />
            <text x="210" y="4" fill="#888" fontSize="12" fontFamily="var(--font-mono)">Above threshold</text>
            <line x1="330" y1="0" x2="350" y2="0" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x="356" y="4" fill="#888" fontSize="12" fontFamily="var(--font-mono)">Freed</text>
            <line x1="400" y1="0" x2="425" y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8,5" />
            <text x="432" y="4" fill="#888" fontSize="12" fontFamily="var(--font-mono)">Threshold</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Slide 10: Level Transition ──────────────────────────────────────────────

function S10_GoDeeper() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <Particles count={10} color="#818cf8" />
      <div className="reveal-stagger flex flex-col items-center gap-8 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-1 rounded" style={{ background: '#d97706' }} />
          <span className="mono text-sm accent">Level 1 complete</span>
          <div className="w-12 h-1 rounded" style={{ background: '#d97706' }} />
        </div>

        <h2 className="slide-h2 text-center">
          Now let&apos;s look at each layer<br />
          <span className="accent2">up close</span>.
        </h2>

        <div className="flex gap-4 mt-4 mobile-wrap">
          {['L1 Micro', 'L2 Orchestrator', 'L4 Memory', 'L3 Full', 'Snip'].map((name, i) => (
            <div
              key={i}
              className="cascade-item px-4 py-2 rounded-full border mono text-sm"
              style={{
                animationDelay: `${0.5 + i * 0.15}s`,
                borderColor: 'rgba(129,140,248,0.3)',
                color: '#818cf8',
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <p className="mono text-sm mt-6" style={{ color: 'var(--dim)' }}>
          press → to continue
        </p>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const level1Slides = [
  S01_Cover,
  S02_Problem,
  S03_WhatFillsContext,
  S04_Growth,
  S05_Overflow,
  S06_Answer,
  S07_FourLayers,
  S09_ProgressiveCompression,
  S10_GoDeeper,
]
