# Slide 18 — Animated Compaction Algorithm Visualization

**Date:** 2026-04-10
**Slide:** 18 (`S15b_SessionMemoryDeep` in `src/slides/Level2.tsx`)
**Replaces:** the static step-by-step "Compaction Algorithm" block at the bottom of the right column (currently lines ~2238–2538 of `Level2.tsx`).

## Goal

Replace the text-based algorithm box with a live animated visualization that shows how `calculateMessagesToKeepIndex` processes a conversation — messages appearing, the "kept window" growing leftward, counters ticking up, and step 6 (`adjustIndexToPreserveAPIInvariants`) pulling in extra messages at the end. The viz cycles through four scenarios covering the four interesting paths through the algorithm.

## Scope

- **Keep untouched:** the "Key Differences" table, the "Tuning Constants & Invariants" card, and the "Real Template Format" box. Only the box below Template Format on the right column changes.
- **Do not expand** the slide horizontally or vertically — the viz must fit in the ~50vh × ~44vw space currently occupied by the static algorithm.
- **Do not add new third-party dependencies.** Pure React + existing CSS.

## Layout

```
┌─ Compaction Algorithm ──── scenario 1/4  normal expand ●○○○ ⏯─┐
│                                                                │
│   msgs[]:                                                      │
│         ┌lastSummarized                                        │
│         ▼                                                      │
│   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                              │
│   │ u│ a│🔧│📤│🔧│📤│ a│ u│ a│ u│                              │
│   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                              │
│    0  1  2  3  4  5  6  7  8  9                                │
│                  └──── kept window ────┘                       │
│                                                                │
│   tokens  ████████░░░░░░░░░░  14.8K / 40K                      │
│   blocks  ● ● ● ● ● ○ ○ ○ ○ ○  5 / 5  ✓                       │
│                                                                │
│   ▸ step 4: expand ← msg 3 · +12K · blocks 5 ✓ · stop          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Regions:**

1. **Header row** (~3vh): title text on the left, scenario pill (e.g. `1/4 normal expand`) in the middle, 4 scenario dots, small pause indicator.
2. **Message strip** (~14vh): 10 cards in a row, each ~3vw wide, color-coded by role. A small yellow downward caret + label "lastSummarized" sits above the strip pointing at the relevant card gap. Cards outside the kept window are desaturated (~40% opacity); cards inside are full-color. A green bracket sits below the strip indicating the kept window range, with its left edge animating via `transform: translateX(...)` on step changes.
3. **Counters row** (~7vh): tokens progress bar (width proportional to `tokens / 40K`, green → red as it approaches cap) + 5 circular pips for blocks. When a step updates either, the delta pulses briefly via a quick `scale(1.08)` + color flash.
4. **Narration line** (~4vh): single line of monospace text, updated on each frame. Format: `▸ step N: <action> · <delta> · <state>`.
5. **Padding / breathing room:** remaining ~22vh distributed as internal padding and gaps.

## Data model

```ts
type Role = 'user' | 'assistant' | 'tool_use' | 'tool_result'

type Message = {
  role: Role
  tokens: number          // in thousands, e.g. 12 = 12K
  textBlock: boolean      // see "text block rule" below
  toolId?: string         // links tool_use ↔ tool_result
  label?: string          // optional short display (e.g. 'Read auth.ts')
}
```

**Text block rule** (for `minTextBlocks = 5`):
- `user` messages → always `textBlock: true`
- `assistant` messages with text content → `textBlock: true` (even if they also carry a `tool_use`)
- `assistant` messages that are *pure* tool_use (no text) → `textBlock: false`
- `tool_result` messages → `textBlock: false`

This is how the viz interprets the "minTextBlockMessages" counter. Real Claude Code counts message content blocks, not messages — but for visualization purposes this per-message approximation is accurate enough and much easier to narrate.

type Highlight =
  | { kind: 'idle' }
  | { kind: 'check'; result: 'pass' | 'fail' }
  | { kind: 'expand'; addedIdx: number }
  | { kind: 'reject'; rejectedIdx: number; reason: 'maxTokens' }
  | { kind: 'boundary'; boundaryIdx: number }
  | { kind: 'fixup'; pulledIdx: number }
  | { kind: 'return' }

type Frame = {
  windowStart: number     // current kept-window left edge
  tokens: number          // running total (K)
  blocks: number          // running text-block count
  highlight: Highlight
  narration: string
}

type Scenario = {
  id: 's1-expand' | 's2-satisfied' | 's3-maxtokens' | 's4-boundary'
  label: string           // e.g. 'normal expand'
  messages: Message[]     // fixed 10 entries
  boundaryAfter?: number  // index after which a CompactBoundary sits (S4 only)
  lastSummarized: number  // initial index, before startIdx=+1
  frames: Frame[]         // precomputed frame sequence
}
```

