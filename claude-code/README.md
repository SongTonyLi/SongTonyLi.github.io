# Context Management in Claude Code — Interactive Presentation

A 30-slide interactive presentation explaining how Claude Code's context management system works, built with React + Vite + Tailwind + ReactFlow.

## Structure

**Level 1 (Slides 1-10):** The Big Picture — why context management exists, the 4-layer model, the cascade principle.

**Level 2 (Slides 11-20):** Each Layer — deep dive into Microcompact, Auto-Compact, Session Memory, Full Compact, and Snip.

**Level 3 (Slides 21-30):** The Machinery — query loop integration, token math, circuit breaker, reactive compact, API invariants, and the complete decision tree.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- ReactFlow (interactive node diagrams with zoom + glow effects)

## Quick Start

```bash
bun install && bun run dev
```

This installs dependencies and starts a local dev server at **http://localhost:5173** with hot reload. Open the URL in your browser to view the slides.

## All Commands

| Command | What it does |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun run dev` | Start dev server at localhost:5173 (hot reload) |
| `bun run build` | Build static production bundle to `dist/` |
| `bun run preview` | Preview the production build at localhost:4173 |

## Navigation

| Key | Action |
|-----|--------|
| `→` / `Space` / `Enter` | Next slide |
| `←` / `Backspace` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `F` | Toggle fullscreen |
| Click | Next slide (on non-interactive areas) |
| Click dots | Jump to specific slide |

## ReactFlow Diagrams

Several slides feature interactive ReactFlow diagrams:

- **Slide 7:** 4-Layer Architecture overview
- **Slide 14:** Auto-Compact Decision Tree (click nodes to zoom)
- **Slide 21:** Query Loop Integration (click nodes to zoom)
- **Slide 29:** Complete Decision Tree (click nodes to zoom)

Click any node to zoom in with animated focus. Selected nodes glow with color-matched lighting effects. Non-selected nodes dim for contrast.
