# Compaction Algorithm Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static "Compaction Algorithm" text block on slide 18 (`S15b_SessionMemoryDeep` in `src/slides/Level2.tsx`) with an auto-looping `CompactionAnimation` component that cycles through four precomputed scenarios showing how `calculateMessagesToKeepIndex` processes a 10-message conversation.

**Architecture:** Single new local React component defined inside `Level2.tsx` above `S15b_SessionMemoryDeep`. Pure React + existing CSS — no new dependencies. All four scenarios are precomputed as static `Frame[]` arrays (no runtime algorithm), driven by a single frame index + scenario index state machine with `setTimeout`. Sub-renderers (`Header`, `MessageStrip`, `Counters`, `Narration`) are local functions in the same file.

**Tech Stack:** React 19 (function components, hooks), TypeScript 5.8 strict mode (`noUnusedLocals` on), Vite 6, Tailwind 4 utilities + inline style objects, existing CSS keyframes in `src/index.css`.

**Reference spec:** `docs/superpowers/specs/2026-04-10-compaction-algorithm-animation-design.md` — contains authoritative datasets, frame scripts, palette, and rendering rules. When a task says "per spec", re-read that section of the spec.

**Testing convention:** This project has **no test framework** (`package.json` has no test runner, no test files exist). The verification loop for every task is:
1. `npm run build` — must succeed with no new TypeScript or Vite errors.
2. `npm run dev` — open `http://localhost:5173`, press `End` (or click the last navigation dot) to get close, then navigate to slide 18.
3. Eyeball the Compaction Algorithm block (bottom-right column) against the task's expected visual.
4. Check browser DevTools console — no errors, no warnings, no leaked timers when navigating away and back.

Every task ends with a commit so progress is always recoverable.

---

## File Structure

**Modify:** `src/slides/Level2.tsx`
- Add `useEffect` (and later `useRef`) to the existing React import on line 6.
- Insert `CompactionAnimation` component + its helper types, constants, and sub-renderers immediately **above** `function S15b_SessionMemoryDeep()` (current line 2056).
- Inside `S15b_SessionMemoryDeep`, **replace** the static "Compaction Algorithm" block (current lines ~2238–2538, from `<p className="mono font-bold mb-1" ...>Compaction Algorithm` through the closing `</div>` of the containing box) with `<CompactionAnimation />`.
- Keep the `<p>Compaction Algorithm ...</p>` header inside the component itself, not in S15b.

**Do not modify:** `src/index.css`. All pulse/transition effects will use inline styles or existing CSS classes (`cascade-item`, etc.). If absolutely needed, a keyframe can be added at the end — but avoid it.

**Do not touch:** any other slide, any other file.

---

## Task 1: Static viz rendering S1 final frame

**Goal:** Replace the old algorithm block with a new `CompactionAnimation` component that renders all four scenarios' data but only displays **scenario 1's final frame** statically (no timer, no interaction). This proves the layout fits, colors are right, and the strip/counters/narration sub-components render correctly.

**Files:**
- Modify: `src/slides/Level2.tsx`

### Step 1 — Add `useEffect` to React import

- [ ] Change line 6 of `src/slides/Level2.tsx` from:

```tsx
import { useCallback, useMemo, useState, type ReactNode } from 'react'
```

to:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
```

(We add `useEffect` and `useRef` now even though Task 1 doesn't use them yet — Task 2 will. Importing unused names will fail `noUnusedLocals`, so we will **use** both `useEffect` and `useRef` in this same task as a tiny no-op to keep the build green. See Step 4 below.)

### Step 2 — Add types and constants above `S15b_SessionMemoryDeep`

- [ ] Insert the following block immediately above the existing comment `// ─── Slide 15b ...` (or above `function S15b_SessionMemoryDeep()` at line 2056):

```tsx
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
  | { kind: 'fixup'; pulledIdx: number }
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

const COMP_STEP_MS = 700
const COMP_HOLD_MS = 1500

// Palette — all colors already used elsewhere on slide 18
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
```

### Step 3 — Add the `SCENARIOS` constant with all four scenarios

- [ ] Immediately after the helpers from Step 2, insert the `SCENARIOS` constant. The datasets come directly from the spec (`## Scenario scripts`). Do not deviate from these numbers without updating the spec.

