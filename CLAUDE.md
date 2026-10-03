# CLAUDE.md

Instructions for coding agents working in this repository. Read this file and
`docs/PRINCIPLES.md` before making any change. Read `docs/ARCHITECTURE.md`
before touching scroll, state, or the 3D scene. Read `docs/DESIGN.md` before
adding a colour, a type style, or a shape.

## What this project is

An interactive, mobile-first website that explains India's Digital Personal Data
Protection Act (DPDP) to a beginner audience through visual storytelling. The
central concept is **Follow Your Data**: the visitor follows one persistent
abstract representation of a single piece of personal data through the whole
lifecycle.

Fifteen chapters in seven acts are the spine of the site:

```
I    What is in play            01 Data | 02 Roles
II   Why anything may happen    03 Grounds | 04 Purpose
III  The moment of choice       05 Notice | 06 Consent | 07 Purposes
IV   What the choice does       08 Record | 09 Applied | 10 Withdrawal
V    Who owes what              11 Rights | 12 Duties
VI   Where the rules tighten    13 Children | 14 Manager
VII  The whole system           15 System
```

They live in `src/content/chapters.ts` and `src/content/acts.ts`, which are the
single source of truth for order, labels, and copy.

The order is a reasoned educational sequence, not the source page's reference
order -- roles before rules, grounds before consent, mechanics before
entitlements. Read `docs/INFORMATION-ARCHITECTURE.md` before reordering anything,
and record your reason there if you do.

## Non-negotiables

These are the rules most likely to be broken by an agent moving fast. Violating
any of them is a defect, not a trade-off.

1. **Never invent legal content.** See `docs/CONTENT.md`. No legal requirement,
   interpretation, penalty, compliance claim, or regulatory conclusion may be
   written unless it is supported by the canonical ConsentGuru DPDP source.
   If the source does not cover it, leave the field empty.
2. **Never render explanatory text only inside the canvas.** Every explanation
   must exist as semantic HTML. The site has to be fully understandable with
   WebGL unavailable.
3. **Never hijack scrolling.** Native scrolling with CSS `position: sticky` is
   the storytelling mechanism. No scroll-jacking, no `overflow: hidden` on the
   document, no wheel/touch interception, no scroll libraries.
4. **One canvas.** There is exactly one `<Canvas>` for the lifetime of the page
   (`src/three/Stage.tsx`). Do not mount per-section canvases.
5. **Scrolling must not re-render React.** Per-frame values are read from a
   mutable store inside `useFrame`. See `docs/ARCHITECTURE.md`.
