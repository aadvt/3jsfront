# Architecture

How scrolling, state, and the 3D stage fit together. Read this before changing
any of the three.

## The shape of the page

```
<body>
  .stage                    position: fixed, inset: 0, z-index: 0   ← one canvas
  .site-header              position: fixed
  .rail / .counter          position: fixed
  <main id="story">         z-index: 1
    .hero                   min-height: 100svh            ┐ the prologue:
    .prologue [data-prologue]  3 × .beat, 100svh each      ┘ story −1 → 0
    .legend                 the key to the mark vocabulary
    .chapter  × 15          ≥768: height: calc(var(--track) * 100svh)   ← scroll track
                            <768: min-height: same; card at the end of the track
      .chapter__sticky      ≥768: position: sticky; top: 0; height: 100svh
        .chapter__panel     the plate, then the text
    .index                  the fifteen takeaways, as a reference
  </main>
  .colophon
</body>
```

The canvas is fixed behind the document. The document scrolls over it natively.
Each chapter is a **tall scroll track**. From 768px up the panel inside it is
`sticky`, which is what makes the chapter appear to hold still while the 3D layer
advances.

Below 768px the panel is deliberately **not** sticky. Measured at 375×667, the
always-visible copy of every chapter (title, takeaway, brief) is 460–750px — taller
than the space a pinned panel has. Pinning it could only work by scrolling the
panel internally, which is the nested scroller Principle 2 forbids, on the device
where it hurts most. So on a phone the track opens with a window onto the fixed
stage (show, then explain) and the card rises over it on the page's own scroll at
its full length. The track keeps its `min-height`, so dwell and chapter progress
are unchanged: the driver measures real track heights and needs nothing new.

Two details that are easy to break:

- From 768px up, `.chapter__sticky` is `pointer-events: none`, with `.chapter__panel` setting
  `pointer-events: auto`. The empty area around the panel therefore passes
  gestures through to the page, and the fixed canvas (also `pointer-events: none`)
  can never swallow a scroll or a tap.
- `.chapter` must reset `align-content` at 768px. Block containers honour it in
  current browsers, and the phone rule (`end`) would push the sticky viewport to
  the bottom of its track, where it never shows.
- Track length is per chapter, in viewport heights, set by `track` in
  `src/content/chapters.ts` and consumed as the `--track` custom property. A
  longer track means a longer dwell, not a different animation.

## The scroll driver

`src/hooks/useScrollDriver.ts`. Mounted exactly once, in `App`.

```
scroll / resize  →  rAF (coalesced)  →  measure? → read scrollY → storyStore
```

- **Measure phase.** Every `[data-chapter-index]` element is measured into
  `{ index, top, height }` in document coordinates. This happens on mount and
  whenever a `ResizeObserver` on `documentElement`, a `resize`, or an
  `orientationchange` marks the cache dirty — *not* per frame.
- **Read phase.** Per frame it reads only `window.scrollY` and
  `window.innerHeight`. No `getBoundingClientRect` during scroll, so scrolling
  never forces layout.
- **Coalescing.** Many scroll events collapse into one `requestAnimationFrame`
  tick. The rAF handle is the guard; there is no timer or throttle constant.
- **Active chapter.** The chapter whose track contains the viewport midpoint.
- **Chapter progress.** `(scrollY - track.top) / (track.height - viewportH)`,
  clamped to 0 → 1. This is why a track must be taller than one viewport.

Pointer position is captured by the same hook and normalised to −1 → 1 for depth
parallax.

## The store

`src/state/storyStore.ts`. Deliberately not a React store.

```ts
storyStore.frame = {
  activeIndex,        // discrete — React cares
  chapterProgress,    // 0 → 1 within the active chapter
  documentProgress,   // 0 → 1 over the whole page
  prologueProgress,   // 0 → 1 through the hero and the prologue beats
  storyPosition,      // prologue: −1 → 0; then activeIndex + chapterProgress
  pointerX, pointerY, // −1 → 1
  engaged,            // has the visitor scrolled at all
}
```

`frame` is a plain mutable object. The 3D scene reads it inside `useFrame`, so a
scroll produces **zero React renders**. The store notifies subscribers only when
`activeIndex` changes — a discrete event, roughly twelve times per visit — and
React components subscribe through `useActiveChapter`, which wraps
`useSyncExternalStore`.