```tsx
const SCENARIOS: CompScenario[] = [
  // ── S1 — Normal expand + API-invariant fixup ────────────────────────────
  {
    id: 's1-expand',
    label: 'normal expand + fixup',
    lastSummarized: 4,
    messages: [
      { role: 'user',        tokens: 0.3, textBlock: true  },                       // 0
      { role: 'assistant',   tokens: 0.8, textBlock: true,  toolId: 'T1+T2' },      // 1 parallel tool_use
      { role: 'tool_result', tokens: 1.0, textBlock: false, toolId: 'T1' },         // 2
      { role: 'tool_result', tokens: 12,  textBlock: false, toolId: 'T2' },         // 3  big, orphan trigger
      { role: 'assistant',   tokens: 0.5, textBlock: true  },                       // 4
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T3' },         // 5
      { role: 'tool_result', tokens: 0.8, textBlock: false, toolId: 'T3' },         // 6
      { role: 'user',        tokens: 0.3, textBlock: true  },                       // 7
      { role: 'assistant',   tokens: 0.5, textBlock: true  },                       // 8
      { role: 'user',        tokens: 0.3, textBlock: true  },                       // 9
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
      { windowStart: 1, tokens: 15.6, blocks: 6, highlight: { kind: 'fixup', pulledIdx: 1 },
        narration: 'step 6: 📤 T2 at 3 orphaned · pull in msg 1 (🔧 T2)' },
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
      { role: 'user',      tokens: 0.3, textBlock: true },  // 0
      { role: 'assistant', tokens: 0.5, textBlock: true },  // 1
      { role: 'user',      tokens: 0.3, textBlock: true },  // 2
      { role: 'assistant', tokens: 11,  textBlock: true },  // 3
      { role: 'user',      tokens: 0.3, textBlock: true },  // 4
      { role: 'assistant', tokens: 0.5, textBlock: true },  // 5
      { role: 'user',      tokens: 0.3, textBlock: true },  // 6
      { role: 'assistant', tokens: 0.5, textBlock: true },  // 7
      { role: 'user',      tokens: 0.3, textBlock: true },  // 8
      { role: 'assistant', tokens: 0.5, textBlock: true },  // 9
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
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 0
      { role: 'assistant',   tokens: 0.5, textBlock: true  },                // 1
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T1' },  // 2
      { role: 'tool_result', tokens: 25,  textBlock: false, toolId: 'T1' },  // 3 HUGE
      { role: 'assistant',   tokens: 0.5, textBlock: true,  toolId: 'T2' },  // 4
      { role: 'tool_result', tokens: 18,  textBlock: false, toolId: 'T2' },  // 5 HUGE
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 6
      { role: 'assistant',   tokens: 0.4, textBlock: true,  toolId: 'T3' },  // 7
      { role: 'tool_result', tokens: 15,  textBlock: false, toolId: 'T3' },  // 8
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 9
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
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 0
      { role: 'assistant',   tokens: 0.5, textBlock: true  },                // 1
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 2
      { role: 'assistant',   tokens: 0.4, textBlock: true  },                // 3
      { role: 'assistant',   tokens: 0.4, textBlock: false, toolId: 'T1' },  // 4  pure tool_use
      { role: 'tool_result', tokens: 4,   textBlock: false, toolId: 'T1' },  // 5
      { role: 'assistant',   tokens: 0.4, textBlock: false, toolId: 'T2' },  // 6  pure tool_use
      { role: 'tool_result', tokens: 2,   textBlock: false, toolId: 'T2' },  // 7
      { role: 'user',        tokens: 0.3, textBlock: true  },                // 8
      { role: 'assistant',   tokens: 0.5, textBlock: true  },                // 9
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
```

### Step 4 — Add the `CompactionAnimation` component (static render, no state)

- [ ] Immediately after the `SCENARIOS` constant, add the component and its sub-renderers:

```tsx
function CompactionAnimation() {
  // Task 1: static render of S1's final frame. useEffect/useRef are imported
  // for Task 2 but must be referenced here to keep noUnusedLocals happy.
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => { /* intentionally empty for Task 1 */ }, [])

  const scenarioIdx = 0
  const frameIdx = SCENARIOS[0].frames.length - 1  // final frame of S1

  const scenario = SCENARIOS[scenarioIdx]
  const frame = scenario.frames[frameIdx]

  return (
    <div
      ref={rootRef}
      style={{
        padding: '0.8vh 0.9vw',
        background: '#0c0c14',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8vh',
      }}
    >
      <CompHeader scenarioIdx={scenarioIdx} scenario={scenario} paused={false} />
      <CompMessageStrip scenario={scenario} frame={frame} />
      <CompCounters frame={frame} />
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
    <div className="flex items-center" style={{ gap: '0.6vw' }}>
      <p className="mono font-bold" style={{ color: '#10b981', fontSize: '1vw', margin: 0 }}>
        Compaction Algorithm
      </p>
      <span className="mono" style={{ fontSize: '0.78vw', color: COMP_COLORS.dim }}>
        (animated)
      </span>
      <div className="flex items-center" style={{ gap: '0.35vw', marginLeft: 'auto' }}>
        <span className="mono" style={{ fontSize: '0.78vw', color: COMP_COLORS.dim }}>
          scenario {scenarioIdx + 1}/{SCENARIOS.length} · {scenario.label}
        </span>
        <div className="flex items-center" style={{ gap: '0.25vw' }}>
          {SCENARIOS.map((_, i) => (
            <span
              key={i}
              style={{
                width: '0.45vw',
                height: '0.45vw',
                borderRadius: '50%',
                background: i === scenarioIdx ? COMP_COLORS.window : 'rgba(255,255,255,0.18)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>
        <span className="mono" style={{ fontSize: '0.78vw', color: COMP_COLORS.dim, minWidth: '0.8vw', textAlign: 'center' }}>
          {paused ? '⏸' : '⏵'}
        </span>
      </div>
    </div>
  )
}

function CompMessageStrip({ scenario, frame }: { scenario: CompScenario; frame: CompFrame }) {
  const startIdx = scenario.lastSummarized + 1

  return (
    <div style={{ position: 'relative', padding: '1.2vh 0 1vh 0' }}>
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
          gap: '0.1vh',
        }}
      >
        <span className="mono" style={{ fontSize: '0.62vw', color: COMP_COLORS.lastSummarized, whiteSpace: 'nowrap' }}>
          lastSummarized
        </span>
        <span style={{ fontSize: '0.7vw', color: COMP_COLORS.lastSummarized, lineHeight: 1 }}>▼</span>
      </div>

      {/* Message cards row */}
      <div className="flex" style={{ gap: '0.25vw', width: '100%' }}>
        {scenario.messages.map((msg, i) => {
          const inWindow = i >= frame.windowStart
          const color = compRoleColor(msg.role)
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center mono"
              style={{
                flex: 1,
                height: '3.6vh',
                borderRadius: 4,
                border: `1px solid ${inWindow ? color : 'rgba(255,255,255,0.08)'}`,
                background: inWindow ? `${color}22` : 'rgba(255,255,255,0.02)',
                color: inWindow ? color : 'rgba(255,255,255,0.25)',
                fontSize: '0.85vw',
                transition: 'all 300ms ease',
                position: 'relative',
              }}
            >
              <span style={{ lineHeight: 1 }}>{compRoleGlyph(msg.role)}</span>
              <span style={{ fontSize: '0.55vw', opacity: 0.7, lineHeight: 1, marginTop: '0.15vh' }}>{i}</span>
            </div>
          )
        })}
      </div>

      {/* CompactBoundary dashed line (only if scenario defines boundaryAfter) */}
      {scenario.boundaryAfter !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '1.2vh',
            bottom: '1vh',
            left: `${(scenario.boundaryAfter + 1) * 10}%`,
            width: 0,
            borderLeft: `2px dashed ${COMP_COLORS.boundary}`,
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* Kept window bracket */}
      <div
        style={{
          position: 'relative',
          height: '1.2vh',
          marginTop: '0.3vh',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${frame.windowStart * 10}%`,
            width: `${(10 - frame.windowStart) * 10}%`,
            height: '100%',
            borderLeft: `2px solid ${COMP_COLORS.window}`,
            borderRight: `2px solid ${COMP_COLORS.window}`,
            borderBottom: `2px solid ${COMP_COLORS.window}`,
            borderTopWidth: 0,
            borderRadius: '0 0 4px 4px',
            transition: 'left 400ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
        <span
          className="mono"
          style={{
            position: 'absolute',
            left: `${frame.windowStart * 10 + (10 - frame.windowStart) * 5}%`,
            transform: 'translateX(-50%)',
            top: '1vh',
            fontSize: '0.62vw',
            color: COMP_COLORS.window,
            whiteSpace: 'nowrap',
            transition: 'left 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          kept window
        </span>
      </div>
    </div>
  )
}

function CompCounters({ frame }: { frame: CompFrame }) {
  const tokensPct = Math.min(100, (frame.tokens / 40) * 100)
  const tokensColor = frame.tokens > 40 ? COMP_COLORS.bust : COMP_COLORS.window

  return (
    <div className="flex flex-col" style={{ gap: '0.5vh', marginTop: '1.5vh' }}>
      {/* tokens bar */}
      <div className="flex items-center" style={{ gap: '0.6vw' }}>
        <span className="mono" style={{ fontSize: '0.75vw', color: COMP_COLORS.dim, width: '3vw' }}>tokens</span>
        <div
          style={{
            flex: 1,
            height: '0.9vh',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${tokensPct}%`,
              height: '100%',
              background: tokensColor,
              transition: 'width 400ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: '0.75vw', color: tokensColor, minWidth: '5vw', textAlign: 'right' }}>
          {frame.tokens.toFixed(1)}K / 40K
        </span>
      </div>
      {/* blocks pips */}
      <div className="flex items-center" style={{ gap: '0.6vw' }}>
        <span className="mono" style={{ fontSize: '0.75vw', color: COMP_COLORS.dim, width: '3vw' }}>blocks</span>
        <div className="flex" style={{ gap: '0.3vw', flex: 1 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const lit = i < frame.blocks
            return (
              <span
                key={i}
                style={{
                  width: '0.8vw',
                  height: '0.8vw',
                  borderRadius: '50%',
                  background: lit ? COMP_COLORS.window : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${lit ? COMP_COLORS.window : 'rgba(255,255,255,0.15)'}`,
                  transition: 'background 300ms ease',
                }}
              />
            )
          })}
        </div>
        <span className="mono" style={{ fontSize: '0.75vw', color: frame.blocks >= 5 ? COMP_COLORS.window : COMP_COLORS.dim, minWidth: '5vw', textAlign: 'right' }}>
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
        fontSize: '0.8vw',
        color: '#d1d5db',
        minHeight: '1.4vh',
        padding: '0.5vh 0.4vw',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '0.4vh',
      }}
    >
      ▸ {text}
    </div>
  )
}
```

### Step 5 — Replace the old algorithm block inside `S15b_SessionMemoryDeep`

- [ ] Inside `S15b_SessionMemoryDeep` (currently starts at line 2056), locate the right-column content. The right column wrapper is `<div style={{ flex: '1 1 48%' }}>` at around line 2181, containing first the "Real Template Format" box and then the "Compaction Algorithm" header + box.

- [ ] Delete everything from the line:

```tsx
          <p className="mono font-bold mb-1" style={{ color: '#10b981', fontSize: '1vw', marginTop: '0.8vh' }}>
            Compaction Algorithm <span style={{ color: '#6b6b66', fontWeight: 400, fontSize: '0.82vw' }}>(determines which recent messages to preserve)</span>
          </p>
