# Roadmap

What is built, what is next, and what each later phase must not disturb.

## Phase 0 -- Foundation (complete)

- Vite + React 19 + TypeScript strict; oxlint; production build.
- Source structure: `content`, `sections`, `components`, `state`, `three`,
  `hooks`, `utils`, `styles`.
- Design token system, mobile-first layout, light and dark schemes.
- Native-scroll + CSS-sticky storytelling architecture.
- Single scroll driver; mutable store; zero renders while scrolling.
- One persistent, lazily loaded `<Canvas>`.
- Capability detection: WebGL probe, reduced motion.
- Static fallback (now: flat stand-in figures per step); `<noscript>`; skip link; landmarks.
- Chapter spine: twelve stages with titles, kickers, stage-behaviour
  descriptions, and per-chapter track lengths.
- 3D: origin marker (*you*), the single data object, its route, the purpose frame
  -- the first three stages, built as the pattern for the remaining nine.
- Documentation: `CLAUDE.md`, `PRINCIPLES.md`, `ARCHITECTURE.md`, `CONTENT.md`,
  this file.

## Phase 1 -- Information architecture and content (complete)

- Narrative designed as a reasoned educational sequence rather than the source
  page's reference order. Rationale and chapter contracts in
  `docs/INFORMATION-ARCHITECTURE.md`.
- Fifteen chapters in seven acts, with act breaks pacing the story.
- Structured content model (`src/content/types.ts`): `takeaway`, `brief`, `depth`,
  `terms`, `caution`, `visual` (described independently of implementation) and
  `treatment` (a named visual treatment that CSS and the 3D layer each map).
- All fifteen chapters written from the canonical source, each with `source`
  attribution.
- The source's seven-step consent lifecycle, as a semantic ordered list.
- `StoryIndex`: all fifteen takeaways grouped by act -- the whole story without 3D.
- Typography and layout for the full model, with progressive disclosure for depth.

The complete story is readable by scrolling, in plain HTML, with no 3D at all.

## Phase 1.5 -- Visual identity (complete)

Brought forward from Phase 4 at the project owner's request, so the story reads
as a designed product before any sophisticated animation exists. See
`docs/DESIGN.md`.

- Tokens: palette under the rule "colour belongs to the data", a serif voice for
  takeaways and defined terms, a mobile-first fluid type scale, material tokens.
- An eight-mark visual vocabulary, as content (`vocabulary.ts`) and SVG
  primitives (`marks.tsx`), taught once by a legend after the hero.
- A static plate for every treatment (`Plate.tsx`) -- the still version of each
  chapter's `visual.event`, and the specification Phase 2 animates.
- Phone layout: chapters open on the stage and the card scrolls over it at full
  length, removing the panel's internal scroll on phones. Tablet: a pinned card.
  Desktop: the ruled column, unchanged in structure.
- Act breaks list their chapters; the hero carries a facts row; the site mark and
  favicon are the data mark.

## Phase 2 -- Stage behaviours (first version complete)

The persistent protagonist and all fifteen treatments, scroll-driven, in one
vertical world (`src/three/`, see `docs/ARCHITECTURE.md` -> *The scene*):

- A prologue (−1 → 0 on the timeline): you, your data on its thread, the system.
- The data token changes state in place (raw, consented, drained) and carries a
  purpose frame with it from chapter 04.
- Every treatment from `cast` to `assembly` has a first implementation that uses
  only its `visual.elements`; the `visual` texts were updated where the stage
  differs from the original description.
- Colours come from the CSS tokens, so the stage follows the colour scheme.
- Without WebGL the prologue has flat figures and the scroll tracks collapse.
- Verified on a 390 × 844 phone and a 1280 × 800 desktop, light and dark, with
  reduced motion, with WebGL disabled, and with real touch and wheel scrolling
  over the stage.

Second pass done:

- `cast` (02 Roles): rebuilt as the pattern for chapters told in moments — an
  opener, then Data Principal, Data Fiduciary and Data Processor one at a time,
  each with its source definition, timed to a portrait relay on the stage in
  which the fiduciary's line stays on the data as it passes to the processor.
  Verified at 375 × 667, 390 × 844 (light and dark), 1280 × 800, and with WebGL
  disabled.

- `grounds` and `frame` (03, 04): rebuilt as one question and its answer, told
  in moments. 03 "Why do you need my data?": a bar across the data's way down
  (holding it is not a reason), consent and a legitimate use lit in turn, a
  relabelled shortcut refused, one way taken. 04 "The answer has to be a
  purpose": a loose frame closes in to fit and refuses a reach; the chapter ends
  on "When consent is the basis, what makes that consent valid?"

- `affirm` (06 Consent): rebuilt as the page's set piece, told in moments —
  three checkpoints on the thread; an empty, a fogged and a bundled consent each
  stopped at the one it fails; a real yes passes all three and the data changes
  in place (`src/three/Checkpoint.tsx`).

- `unfold` (05 Notice) and `split` (07 Purposes): rebuilt in moments around the
  choice — before it, a notice that resolves from a wall into items that point
  at the data and its purpose; after it, one stream becoming three purposes
  with illustrative states (necessary runs, analytics allowed, advertising
  declined) reaching or not reaching their vendors. Chapter 09's stations
  overlap conceptually with 07's vendors; unifying them is the next step there.