All scenarios use exactly 10 messages to keep the strip layout stable (only the role/label/tokens change).

**Message strip rendering rules, given current `frame`:**

- Cards at index `< frame.windowStart` → desaturated (~40% opacity), grayscale border
- Cards at index `≥ frame.windowStart` → full color by role
- If `highlight.kind === 'reject'`, the card at `rejectedIdx` pulses red for the frame duration but is NOT added to the window (window stays put)
- If `highlight.kind === 'expand'`, the card at `addedIdx` gets a brief green scale pulse
- If `highlight.kind === 'fixup'`, the card at `pulledIdx` gets a purple scale pulse; the window bracket slides left to include it
- If `highlight.kind === 'boundary'`, the dashed boundary line pulses purple for ~600 ms; no window change
- `lastSummarized` caret is fixed per scenario and always visible
- CompactBoundary dashed line is only visible in S4

## Scenario scripts

### S1 — Normal expand + API-invariant fixup

**Dataset (10 msgs):**

| idx | role         | tokens | toolId | text? | notes |
|-----|--------------|--------|--------|-------|-------|
| 0   | user         | 0.3    |        | ✓     |       |
| 1   | assistant    | 0.8    | T1+T2  | ✓     | parallel tool_use: T1 and T2 |
| 2   | tool_result  | 1.0    | T1     | ✗     | small |
| 3   | tool_result  | 12.0   | T2     | ✗     | **big — the orphan trigger** |
| 4   | assistant    | 0.5    |        | ✓     |       |
| 5   | assistant    | 0.4    | T3     | ✓     | single tool_use |
| 6   | tool_result  | 0.8    | T3     | ✗     |       |
| 7   | user         | 0.3    |        | ✓     |       |
| 8   | assistant    | 0.5    |        | ✓     |       |
| 9   | user         | 0.3    |        | ✓     |       |

`lastSummarized = 4` → initial `startIdx = 5`

**Frames:**

1. **init** — `windowStart=5`, tokens=2.3K (u+a+🔧+📤+u = 0.3+0.5+0.4+0.8+0.3), blocks=4 (5,6 are a text-bearing? let me recount — 5=a ✓, 6=📤 ✗, 7=u ✓, 8=a ✓, 9=u ✓ → 4 blocks). narration: "init: window = [5..9] · 2.3K tokens · 4 blocks"
2. **check** — highlight `check/fail`. narration: "step 3: tokens 2.3K < 10K · blocks 4 < 5 → expand"
3. **expand ← 4** — windowStart=4, tokens=2.8K (+0.5), blocks=5. narration: "step 4: ← msg 4 · blocks 4→5 ✓"
4. **expand ← 3** — windowStart=3, tokens=14.8K (+12), blocks=5. narration: "step 4: ← msg 3 · +12K · tokens ✓ · stop"
5. **fixup** — highlight `fixup/pulledIdx=1`. windowStart=1. narration: "step 6: 📤 T2 at 3 orphaned · pull in msg 1 (🔧 T2)"
6. **return** — narration: "return: window = [1..9]"

*Note:* counts above assume assistant messages with tool_use still count as text blocks. Re-verify when implementing; adjust exact numbers if needed but the story is the same.

### S2 — Already satisfied (no expansion)

**Dataset:**

| idx | role      | tokens | text? |
|-----|-----------|--------|-------|
| 0   | user      | 0.3    | ✓     |
| 1   | assistant | 0.5    | ✓     |
| 2   | user      | 0.3    | ✓     |
| 3   | assistant | 11.0   | ✓     |
| 4   | user      | 0.3    | ✓     |
| 5   | assistant | 0.5    | ✓     |
| 6   | user      | 0.3    | ✓     |
| 7   | assistant | 0.5    | ✓     |
| 8   | user      | 0.3    | ✓     |
| 9   | assistant | 0.5    | ✓     |

`lastSummarized = 2` → `startIdx = 3`

**Frames:**

1. **init** — windowStart=3, tokens=13.4K, blocks=7. narration: "init: window = [3..9] · 13.4K tokens · 7 blocks"
2. **check** — highlight `check/pass`. narration: "step 3: tokens 13.4K ≥ 10K ✓ · blocks 7 ≥ 5 ✓ → return early"
3. **return** — narration: "return: window = [3..9] · zero expansion"

### S3 — Expand hits maxTokens

**Dataset:**