6. **The stage renders on demand.** Nothing may keep it drawing at rest on a
   phone. Anything that animates on its own must ask for frames only while it
   is moving (see `Director`'s keep-alive), and must not run under reduced
   motion.
7. **3D is never decoration.** Every element on stage stands for something named
   in the text. No ambient particle fields, no generic 3D padlocks, no
   atmosphere for its own sake.
8. **Evolve the design, do not rewrite it.** The token system, layout
   primitives, and scroll architecture are deliberate. Extend them.

## Commands

```bash
npm install
npm run dev         # Vite dev server
npm run typecheck   # tsc -b, strict
npm run lint        # oxlint, scoped to src/
npm run build       # tsc -b && vite build
npm run preview     # serve the production build
```

Every change must end with `typecheck`, `lint`, and `build` all passing.

## Source layout

| Path             | Holds                                                        |
| ---------------- | ------------------------------------------------------------ |
| `src/content/`   | Content data and types: spine, acts, lifecycle, copy.         |
| `src/sections/`  | Page-level composition. One component per region of the page. |
| `src/components/`| Reusable UI used across sections (chrome, navigation).        |
| `src/state/`     | Storytelling state. The scroll↔3D bridge.                     |
| `src/three/`     | The 3D scene. Canvas setup, scene graph, per-frame logic.     |
| `src/hooks/`     | React hooks. Environment capability and scroll wiring.        |
| `src/utils/`     | Pure functions. No React, no Three.js imports.                |
| `src/styles/`    | Global CSS: tokens, reset, layout.                            |

Rules for this layout:

- `src/utils/` must stay dependency-free so it is trivially testable.
- A file in `src/three/` may import from `state`, `hooks`, `utils` — never from
  `sections` or `components`.
- A file in `src/sections/` or `src/components/` must not import from
  `src/three/` except the lazy stage entry point.
- Content never imports code. `src/content/` exports data and types only.

## Styling

Plain CSS with custom properties. No CSS-in-JS, no utility framework, no
preprocessor.

- `src/styles/tokens.css` — the design system: colour, type scale, space, depth.
  Add a token rather than a hard-coded value.
- `src/styles/base.css` — reset, focus, reduced-motion, accessibility helpers.
- `src/styles/app.css` — layout and component rules, mobile first, in BEM-ish
  flat class names (`.chapter__panel`).

Media queries are **min-width only**, in this order: base (mobile), 768, 1024,
1280. The base styles are the mobile design, not a fallback.

## The content model

`src/content/types.ts` defines it. Text is separated from presentation: nothing in
`src/content/` knows about CSS classes, DOM structure, or Three.js.

Each chapter declares, as fields:

- `takeaway` -- the one sentence the visitor should walk away knowing. If you
  cannot write it, the chapter is two chapters or none.
- `brief` -- the minimum necessary text. Two short paragraphs is the target *and*
  the ceiling.
- `depth` -- deeper detail, progressively disclosed, never required to follow along.
- `terms` -- terms defined at the point of first use, not in a glossary up front.
- `moments` -- optional. The chapter's terms introduced one at a time, each in its
  own viewport-tall step while the stage shows the thing it names. A moment shows
  the term's source definition verbatim plus one plain line; the summary panel
  then omits those terms. A moment can also be a plain titled step instead of a
  term, can carry a `tag` naming what it tests, and can carry an `action` (the
  one real control: withdrawal in chapter 10). Every chapter is told this
  way.
- `next` -- optional. The question the chapter hands to what follows, shown as
  its last line. A question, never a claim (see `docs/CONTENT.md`).
- `caution` -- something the source states explicitly that a reader would miss.
- `visual` -- the visual concept: the `event`, every `element` and what it means,
  and the `meaning` the event exists to convey. This is a specification for the 3D
  layer, written independently of its implementation.
- `treatment` -- a semantic name for the kind of visual treatment the chapter needs
  (`origin`, `unfold`, `affirm`, `split`, `gate`, `reverse`, ...). CSS maps it to a
  presentation; the 3D scene maps it to a behaviour. Either may change without
  touching content.
- `source` -- which part of the canonical page the chapter derives from.

**Copy budget.** From 768px up the panel is sticky inside a viewport-height
container, so always-visible copy must fit it; on a phone the card scrolls at full
length, so every extra line is reading time on a small screen. Anything longer
belongs in `depth`.

## Adding a chapter

1. Add the entry to `src/content/chapters.ts` with all of the above.
2. If it introduces a new `treatment`, add its plate to `src/components/Plate.tsx`
   (TypeScript enforces this), built only from the marks.
3. Add its behaviour to `src/three/Journey.tsx` (and any new camera shot or data
   key to `src/three/timeline.ts`), keyed off the story position via `span()`,
   implementing exactly what `visual` describes and nothing more. Land the event
   by ~0.6 of the chapter's track, or a phone plays it behind the card.
4. Nothing else. The rail, act breaks, mobile counter, scroll driver and story
   index all derive from the chapters and acts arrays.

## One bounded exception to "no nested scrollers"

From 768px up, `.chapter__panel` sets `max-height` plus `overflow-y: auto`. (On a
phone the panel is not pinned and never scrolls internally -- see
`docs/ARCHITECTURE.md`.) This is a safety
valve, not a storytelling mechanism: always-visible copy is written to fit, so it
normally does nothing, and it engages only when a reader opens a disclosure or the
viewport is unusually small -- overflowing rather than clipping the text.
Overscroll chaining is left at its default so a swipe continues into the page
scroll at the end. Do not extend this pattern elsewhere, and do not add
`overscroll-behavior: contain` to it, which would make it a scroll trap.

## Known state of the project

Phases 0, 1 and 1.5 are complete: the foundation, the full written story, and the
visual identity -- tokens, the eight-mark vocabulary (`src/content/vocabulary.ts`,
`src/components/marks.tsx`) and a static plate per treatment
(`src/components/Plate.tsx`), so the story is already illustrated without
animation. All fifteen chapters carry real content drawn from the canonical source.

All fifteen chapters are told in moments, the stage renders on demand, and the
mobile and final product passes are complete (`docs/ROADMAP.md`).

Phase 2 has a complete first version: one persistent protagonist (your data, a
hexagonal token on a thread from you) travelling down a vertical world through
every chapter's environment, with a prologue that introduces you, your data and
the system. The stage's script is `src/three/timeline.ts`. See
`docs/ROADMAP.md` for what is next.