The visitor's own choices live in a separate discrete store,
`src/state/choiceStore.ts` — currently only the withdrawal in chapter 10. React
subscribes to it for the control's pressed state; the stage reads
`choiceStore.withdrawnAt` each frame. It is not scroll state and must not be
folded into `frame`.

If you need a new per-frame value, add it to `frame`. If you need a new value that
React must render, make it discrete and add a subscription path. Do not put
continuous values into `useState`.

## The 3D stage

- `src/three/LazyStage.tsx` — `React.lazy` boundary. Three.js is a separate chunk
  and is requested only after the document has painted.
- `src/three/Stage.tsx` — the one `<Canvas>`. Owns DPR capping, GL options, the
  camera, and pausing on `visibilitychange`.
- `src/three/StoryScene.tsx` — composes the scene: director, lights, cast.
- `src/three/useStoryFrame.ts` — `useFrame` wrapper that hands the callback the
  store frame plus `dt`.

### The story timeline

`storyPosition` is a continuous number in chapter units: `3.5` means halfway
through chapter index 3. **The prologue occupies −1 → 0**: from the top of the
page until the last prologue beat is fully in view (`prologueProgress`, measured
from `[data-prologue]` by the driver). After that the story holds at 0 through the
legend and the first act break, then chapters take over. One timeline, so the
stage never switches between two clocks.

Every stage behaviour is expressed as a ramp over that timeline:

```ts
const frameIn = span(pos, CH.purpose + 0.22, CH.purpose + 0.52)
```

`span(position, from, to)` is a smoothstep-eased 0 → 1 ramp (`src/utils/math.ts`).

**Land every chapter event by ~0.6 of its track.** On a phone the chapter card
rises over the stage from about 0.4 and covers it by about 0.75 (see *The shape
of the page*), so an event that ends later plays behind the card.

**Chapter progress is measured against the declared track**, not the rendered
height: `(scrollY − top) / ((track − 1) × viewport)`, with `track` read from
`data-track`. Where the two agree (a pinned panel, ≥ 768px) nothing changes.
On a phone a chapter told in moments is only as tall as its content — no
empty stretch after the summary — and the stage stays in step with the words.

**Chapters told in moments** (`moments` in the content, `.chapter--moments`)
start at the top of their track, at every width: moment k is fully in view after
k viewports of scroll, so the stage times them at `k / (track − 1)` of the
chapter (`ROLES` in `timeline.ts`). Their track is sized to fit the opener, one
viewport per moment, and the summary.

### The scene

```
src/three/
  timeline.ts     the script: CH / BEAT positions, the spine, where the data is
                  (DATA_KEYS), and the camera's shot list (SHOTS)
  stageState.ts   per-frame shared values (`stage`) and the spine curve
  Director.tsx    runs first: damps the position, places the data, flies the
                  camera, frames the subject clear of the words per layout
  Protagonist.tsx you, the data token, the thread
  System.tsx      fiduciary, processor, responsibility, duty stubs
  Journey.tsx     every environment along the route, chapter by chapter
  stroke.ts       constant-width strokes (three's fat-line addons) and shapes
```

The world is vertical — you at the top, the data hanging beneath you, the system
below, the route running on down — so scrolling down moves the data down. The
data is placed on a single Catmull-Rom spine: a curve passes through control
point `i` at `t = i / (n − 1)`, so `DATA_KEYS` address landmarks by index.

The camera is a **shot list**: each shot names a target (fixed, or following the
data), a preferred distance and the half-width of world that must stay in frame;
the director interpolates neighbouring shots and backs off when a narrow screen
cannot fit the half-width — or, for shots that declare one, the half-height,
measured against the part of the screen not covered by words (about half on a
phone, most of it elsewhere). `setViewOffset` moves the subject into the open part
of the screen (right of the column on desktop, above the card on a tablet)
without changing the composition. `phoneDrop` lowers the subject on phones for a
shot whose words sit above it.

Colours are read from the CSS tokens at runtime (`useStageColors`) and the
canvas is `flat` (no tone mapping), so the stage and the page are always the
same colours, in both schemes.

### Rendering on demand

The canvas runs `frameloop="demand"`. A frame is drawn only when something has
changed:

- `storyStore.onChange` fires when the story position (or the pointer) actually
  moves; `Waker` (in `Stage.tsx`) turns that into `invalidate()`. Scrolling
  through sections where the story does not move wakes nothing.
- `Director` keeps requesting frames only while something is settling: the
  damped position catching up, the opening intro, a pressed withdrawal playing
  out, pointer parallax easing. Then the stage sleeps.