```

through the closing `</div>` of the container `<div style={{ padding: '0.8vh 0.8vw', background: '#0c0c14', ... }}>` (inclusive). This is the entire old static pipeline (INPUT → STEP 1 → ... → RETURN).

- [ ] Replace it with a single line:

```tsx
          <div style={{ marginTop: '0.8vh' }}>
            <CompactionAnimation />
          </div>
```

The wrapping `<div style={{ marginTop: '0.8vh' }}>` preserves the vertical gap between Template Format and the viz.

### Step 6 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success with zero errors. If TypeScript complains about `rootRef` being unused, verify the `useRef` reference in Step 4 is present and attached to the root `<div ref={rootRef}>`. If `useEffect` is flagged unused, verify the empty effect in `CompactionAnimation` is present.

### Step 7 — Manual verification

- [ ] Run: `npm run dev`
- [ ] Open `http://localhost:5173` in a browser.
- [ ] Press `End` to jump to the last slide, then press `←` back to slide 18 (or click dots).
- [ ] Visual check: the bottom of the right column should show:
  - Header row: "Compaction Algorithm (animated)" on the left, "scenario 1/4 · normal expand + fixup" + 4 dots + ⏵ on the right
  - Below: 10 message cards in a row, the yellow `lastSummarized ▼` caret hovering above the gap before msg 5
  - Kept window bracket spans `[1..9]` (the final S1 state after fixup)
  - Tokens bar: partially filled green, showing `15.6K / 40K`
  - Blocks pips: all 5 lit green, showing `6 / 5 ✓`
  - Narration line: `▸ return: window = [1..9]`
- [ ] Check console — no errors.
- [ ] Visual check the left column: Key Differences and Tuning Constants should look identical to before.
- [ ] Visual check Template Format box (right column, top): unchanged.
- [ ] Ctrl+C to stop dev server.

### Step 8 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): scaffold CompactionAnimation with static S1 final frame

Replaces the static step-by-step Compaction Algorithm block with a new
CompactionAnimation component containing all four scenario datasets and
precomputed frames. Renders only S1's final frame for now - no state, no
animation. Layout, colors, and sub-renderers verified."
```

---

## Task 2: Animate S1 start-to-end (single scenario loop)

**Goal:** Wire up frame state + a `setTimeout`-driven advance so S1 plays from init → check → expand → expand → fixup → return and then loops back to init. Still only S1; scenario rotation comes in Task 3.

**Files:**
- Modify: `src/slides/Level2.tsx` (`CompactionAnimation` function only)

### Step 1 — Replace the static frame calculation with state

- [ ] In `CompactionAnimation`, replace:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => { /* intentionally empty for Task 1 */ }, [])

  const scenarioIdx = 0
  const frameIdx = SCENARIOS[0].frames.length - 1  // final frame of S1
```

with:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const scenarioIdx = 0  // Task 3 will promote this to state
  const [frameIdx, setFrameIdx] = useState(0)

  // Frame advance timer — Task 2: loop within a single scenario.
  useEffect(() => {
    const scenario = SCENARIOS[scenarioIdx]
    const isLast = frameIdx === scenario.frames.length - 1
    const delay = isLast ? COMP_HOLD_MS : COMP_STEP_MS
    const t = setTimeout(() => {
      setFrameIdx((i) => (i + 1) % scenario.frames.length)
    }, delay)
    return () => clearTimeout(t)
  }, [scenarioIdx, frameIdx])
```

### Step 2 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success. No new errors.

### Step 3 — Manual verification

- [ ] Run: `npm run dev`
- [ ] Navigate to slide 18.
- [ ] Watch the viz for one full loop (~6 seconds):
  - Frame 1: window [5..9], 2.3K, 4 blocks — narration "init: window = [5..9] ..."
  - Frame 2: same window, narration "step 3: tokens 2.3K < 10K ..." — 700 ms later
  - Frame 3: window slides left to [4..9], tokens tick to 2.8K, blocks go to 5, narration "step 4: ← msg 4 ..."
  - Frame 4: window slides to [3..9], tokens jump to 14.8K, narration "step 4: ← msg 3 ..."
  - Frame 5: window slides further to [1..9], narration "step 6: 📤 T2 at 3 orphaned ..."
  - Frame 6: narration "return: window = [1..9]", holds for ~1.5 s
  - Loop restarts at frame 1
- [ ] The green window bracket should glide smoothly (400 ms ease) — no jumps.
- [ ] Tokens bar width should animate smoothly.
- [ ] Navigate to another slide and back — the animation should restart cleanly, no console errors.
- [ ] Ctrl+C.

### Step 4 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): animate S1 frames with setTimeout-driven state

CompactionAnimation now loops through S1's 6 frames with 700ms step
duration and 1500ms hold on the final frame. Window bracket and
tokens bar glide smoothly between frames via CSS transitions."
```

