# Follow Your Data

An interactive, mobile-first explainer of India's **Digital Personal Data
Protection Act (DPDP)**, built for people who have never read the Act.

The visitor follows one piece of personal data down a 3D route of eight
stations: people, reason, consent, purposes, record and withdrawal, rights and
duties, the stricter rules, and the whole system. Each station has a compact card,
an interactive model that the card controls, and a detail sheet with the full
source-derived text.

This is an explainer, not legal advice.

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

React 19 · TypeScript (strict) · Vite 6 · Three.js · React Three Fiber · drei ·
postprocessing (desktop bloom) · motion · Lenis (desktop wheel smoothing) ·
zustand · plain CSS with custom properties · oxlint.

No webfonts and no external network requests at runtime.

## How it works, briefly

- **Eight stations, about eleven screens of scrolling.** Each station holds still
  while its card is read, then the camera orbits down the helix to the next.
- **Models line up with the text.** CSS marks the part of the screen left for the
  picture (`.stage-window`); the camera fits each model into exactly that
  rectangle at every screen size.
- **Interactive.** Each card has a control (roles, grounds, consent attempts,
  purpose switches, withdrawal, rights or duties, children or Consent Manager,
  lifecycle steps). Clicking the model does the same thing. On desktop the active
  model can be dragged to turn it.
- **Details on demand.** "Read the details" opens a dialog with the full text of
  every chapter the station condenses.
- **The HTML is the content.** Without WebGL each card shows a flat figure instead.

See [`CLAUDE.md`](CLAUDE.md) for the architecture and rules.