- The data's idle sway is desktop-only (`stage.idle`: a fine pointer and no
  reduced motion). On a phone, a reader resting on a step costs zero frames.

Measured on a 390 × 844 emulated phone: 52–75 frames a second at rest before;
0 after settling.

**Resolution.** `Stage` caps the device pixel ratio at 1.5 on touch devices
(1.25 if the device reports ≤ 4 GB or ≤ 4 cores) and 2 elsewhere; multisampling
only above 1.5. `Director` samples frame time over runs of consecutive frames
and steps the ratio down by 0.25 (never below 1) when frames run slower than
40 fps.

**Failure.** If the WebGL context is lost mid-story, or the 3D chunk fails to
load (`StageBoundary` in `LazyStage.tsx`), `markStageLost()` sets
`html[data-stage="lost"]`: the canvas goes away and the flat stand-in figures
appear in the step cards, without collapsing the scroll tracks — the reader
stays exactly where they were.

**Reduced motion.** Under `prefers-reduced-motion`, the stage does not travel:
the story position is snapped to the nearest complete state (`nearestKey`,
`REDUCED_KEYS` in `timeline.ts` — every beat, shot and moment), so each step
appears finished, the camera cuts, and nothing moves on its own. The whole
story is still told.

### Per-frame rules

- `storyPosition` is damped before use, so the scene eases even though the input
  is a step function. Use `damp(current, target, lambda, dt)` — never a fixed
  `lerp` factor, which is frame-rate dependent.
- Under `prefers-reduced-motion`, the position is snapped to complete states
  (see *Rendering on demand*), and pointer parallax and idle sway are off.
  Reduced motion means *cuts instead of travel*, not *no story*.
- Geometry, materials, and curves are built in `useMemo`. Nothing allocates
  inside the frame callback. Reuse vectors via out-parameters
  (`curve.getPointAt(t, mesh.position)`).
- `<line>` collides with the SVG element type in JSX, so lines are constructed
  imperatively (`stroke.ts`) and mounted with `<primitive object={...} />`.
- Strokes are fat lines with widths in CSS pixels, so a route on the stage has
  the weight of the same route on a plate. A stroke that fills in as the data
  travels changes `geometry.instanceCount`, never its positions.
- The data leaves you once, over ~1.6s, when the page opens. It is the only
  time-based motion; under reduced motion it has already happened.
- Pointer parallax is for fine pointers only. On touch, pointer events fire
  while scrolling and would make the stage twitch with the thumb.

### Adding a stage behaviour

1. Build its objects in `Journey.tsx`'s `build()` with `addStroke` / `addMesh`,
   giving each a colour token, never a hex value.
2. Drive them in the frame callback with `span()` off `stage.pos`, relative to
   `CH.<chapter>`, landing by ~0.6 of the track.
3. If the data must move, add `DATA_KEYS`; if the view must change, add a shot
   to `SHOTS` (`timeline.ts`).
4. Describe it in that chapter's `visual` field so the HTML says what the stage
   shows, and make the chapter's plate agree.

## Capability detection

- `useWebGLSupport` probes once per session and returns `'probing' | 'available' |
  'unavailable'`. It returns `'probing'` on first paint so the document renders
  before any GL work, and it releases the probe context with
  `WEBGL_lose_context` to avoid consuming the browser's small context budget.
- `usePrefersReducedMotion` subscribes to the media query and keeps tracking
  changes mid-session.

`App` branches on support. With WebGL, the canvas mounts (lazily). Without it,
no canvas is ever created: `html[data-stage="unavailable"]` shows a flat stand-in
figure in every step card and collapses the scroll tracks into a continuous
illustrated document. If the stage is lost after it was available, see
*Rendering on demand* -> *Failure*. None of these is an error state.

## Build

Vite 6, React 19, TypeScript strict (`tsc -b`), oxlint scoped to `src/`.

Vite 6 rather than the current major because the toolchain must build on Node
20.17; Vite 8 requires Node ≥ 20.19. Revisit when the Node baseline moves.

Without a stage (`html[data-stage="unavailable"]`), the scroll tracks collapse:
dwell exists to give the stage time, and with nothing to wait for the page
becomes a continuous illustrated document. The prologue's flat figures and the
chapter plates carry every picture.

Output is two chunks by design: the document shell, and Three.js behind the lazy
boundary. The chunk-size warning on the Three.js chunk is expected and accepted —
it is deferred, not on the critical path.