---

## Task 3: Rotate through all 4 scenarios with crossfade

**Goal:** When a scenario's final frame + hold completes, advance to the next scenario (0→1→2→3→0). Add a 400 ms crossfade on the message strip when scenarios change.

**Files:**
- Modify: `src/slides/Level2.tsx` (`CompactionAnimation` function only)

### Step 1 — Promote `scenarioIdx` to state and add scenario advance

- [ ] In `CompactionAnimation`, replace:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const scenarioIdx = 0  // Task 3 will promote this to state
  const [frameIdx, setFrameIdx] = useState(0)

  // Frame advance timer — Task 2: loop within a single scenario.
  useEffect(() => {
    const scenario = SCENARIOS[scenarioIdx]
    const isLast = frameIdx === scenario.frames.length - 1
    const delay = isLast ? COMP_HOLD_MS : COMP_STEP_MS
    const t = setTimeout(() => {
      setFrameIdx((i) => (i + 1) % scenario.frames.length)
    }, delay)
    return () => clearTimeout(t)
  }, [scenarioIdx, frameIdx])
```

with:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)  // bumps on each scenario change for crossfade

  // Frame advance timer — advances within a scenario, then jumps to next scenario.
  useEffect(() => {
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
  }, [scenarioIdx, frameIdx])
```

### Step 2 — Wrap the message strip in a crossfade container

- [ ] In `CompactionAnimation`'s return, replace:

```tsx
      <CompMessageStrip scenario={scenario} frame={frame} />
```

with:

```tsx
      <div
        key={fadeKey}
        style={{
          animation: 'compFade 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <CompMessageStrip scenario={scenario} frame={frame} />
      </div>
```

The `key={fadeKey}` forces React to remount the wrapper on each scenario change, re-triggering the CSS animation.

### Step 3 — Register the `compFade` keyframes (inline `<style>` injection)

Rather than modifying `src/index.css`, inject a one-time `<style>` element at the top of `CompactionAnimation` so the keyframe lives beside the component that needs it.

- [ ] At the very top of the JSX returned by `CompactionAnimation` (right after the opening `<div ref={rootRef} ...>`), insert:

