# Follow Your Data

An interactive, mobile-first explainer of India's **Digital Personal Data
Protection Act (DPDP)**, built for people who have never read the Act.

The visitor follows one abstract representation of a single piece of personal data
through fifteen chapters in seven acts — from the data itself and the roles around
it, through lawful grounds, purpose, notice, consent and enforcement, to
withdrawal, rights, duties, children's data and the complete lifecycle — with a 3D
layer that illustrates each chapter as it is explained.

This is an explainer, not legal advice.

## Status

**Complete first version.** All fifteen chapters are written from the canonical
source and told in short steps, each with its scene on the 3D stage and a flat
SVG equivalent for browsers without WebGL. Mobile is the primary target and has
had a dedicated pass; the stage renders on demand, and reduced motion is
supported. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Taking over

Read, in order: [`CLAUDE.md`](CLAUDE.md) (the non-negotiables),
[`docs/PRINCIPLES.md`](docs/PRINCIPLES.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/DESIGN.md`](docs/DESIGN.md) and [`docs/CONTENT.md`](docs/CONTENT.md).

- All copy lives in `src/content/` — chapters, steps ("moments") and terms.
- The 3D script — where the data is and where the camera looks at each step —
  is `src/three/timeline.ts`; each chapter's scene is its own file in
  `src/three/`.
- Open items are listed at the end of `docs/ROADMAP.md`. One content check is
  outstanding: chapter 08's mention of record identifiers and locale should be
  verified against the canonical source (see `docs/CONTENT.md`).

## Getting started

Requires Node 20.17+.

```bash
npm install
npm run dev
```

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Vite dev server                     |
| `npm run typecheck` | `tsc -b`, strict                    |
| `npm run lint`      | oxlint over `src/`                  |
| `npm run build`     | Typecheck, then production build    |
| `npm run preview`   | Serve the production build locally  |

## Stack

React 19 · TypeScript (strict) · Vite 6 · Three.js · React Three Fiber · plain CSS
with custom properties · oxlint.

No CSS framework, no state library, no animation library, no webfonts, and no
external network requests at runtime.

## How it works, briefly

- **Native scrolling.** Each chapter is a tall scroll track containing one
  `position: sticky` panel. Nothing hijacks the scroll.
- **One canvas.** A single `<Canvas>` lives for the lifetime of the page, fixed
  behind the document, and is lazily loaded so Three.js never blocks first paint.
- **Scrolling costs no renders.** A single scroll driver writes to a mutable
  store that the 3D scene reads inside `useFrame`; React re-renders only when the
  active chapter changes.
- **The HTML is the content.** No explanation exists only inside the canvas. Every
  chapter also describes its visual in words, and a closing index lists all fifteen
  takeaways, so the story is complete with WebGL unavailable.
- **Progressive disclosure.** Each chapter shows a short, complete explanation that
  fits a phone; deeper detail sits behind a disclosure.

## Project structure

```
src/
  content/     model, acts, fifteen chapters, lifecycle (data only)
  sections/    page-level regions
  components/  reusable UI — header, progress rail, counter
  state/       the scroll ↔ 3D bridge
  three/       canvas, scene graph, per-frame logic
  hooks/       capability detection and scroll wiring
  utils/       pure functions, no dependencies
  styles/      tokens, reset, layout
docs/          principles, architecture, content rules, roadmap
CLAUDE.md      instructions for coding agents
```

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — start here if you are an agent or new contributor.
- [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md) — the seven principles, in priority
  order, with how to tell when each has been broken.
- [`docs/INFORMATION-ARCHITECTURE.md`](docs/INFORMATION-ARCHITECTURE.md) — why the
  story is in this order, and what each chapter must make the visitor understand.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — scroll, state, and the 3D
  stage in detail.
- [`docs/CONTENT.md`](docs/CONTENT.md) — the canonical source and the rule against
  inventing legal content.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — what is built and what comes next.

## Accessibility and performance

- `prefers-reduced-motion` removes idle motion and parallax and snaps stage state.
- Device pixel ratio capped (1.5 on touch devices); rendering pauses when the tab
  is hidden; no post-processing.
- Landmarks, one `<h1>`, per-chapter `<h2>`, visible focus, a skip link, and a
  progress rail of real anchor links.
- Light and dark colour schemes, both defined in tokens.