- `ledger` (08 Record): rebuilt in moments as evidence being made — a slip
  filled in field by field from what produced each field, a shelf of notice
  versions where the old one is kept and still pointed at, then filed beside
  the route (`src/three/Evidence.tsx`). Identifiers and locale are presented as
  what a record carries in practice, not as a requirement of the Act.

- `radial` (11 Rights): rebuilt in moments around you — six tools in a ring,
  each drawing in and doing one quiet action as its right is named, then a
  wide view of rights reaching where the data went (`src/three/Rights.tsx`).

- `counterpart` (12 Duties): rebuilt as chapter 11 from the other end — the
  fiduciary at the centre of a ring of seven duties, consent handling one node
  among them; Significant Data Fiduciary duties in a dashed, conditional
  bracket, with copy that declines to classify anyone (`src/three/Duties.tsx`).

- `threshold` (13 Children): rebuilt in moments as protection rather than
  warning — a double-walled room around the data, a guardian's consent through
  a single prescribed check, reaches stopped at the wall. No verification
  method is depicted; the text carries the qualification (`src/three/Children.tsx`).

- `custody` (14 Manager): rebuilt in moments as two worlds — identical holders
  that separate across a divider: a registered Consent Manager on your side,
  a consent management platform inside the organisation's boundary, its line
  to the Board stopped (`src/three/ConsentManager.tsx`).

- `assembly` (15 System): rebuilt as synthesis in moments — the lifecycle
  traced as a loop through the places each step happened, the duties around
  it, a climb back up the thread to you, and a closing line: "It was never
  just a banner." (`src/three/Assembly.tsx`).

Still worth a second pass:

- `gate` (09 Applied): told in moments now, but its stations and chapter 07's
  vendors are still two drawings of the same idea — the services the data
  reaches. Unifying them would remove a repetition.

## Final product pass (complete)

Read end to end as a first-time visitor. Every chapter is now told in moments
(01 and 09 were the last two long cards); a list after the ending that repeated
chapter 15 was removed; the counter and rail show no chapter during the
prologue; the hero shows its flat picture until the stage's first frame, then
hands over; an unused dependency (`@react-three/drei`) and stale exports were
removed. Production build, typecheck and lint pass; a full scroll of the
production build shows no console errors or warnings at phone or desktop size,
a heading outline with no skipped levels, no horizontal overflow, no tap target
under 44px; the no-WebGL, lost-context and reduced-motion paths were each
exercised.

The ones carrying the most explanatory weight, and what to protect in a rework:

- **`affirm`** (06 Consent) -- a state change on the existing object. Resist adding
  a second object; that would teach the wrong thing.
- **`split`** (07 Purposes) -- the declined route must stay open, not vanish.
- **`gate`** (09 Applied) -- refusal has to be as visible as passage.
- **`reverse`** (10 Withdrawal) -- sequence is the whole point; simultaneous
  darkening would lose the cause and effect.
- **`radial`** / **`counterpart`** (11, 12) -- the same geometry from two ends, so
  the viewer sees one structure rather than two lists.
- **`assembly`** (15 System) -- must resolve to something still and readable.

## Phase 3 -- Interaction (first control done)

Chapter 10 Withdrawal has a real control: a `<button>` in its first moment
(`WithdrawControl`), backed by a discrete store (`src/state/choiceStore.ts`).
Pressing it plays out what withdrawal changes in a few seconds; scrolling on
plays out the same thing, so the story never waits on it. `Director` computes
each consequence (`stage.withdrawal`) as whichever of the two is further on,
and only once the story has reached the chapter, so scrolling back shows the
consent as it was. Requirements:

- A real `<button>` in the HTML panel, not a 3D hit target.
- Keyboard operable, labelled, and reflected in the text, not only on stage.
- State lives in the store as a discrete value so React can render the text
  change and the scene can react in `useFrame`.

## Mobile pass (complete)

Mobile treated as the primary product: measured across six portrait phones,
scenes recomposed where the subject sat under the card, card type scaled for
320px, dead scroll removed, render-on-demand (zero frames at rest), adaptive
resolution, recovery from WebGL context loss and chunk failure, and reduced
motion as cuts between complete states. See `docs/DESIGN.md` -> *Mobile is the
primary product* and `docs/ARCHITECTURE.md` -> *Rendering on demand*.

## Phase 4 -- Polish

Only after the above. Typography refinement, transition tuning, the dark-scheme
pass on the 3D materials, and a measurement pass on a real mid-range phone.

The identity itself landed in Phase 1.5; what remains here is refinement and
measurement, plus the 3D-specific gaps listed at the end of `docs/DESIGN.md`.

## Deferred deliberately

- Analytics, fonts, CDNs -- the site makes no external requests, by design.
- Post-processing -- ruled out on mobile performance grounds.
- A scroll library or GSAP -- see `PRINCIPLES.md` §7.
- Prerendering / SSR -- the content is client-rendered, so `dist/index.html` ships
  the shell only. Acceptable for now; revisit if search visibility matters, since
  the content is static data and would prerender cleanly.
- Tests -- there is no behaviour worth unit-testing yet. When `utils/` grows real
  logic, that is the place to start, since it is dependency-free.