| idx | role         | tokens | toolId | text? |
|-----|--------------|--------|--------|-------|
| 0   | user         | 0.3    |        | ✓     |
| 1   | assistant    | 0.5    |        | ✓     |
| 2   | assistant    | 0.4    | T1     | ✓     |
| 3   | tool_result  | 25.0   | T1     | ✗     | HUGE |
| 4   | assistant    | 0.5    |        | ✓     |
| 5   | tool_result  | 18.0   | T2     | ✗     | HUGE — sits at idx 5; its T2 is at idx 4 (combined in the `assistant` at 4 with an inline tool_use for compactness — treat idx 4 as "a+🔧 T2") |
| 6   | user         | 0.3    |        | ✓     |
| 7   | assistant    | 0.4    | T3     | ✓     |
| 8   | tool_result  | 15.0   | T3     | ✗     |
| 9   | user         | 0.3    |        | ✓     |

`lastSummarized = 5` → `startIdx = 6`

**Frames:**

1. **init** — windowStart=6, msgs [6..9] = u, a+🔧, 📤, u → tokens 0.3+0.4+15+0.3 = 16K, blocks 3. narration: "init: window = [6..9] · 16K tokens · 3 blocks"
2. **check** — highlight `check/fail`. narration: "step 3: tokens 16K ≥ 10K ✓ · blocks 3 < 5 → expand"
3. **expand ← 5** — windowStart=5, tokens 34K (+18), blocks 3. narration: "step 4: ← msg 5 · +18K · tokens 34K"
4. **expand ← 4** — windowStart=4, tokens 34.5K, blocks 4. narration: "step 4: ← msg 4 · blocks 3→4"
5. **reject 3** — highlight `reject/rejectedIdx=3/maxTokens`. Window STAYS at 4; msg 3 card flashes red, tokens bar briefly spikes red to 59.5K, then snaps back. narration: "step 4: ← msg 3 would be 59.5K > 40K · reject · stop"
6. **return** — narration: "return: window = [4..9] · max cap enforced"

### S4 — Hit CompactBoundary

**Dataset:**

| idx | role         | tokens | toolId | text? |
|-----|--------------|--------|--------|-------|
| 0   | user         | 0.3    |        | ✓     |
| 1   | assistant    | 0.5    |        | ✓     |
| 2   | user         | 0.3    |        | ✓     |
| 3   | assistant    | 0.4    |        | ✓     |
| 4   | assistant    | 0.4    | T1     | ✗     | *pure tool_use, no text*
| 5   | tool_result  | 4.0    | T1     | ✗     |
| 6   | assistant    | 0.4    | T2     | ✗     | *pure tool_use, no text*
| 7   | tool_result  | 2.0    | T2     | ✗     |
| 8   | user         | 0.3    |        | ✓     |
| 9   | assistant    | 0.5    |        | ✓     |

`boundaryAfter = 4` (dashed purple line drawn between idx 4 and idx 5)
`lastSummarized = 6` → `startIdx = 7`

**Frames:**

1. **init** — windowStart=7, msgs [7..9] = 📤(2), u(0.3), a(0.5) → tokens 2.8K, blocks 2 (idx 8, 9). narration: "init: window = [7..9] · 2.8K tokens · 2 blocks"
2. **check** — highlight `check/fail`. narration: "step 3: tokens 2.8K < 10K · expand"
3. **expand ← 6** — windowStart=6, tokens 3.2K, blocks 2 (idx 6 is pure tool_use, not a text block). narration: "step 4: ← msg 6 · tool_use only"
4. **expand ← 5** — windowStart=5, tokens 7.2K (+4), blocks 2. narration: "step 4: ← msg 5"
5. **boundary at 4** — highlight `boundary/boundaryIdx=4`. The dashed purple boundary line between idx 4 and idx 5 pulses. Window stops at windowStart=5. narration: "step 4: cannot cross CompactBoundary (4↔5) · stop with partial window · blocks 2 < 5"
6. **return** — narration: "return: window = [5..9] · partial (boundary)"

6 frames. Math verified: at the moment we'd try to expand from windowStart=5 to include idx 4, idx 4 sits on the far side of the `boundaryAfter=4` divider, so expansion is blocked. Blocks never reach 5 during the run because idx 4 and idx 6 are pure tool_use (non-text) and idx 5/7 are tool_result (non-text) — the only text-bearing messages in the [startIdx..end] region are idx 8 and 9, plus whatever text-bearing messages sit left of the boundary (idx 0–3) which we cannot reach.

### Frame timing

