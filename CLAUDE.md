# CLAUDE.md

Instructions for coding agents working in this repository. Read this file
before making any change. `docs/CONTENT.md` governs every word of legal
content. The other files in `docs/` describe the earlier fifteen-chapter
version and are kept for reference only.

## What this project is

An interactive explainer of India's Digital Personal Data Protection Act
(DPDP) for beginners. The visitor follows one piece of personal data (a
hexagonal token on a thread) down a 3D route of **eight stations**. Each
station has one model on the stage and one compact card on the page:

```
01 People      data, Data Principal, Fiduciary, Processor
02 Reason      lawful grounds, purpose limitation
03 Consent     notice, the conditions of valid consent
04 Purposes    granular choice, enforcement
05 Record      consent record, withdrawal
06 Rights      rights and the fiduciary's duties
07 Stricter    children's data, Consent Manager
08 System      the lifecycle and its limits
```

The project owner asked for a short scroll, compact cards, a "details"
option for depth, models that represent each section and line up with it,
and an interactive journey. This replaced the older fifteen-chapter,
viewport-per-moment scroll.

## Where things live

| Path | Holds |
| --- | --- |
| `src/content/stations.ts` | The eight stations: compact copy, the interactive control's options and result texts, and the chapters each condenses. |
| `src/content/chapters.ts` | The full source-derived text (fifteen chapters). The detail sheet renders it. It is still the single source of legal wording. |
| `src/state/journey.ts` | `journey`: mutable per-frame scroll and pointer state, never React state. `useChoices`: a zustand store for discrete choices, the active station, hover and the open detail sheet. |
| `src/hooks/useJourneyScroll.ts` | Native scroll → `journey.position` (−1 overview, 0–7 stations, with a hold while each card is read). Lenis smooths the wheel on desktop only. |
| `src/three/layout.ts` | The helix the stations stand on, each station's views (centre and radius to frame), and the thread curve. |
| `src/three/Rig.tsx` | The camera. It fits each view's sphere into `.stage-window` and offsets the projection to that rectangle's centre. |
| `src/three/kit.tsx` | The 3D mark vocabulary (Person, Fiduciary, Processor, PurposeFrame, Slip, Board, Stop, Flow, Bead, Halo), plus `Part` (hover/click) and `Tag` (HTML labels). |
| `src/three/stations/*.tsx` | One model per station. |
| `src/sections/StationSection.tsx`, `src/components/StationControl.tsx`, `src/components/DetailSheet.tsx` | Card, control, detail dialog. |

## Non-negotiables

1. **Never invent legal content.** Station copy paraphrases `chapters.ts`.
   Anything new must come from the ConsentGuru source (`docs/CONTENT.md`).
2. **Text lives in HTML.** Every explanation is in the cards or the detail
   sheet. 3D labels (`Tag`) only copy words that are already in the card, and
   they are `aria-hidden`.
3. **Layout and framing share one rectangle.** CSS positions `.stage-window`
   for each breakpoint, and the rig fits models to it. To move a model on
   screen, change the window or the station's view in `layout.ts`. Never
   nudge the camera by hand.
4. **One canvas**, lazily loaded, fixed behind the page.
5. **No React renders while scrolling.** Per-frame values are read from
   `journey` or `stage` (`three/presence.ts`) inside `useFrame`. React state
   changes only on discrete events (active station, choices).
6. **Clicking the model and the card control are the same action.** Both call
   `useChoices.choose`, so the result text always describes the stage.
7. **Every shape stands for something named in the card.** No decoration.
8. **Fallback.** Without WebGL, or after the context is lost, each card shows
   its flat SVG figure and no space is reserved for the picture.
9. **Motion.** Reduced motion turns off Lenis, cuts the camera between
   states, stops idle animation and renders on demand. Frames stop entirely
   while the tab is hidden.

## Commands

```bash
npm run dev | typecheck | lint | build | preview
```

Every change must end with `typecheck`, `lint` and `build` passing. After any
visual change, check phone (390×844) and desktop (1280×800 or wider), in
light and dark.

## Adding or changing a station

1. Edit its entry in `stations.ts`. Option ids are what the model reacts to.
2. Edit its model in `src/three/stations/`, built from `kit.tsx`. Wrap parts
   in `Reveal` (in order) and make choosable parts `Part`s with `choose`.
3. Adjust its view (centre, radius, direction) in `layout.ts` until the whole
   model, including its tags, fits the window at phone and desktop sizes.