```tsx
      <style>{`
        @keyframes compFade {
          0% { opacity: 0; transform: translateY(2px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
```

### Step 4 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success.

### Step 5 — Manual verification

- [ ] Run: `npm run dev`, navigate to slide 18.
- [ ] Watch the full ~21-second loop:
  - Scenario 1 (normal expand + fixup) plays start-to-finish (~5.7 s)
  - Crossfade (400 ms) to Scenario 2 — the 4 dots shift the active dot from position 1 to position 2, "scenario 2/4 · already satisfied" appears in the header, message strip fades in with different colors (all blue/indigo, no orange/teal). Window starts at [3..9] and returns immediately.
  - Crossfade to Scenario 3 — different dataset with huge tool_result cards. Expand runs twice, then msg 3 flashes... actually wait, the reject flash comes in Task 4. For Task 3, msg 3 is simply not added to the window; the narration just says "reject · stop".
  - Crossfade to Scenario 4 — dataset with pure tool_use msgs (4 and 6). Expand runs twice, then narration says "cannot cross CompactBoundary". Boundary visualization (dashed purple line) visible — note that dashed line is already rendered from Task 1 because `boundaryAfter` is defined; the pulse effect comes in Task 4.
  - Loops back to Scenario 1.
- [ ] Active scenario dot moves correctly with each transition.
- [ ] No console errors; no broken animations.
- [ ] Ctrl+C.

### Step 6 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): rotate through all 4 compaction scenarios

Each scenario plays its full frame sequence, then crossfades (400ms)
to the next. Loop order: S1 → S2 → S3 → S4 → S1. Scenario dots in
header track the active one. fadeKey forces message strip remount on
each scenario change to re-trigger the compFade keyframe."
```

---

## Task 4: Reject flash (S3) and boundary pulse (S4) effects

**Goal:** When S3 reaches its reject frame, msg 3's card briefly pulses red and the tokens bar momentarily overfills red before snapping back. When S4 reaches its boundary frame, the dashed boundary line pulses purple.

**Files:**
- Modify: `src/slides/Level2.tsx` (`CompMessageStrip` and `CompCounters`)

### Step 1 — Add reject pulse to the message card

- [ ] In `CompMessageStrip`, replace the card-rendering block:

```tsx
        {scenario.messages.map((msg, i) => {
          const inWindow = i >= frame.windowStart
          const color = compRoleColor(msg.role)
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center mono"
              style={{
                flex: 1,
                height: '3.6vh',
                borderRadius: 4,
                border: `1px solid ${inWindow ? color : 'rgba(255,255,255,0.08)'}`,
                background: inWindow ? `${color}22` : 'rgba(255,255,255,0.02)',
                color: inWindow ? color : 'rgba(255,255,255,0.25)',
                fontSize: '0.85vw',
                transition: 'all 300ms ease',
                position: 'relative',
              }}
            >
              <span style={{ lineHeight: 1 }}>{compRoleGlyph(msg.role)}</span>
              <span style={{ fontSize: '0.55vw', opacity: 0.7, lineHeight: 1, marginTop: '0.15vh' }}>{i}</span>
            </div>
          )
        })}
```

with:

```tsx
        {scenario.messages.map((msg, i) => {
          const inWindow = i >= frame.windowStart
          const color = compRoleColor(msg.role)
          const isRejected = frame.highlight.kind === 'reject' && frame.highlight.rejectedIdx === i
          const isJustAdded = frame.highlight.kind === 'expand' && frame.highlight.addedIdx === i
          const isFixupPull = frame.highlight.kind === 'fixup' && frame.highlight.pulledIdx === i

          let pulseBorder = inWindow ? color : 'rgba(255,255,255,0.08)'
          let pulseBg = inWindow ? `${color}22` : 'rgba(255,255,255,0.02)'
          let boxShadow: string | undefined
          if (isRejected) {
            pulseBorder = COMP_COLORS.bust
            pulseBg = `${COMP_COLORS.bust}33`
            boxShadow = `0 0 10px ${COMP_COLORS.bust}99`
          } else if (isJustAdded) {
            boxShadow = `0 0 8px ${COMP_COLORS.window}aa`
          } else if (isFixupPull) {
            boxShadow = `0 0 10px ${COMP_COLORS.fixup}aa`
          }

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center mono"
              style={{
                flex: 1,
                height: '3.6vh',
                borderRadius: 4,
                border: `1px solid ${pulseBorder}`,
                background: pulseBg,
                color: inWindow || isRejected ? (isRejected ? COMP_COLORS.bust : color) : 'rgba(255,255,255,0.25)',
                fontSize: '0.85vw',
                transition: 'all 300ms ease',
                position: 'relative',
                boxShadow,
                transform: isRejected || isJustAdded || isFixupPull ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <span style={{ lineHeight: 1 }}>{compRoleGlyph(msg.role)}</span>
              <span style={{ fontSize: '0.55vw', opacity: 0.7, lineHeight: 1, marginTop: '0.15vh' }}>{i}</span>
            </div>
          )
        })}
```

### Step 2 — Add boundary pulse to the dashed line

- [ ] In `CompMessageStrip`, replace the boundary line block:

```tsx
      {/* CompactBoundary dashed line (only if scenario defines boundaryAfter) */}
      {scenario.boundaryAfter !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '1.2vh',
            bottom: '1vh',
            left: `${(scenario.boundaryAfter + 1) * 10}%`,
            width: 0,
            borderLeft: `2px dashed ${COMP_COLORS.boundary}`,
            transform: 'translateX(-50%)',
          }}
        />
      )}
```

with:

```tsx
      {/* CompactBoundary dashed line (only if scenario defines boundaryAfter) */}
      {scenario.boundaryAfter !== undefined && (() => {
        const isPulsing = frame.highlight.kind === 'boundary' && frame.highlight.boundaryIdx === scenario.boundaryAfter
        return (
          <div
            style={{
              position: 'absolute',
              top: '1.2vh',
              bottom: '1vh',
              left: `${(scenario.boundaryAfter + 1) * 10}%`,
              width: 0,
              borderLeft: `${isPulsing ? 3 : 2}px dashed ${COMP_COLORS.boundary}`,
              transform: 'translateX(-50%)',
              boxShadow: isPulsing ? `0 0 12px ${COMP_COLORS.boundary}` : undefined,
              transition: 'border-left-width 200ms ease, box-shadow 300ms ease',
            }}
          />
        )
      })()}
```

### Step 3 — Add maxTokens overflow flash to the tokens bar

- [ ] In `CompCounters`, replace:

```tsx
function CompCounters({ frame }: { frame: CompFrame }) {
  const tokensPct = Math.min(100, (frame.tokens / 40) * 100)
  const tokensColor = frame.tokens > 40 ? COMP_COLORS.bust : COMP_COLORS.window
```

with:

```tsx
function CompCounters({ frame }: { frame: CompFrame }) {
  const isReject = frame.highlight.kind === 'reject'
  // During a reject frame, visually show the would-be overflow (100% red) before the frame's real value
  const tokensPct = isReject ? 100 : Math.min(100, (frame.tokens / 40) * 100)
  const tokensColor = isReject || frame.tokens > 40 ? COMP_COLORS.bust : COMP_COLORS.window
```

### Step 4 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success.

### Step 5 — Manual verification

- [ ] Run: `npm run dev`, navigate to slide 18.
- [ ] Wait for S1: verify that during frames 3 and 4 ("expand ← msg 4" and "expand ← msg 3"), the newly-added card briefly glows green and scales up slightly.
- [ ] S1 frame 5 ("fixup"): msg 1 card briefly glows purple and scales up. Window slides left to include it.
- [ ] Wait for S3 reject frame: msg 3's card flashes red and scales up, tokens bar fills 100% red for ~700 ms, narration reads "step 4: ← msg 3 would be 59.5K > 40K · reject · stop". Then the return frame: bar snaps back to ~86% (34.5K / 40K) green.
- [ ] Wait for S4 boundary frame: the dashed purple line between msgs 4 and 5 thickens and glows. Window stops at [5..9].
- [ ] Console: no errors.
- [ ] Ctrl+C.

### Step 6 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): reject flash, fixup glow, boundary pulse

Expand/fixup frames now briefly glow and scale the newly-added card.
S3 reject frame flashes msg 3 red and overfills tokens bar to 100%
before snapping back in the return frame. S4 boundary frame thickens
and glows the dashed boundary line."
```

---

## Task 5: Hover pause + tab visibility pause

**Goal:** Hovering anywhere on the viz pauses the frame timer. Leaving resumes from the current frame. Switching tabs (browser `visibilitychange`) also pauses. The header pause glyph reflects the state.

**Files:**
- Modify: `src/slides/Level2.tsx` (`CompactionAnimation`)

### Step 1 — Add paused state and wire up handlers

- [ ] In `CompactionAnimation`, replace the state declarations + effect:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)

  useEffect(() => {
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
  }, [scenarioIdx, frameIdx])
```

with:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [visPaused, setVisPaused] = useState(
    typeof document !== 'undefined' && document.visibilityState !== 'visible'
  )
  const paused = hoverPaused || visPaused

  // Visibility listener
  useEffect(() => {
    const onVis = () => setVisPaused(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Frame advance timer — paused when hovered or tab is hidden
  useEffect(() => {
    if (paused) return
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
  }, [paused, scenarioIdx, frameIdx])
```

### Step 2 — Attach hover handlers to the root `<div>` and pass `paused` to Header

- [ ] In `CompactionAnimation`'s return, replace:

```tsx
    <div
      ref={rootRef}
      style={{
        padding: '0.8vh 0.9vw',
        background: '#0c0c14',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8vh',
      }}
    >
```

with:

```tsx
    <div
      ref={rootRef}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      style={{
        padding: '0.8vh 0.9vw',
        background: '#0c0c14',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8vh',
      }}
    >
```

- [ ] Change the `<CompHeader ... paused={false} />` call to `<CompHeader ... paused={paused} />`.

### Step 3 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success.

### Step 4 — Manual verification

- [ ] Run: `npm run dev`, navigate to slide 18.
- [ ] Hover the mouse over the viz: the header glyph should change from `⏵` to `⏸`, and the animation should freeze at the current frame. Leave: glyph returns to `⏵` and animation resumes.
- [ ] Switch to another browser tab for a few seconds, then come back: animation should have paused while hidden. (You can verify by watching the frame at tab-away, switching, waiting 5 seconds, coming back, and confirming the next step fires ~700ms after return, not immediately.)
- [ ] Navigate away from slide 18 and back: animation restarts cleanly, no leaked timers (check React DevTools or simply confirm no console errors after ~30 seconds of navigation).
- [ ] Ctrl+C.

### Step 5 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): pause compaction viz on hover and tab-away

Hovering anywhere on the animated block sets hoverPaused; leaving
resumes. A visibilitychange listener sets visPaused when the tab is
hidden. The frame-advance effect bails out early if either is true.
Header glyph reflects the paused state."
```

---

## Task 6: Reduced-motion fallback

**Goal:** When `prefers-reduced-motion: reduce` is set, disable intra-scenario frame animation. Show each scenario's **final** frame only and rotate scenarios every 4 seconds. CSS transitions on the window bracket and tokens bar also become instant (0 ms).

**Files:**
- Modify: `src/slides/Level2.tsx` (`CompactionAnimation` and `CompMessageStrip` + `CompCounters` for transition overrides)

### Step 1 — Detect reduced-motion preference

- [ ] In `CompactionAnimation`, add a `reducedMotion` state just below the other state declarations:

```tsx
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
```

### Step 2 — Branch the frame-advance effect on reducedMotion

- [ ] Replace the frame advance effect added in Task 5:

```tsx
  // Frame advance timer — paused when hovered or tab is hidden
  useEffect(() => {
    if (paused) return
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
  }, [paused, scenarioIdx, frameIdx])
```

with:

```tsx
  // Frame advance — two modes:
  //  - normal: step through each frame of a scenario, then advance scenario
  //  - reduced motion: skip straight to each scenario's final frame, rotate every 4s
  useEffect(() => {
    if (paused) return

    if (reducedMotion) {
      // Park on final frame, rotate scenarios on a slow timer
      const scenario = SCENARIOS[scenarioIdx]
      const finalIdx = scenario.frames.length - 1
      if (frameIdx !== finalIdx) {
        setFrameIdx(finalIdx)
        return
      }
      const t = setTimeout(() => {
        setScenarioIdx((s) => (s + 1) % SCENARIOS.length)
        setFrameIdx(0)  // will immediately bounce to finalIdx via the branch above
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
```

### Step 3 — Thread `reducedMotion` into the sub-renderers via component props

- [ ] Update the `CompMessageStrip` prop type and function signature to accept `reducedMotion`:

```tsx
function CompMessageStrip({
  scenario,
  frame,
  reducedMotion,
}: {
  scenario: CompScenario
  frame: CompFrame
  reducedMotion: boolean
}) {
```

- [ ] Inside `CompMessageStrip`, use `reducedMotion` to zero out the window-bracket transition. Find the bracket `<div>`:

```tsx
            transition: 'left 400ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1)',
```

and replace with:

```tsx
            transition: reducedMotion
              ? 'none'
              : 'left 400ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1)',
```

- [ ] Do the same for the "kept window" label span transition. In that span's style object, replace:

```tsx
            transition: 'left 400ms cubic-bezier(0.16,1,0.3,1)',
```

with:

```tsx
            transition: reducedMotion ? 'none' : 'left 400ms cubic-bezier(0.16,1,0.3,1)',
```

- [ ] In the card-rendering block, zero out card transitions and transforms when `reducedMotion`:

Replace:

```tsx
                transition: 'all 300ms ease',
```

with:

```tsx
                transition: reducedMotion ? 'none' : 'all 300ms ease',
```

And replace:

```tsx
                transform: isRejected || isJustAdded || isFixupPull ? 'scale(1.08)' : 'scale(1)',
```

with:

```tsx
                transform: !reducedMotion && (isRejected || isJustAdded || isFixupPull) ? 'scale(1.08)' : 'scale(1)',
```

- [ ] Update the `CompCounters` prop type similarly:

```tsx
function CompCounters({ frame, reducedMotion }: { frame: CompFrame; reducedMotion: boolean }) {
```

And inside, replace:

```tsx
              transition: 'width 400ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
```

with:

```tsx
              transition: reducedMotion
                ? 'none'
                : 'width 400ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
```

- [ ] Pass `reducedMotion` from `CompactionAnimation` to both sub-renderers:

```tsx
      <div
        key={fadeKey}
        style={{
          animation: reducedMotion ? 'none' : 'compFade 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <CompMessageStrip scenario={scenario} frame={frame} reducedMotion={reducedMotion} />
      </div>
      <CompCounters frame={frame} reducedMotion={reducedMotion} />
```

### Step 4 — Build

- [ ] Run: `npm run build`
- [ ] Expected: success.

### Step 5 — Manual verification (reduced motion ON)

- [ ] Run: `npm run dev`, navigate to slide 18.
- [ ] Open DevTools → Rendering tab → emulate CSS media feature `prefers-reduced-motion: reduce`.
- [ ] Observe: the viz now shows each scenario's **final** frame only (S1: window [1..9], 15.6K, 6 blocks; S2: window [3..9], 13.4K, 7 blocks; S3: window [4..9], 34.5K, 4 blocks; S4: window [5..9], 7.2K, 2 blocks). No intra-scenario steps.
- [ ] Scenarios rotate every 4 seconds. No crossfade animation (stripfade `animation: none`), no smooth window bracket glide (snap instantly), no card scale pulses.

### Step 6 — Manual verification (reduced motion OFF)

- [ ] Disable the DevTools override.
- [ ] Confirm the viz returns to normal animated behavior (full frame sequences, crossfades, pulses).
- [ ] Ctrl+C.

### Step 7 — Commit

- [ ] Run:

```bash
git add src/slides/Level2.tsx
git commit -m "feat(slide 18): reduced-motion fallback for compaction viz

Respects prefers-reduced-motion: reduce by skipping intra-scenario
frame animation, parking on each scenario's final frame, and rotating
scenarios every 4 seconds. CSS transitions on the window bracket,
tokens bar, card pulses, and scenario crossfade are zeroed out. A
matchMedia listener updates the state reactively if the preference
changes mid-session."
```

---

## Final Verification

After Task 6 is committed, perform a full walk-through:

- [ ] `npm run build` — zero errors.
- [ ] `npm run dev` — open slide 18.
- [ ] Watch one full ~21-second loop. Confirm:
  - S1: init → step 3 fail → expand msg 4 (green pulse, blocks 4→5) → expand msg 3 (green pulse, tokens jump) → fixup msg 1 (purple pulse, window slides left) → return
  - S2: init → step 3 pass (early return) → return
  - S3: init → step 3 fail → expand msg 5 → expand msg 4 → reject msg 3 (red flash, tokens bar hits 100% red) → return (snaps back to ~86% green)
  - S4: init → step 3 fail → expand msg 6 → expand msg 5 → boundary pulse (dashed purple glows) → return
- [ ] Left column (Key Differences, Tuning Constants) unchanged.
- [ ] Right column top (Real Template Format) unchanged.
- [ ] Hover the viz: pauses. Leave: resumes. Header glyph toggles `⏵`/`⏸`.
- [ ] Tab-away for 5 seconds: pauses. Tab back: resumes.
- [ ] DevTools → emulate `prefers-reduced-motion: reduce`: viz simplifies to final-frame-per-scenario rotating every 4s.
- [ ] DevTools Console: no errors, no leaked timer warnings.
- [ ] Navigate to slide 17 and back to 18: animation restarts clean.
- [ ] Navigate to slide 19 and back: animation restarts clean.
- [ ] Run `git log --oneline -6` — should see six new commits, one per task.

If any verification step fails, fix it in a follow-up commit on the same branch. Do not amend earlier task commits — the task history is the review log.