- Step duration: 700 ms per frame
- Hold on final `return` frame: 1500 ms
- Scenario crossfade: 400 ms (message strip opacity + narration swap)
- Total loop:
  - S1: 6 × 700 + 1500 = ~5.7 s
  - S2: 3 × 700 + 1500 = ~3.6 s
  - S3: 6 × 700 + 1500 = ~5.7 s
  - S4: 6 × 700 + 1500 = ~5.7 s
  - ~20.7 s loop

## Interaction

- **Hover anywhere** on the viz → pause the frame timer. Show a small `⏸` glyph in the header pill. Leaving resumes from the current frame.
- **Tab/slide not visible** → pause via `document.visibilityState === 'hidden'` listener. Resume on `visible`.
- **Slide-container not active** — the slide component may be mounted when not visible (App.tsx renders current ± 1). The viz will still run. This is acceptable waste (the loop is cheap). Do not attempt clever mount detection.
- **Reduced motion** (`prefers-reduced-motion: reduce`) → disable per-frame intra-scenario animation. Show each scenario's *final* frame only. Rotate scenarios every 4 s.

## Palette (no new colors)

| Token                 | Hex        | Already used on slide? |
|-----------------------|------------|------------------------|
| user                  | `#60a5fa`  | yes                    |
| assistant             | `#818cf8`  | yes (Level 2 accent)   |
| tool_use              | `#fb923c`  | yes                    |
| tool_result           | `#2dd4bf`  | yes                    |
| lastSummarized        | `#fbbf24`  | yes (session memory)   |
| kept window bracket   | `#10b981`  | yes (algorithm header) |
| maxTokens bust        | `#ef4444`  | yes                    |
| CompactBoundary       | `#c084fc`  | yes (persistent mem)   |
| fixup pulse           | `#c084fc`  | yes (invariants)       |

## Component structure

New local component `CompactionAnimation` defined in `src/slides/Level2.tsx` above `S15b_SessionMemoryDeep`.

```tsx
const SCENARIOS: Scenario[] = [/* s1, s2, s3, s4 as defined above */]

function CompactionAnimation() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  // Frame timer: advance frameIdx; at end of scenario, advance scenarioIdx
  useEffect(() => {
    if (paused) return
    const scenario = SCENARIOS[scenarioIdx]
    const isLast = frameIdx === scenario.frames.length - 1
    const delay = isLast ? HOLD_MS : STEP_MS
    const t = setTimeout(() => {
      if (isLast) {
        setScenarioIdx((i) => (i + 1) % SCENARIOS.length)
        setFrameIdx(0)
      } else {
        setFrameIdx((i) => i + 1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [paused, scenarioIdx, frameIdx])

  // Visibility pause
  useEffect(() => {
    const onVis = () => setPaused(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const scenario = SCENARIOS[scenarioIdx]
  const frame = scenario.frames[frameIdx]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={/* container */}
    >
      <Header scenario={scenario} scenarioIdx={scenarioIdx} paused={paused} />
      <MessageStrip scenario={scenario} frame={frame} />
      <Counters frame={frame} />
      <Narration text={frame.narration} />
    </div>
  )
}
```

Sub-renderers (`Header`, `MessageStrip`, `Counters`, `Narration`) are small functions inside the same file — not exported.

## Replacement boundaries in `Level2.tsx`

**Remove:** the `Compaction Algorithm` header paragraph and its container `div` (roughly lines 2238–2538 in the current file).

**Insert in its place:** `<CompactionAnimation />`.

**Do not touch:**
- The outer `<div style={{ flex: '1 1 48%' }}>` wrapping the right column.
- The `Real Template Format` box above.
- Any left-column content.

## Verification checklist

- [ ] All 4 scenarios run to completion in a browser
- [ ] Token math for each scenario matches the narration (adjust datasets if needed)
- [ ] Hover anywhere on the viz pauses the timer; leaving resumes
- [ ] Tab-away (visibility change) pauses
- [ ] Scenario dots reflect current scenario
- [ ] `prefers-reduced-motion: reduce` path works (test with DevTools)
- [ ] Nothing in the left column or Template Format box shifted
- [ ] Block fits in ~50vh × ~44vw without vertical scroll
- [ ] Colors match existing slide palette (no new custom hexes)
- [ ] No console errors or leaked timers on slide navigation
- [ ] `npm run build` (or equivalent) succeeds with zero new warnings

## Out of scope

- Click-to-scrub timeline UI
- Clickable scenario dots that jump to a specific scenario
- Per-message tooltips showing message contents
- Real-time recompute from a configurable message array (everything is precomputed)
- Any changes to other slides
- Any changes to Level2.tsx outside of the Compaction Algorithm block region
