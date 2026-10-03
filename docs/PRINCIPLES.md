# Principles

Seven principles govern this project. They are ordered: when two conflict, the
earlier one wins. Each lists what it means in practice and how to tell when it
has been violated.

---

## 1. Mobile first

The phone is the primary device, not a constrained version of the desktop.

**In practice**

- Base CSS is the mobile design. Media queries are `min-width` only. There is no
  `max-width` breakpoint that undoes a desktop rule.
- Verified widths: 320, 375, 390, 430, 768, 1024, 1280+. Also short landscape
  (`max-height: 520px`), which is a real phone orientation and not an edge case.
- Use `svh`, never `vh`, for anything that must fit a viewport — mobile browser
  chrome changes `vh` mid-scroll.
- Respect `env(safe-area-inset-*)` on anything pinned to an edge.
- Mobile gets its own layout decisions. On a phone a chapter opens on the stage
  and its card then scrolls over it at full length; on a tablet the card is pinned
  over the stage; on a desktop it is a hairline-ruled editorial column beside the
  stage. Those are separate designs, not one design shrunk.
- Desktop should feel expansive: more whitespace, a visible table of contents,
  a wider type measure. Do not just centre the mobile layout.

**Violated when** a layout only works once a `min-width` rule applies; when `vh`
causes the sticky panel to jump as the address bar hides; when mobile looks like
desktop with elements stacked.

---

## 2. Storytelling over walls of text

The visitor is a beginner who has never read the Act. The experience must explain
visually and sequentially, not dump legal prose.

**In practice**

- One idea per chapter. One chapter per lifecycle stage.
- Show before you explain. Each chapter's visual state change lands first; the
  text names what just happened.
- Copy structure per chapter: an eyebrow (stage), a title (the plain-language
  claim), a kicker (one line of framing), then body paragraphs.
- Keep paragraphs short. If a chapter needs more than roughly four paragraphs,
  the stage is probably two stages.
- Sequence is itself an explanation. The order of the twelve stages carries
  meaning; never reorder for layout convenience.

**Violated when** a chapter panel scrolls internally; when a stage has no visual
state change of its own; when copy is lifted as a block of legalese.

---

## 3. WebGL enhances the explanation

Three.js exists to show relationships, state changes, movement, branching, and
cause and effect. It is a diagram that moves, not an atmosphere.

**In practice**

- Every object on stage denotes something named in the text. The origin marker is
  *you*. The single solid is *your data* — created once, never duplicated or
  swapped. The bounded frame is *the purpose*. The path is *the route*.
- Prefer showing a **state change** over showing a new object: consent changes
  the data object's material, it does not spawn a second object.
- Prefer showing **cause and effect** over showing a result: withdrawal drains
  the consent tone and darkens downstream stations in order.
- Banned because they explain nothing: ambient particle fields, floating
  geometry, generic 3D padlocks or shields, stock imagery, decorative post
  effects, neon/cyberpunk treatment, emoji.
- If a visual cannot be explained in one sentence of "this means X", remove it.

**Violated when** an element exists because the screen looked empty.

---

## 4. Semantic HTML is the source of readable content

The canvas is an illustration layer. The document is the content.

**In practice**

- The stage container is `aria-hidden="true"`. Nothing inside it is the only copy
  of any information.
- Real landmarks and headings: `<main>`, `<section aria-labelledby>`, one `<h1>`,
  `<h2>` per chapter. The progress rail is a `<nav>` of real anchor links, so it
  works as navigation without JavaScript behaviour.
- WebGL is probed once. Without it the site never mounts a canvas: every step
  card shows a flat stand-in figure of the same picture (`src/components/*Figure.tsx`),
  and the page reads as a continuous illustrated document.
- `<noscript>` explains the page rather than showing nothing.
- Test: disable WebGL. The site must still teach the whole lifecycle.

**Violated when** a label, number, or caption exists only as 3D text.

---

## 5. Performance matters

A heavy explainer that stutters on a mid-range phone has failed regardless of how
good it looks.

**In practice**

- Three.js is a lazy chunk (`src/three/LazyStage.tsx`). It must never block first
  paint. The document shell stays small.
- Cap device pixel ratio: 1.5 on coarse-pointer devices, 2 elsewhere. Antialias
  only where DPR allows it.
- Scrolling must not force layout. The driver measures on `ResizeObserver` and
  reads only `window.scrollY` per frame.
- Scrolling must not re-render React. Per-frame values live in a mutable store.
- Stop rendering when the tab is hidden (`frameloop: 'never'`).
- No post-processing passes. No webfonts. No external network requests at all —
  no CDNs, no analytics, no fonts.
- Geometry and materials are created in `useMemo`, never per frame. Nothing
  allocates inside `useFrame`.
- Budget: keep the non-3D chunk well under 100 kB gzip.

**Violated when** a frame allocates; when a new dependency pulls in a second copy
of Three.js; when first paint waits on WebGL.

---

## 6. Accessibility matters

A first-class requirement from the first commit, not an audit at the end.

**In practice**

- `prefers-reduced-motion: reduce` removes idle motion and pointer parallax, and
  cuts the stage between complete states instead of travelling between them.
  The story must remain followable: every step still appears, finished.
- Visible focus on everything focusable; a skip link to the story.
- Colour is never the only carrier of meaning — a state change is always also
  named in the text.
- Contrast holds in both light and dark schemes. Tokens are defined for both;
  never give a colour its only definition inside a media query.
- Respect the user's colour scheme; do not force one.
- Touch targets are comfortable on a phone. Nothing depends on hover.
- Live regions are used sparingly and politely (`role="status"`).

**Violated when** a new animation ignores the motion query; when a state is
communicated by colour alone; when focus order jumps around the sticky layout.

---

## 7. The design evolves, it is not rewritten

The token system, the sticky scroll architecture, and the store are deliberate
and load-bearing. Successive phases extend them.

**In practice**

- Add a token rather than a hard-coded colour or size.
- Add a chapter entry and a stage behaviour rather than a parallel system.
- Do not introduce a second state mechanism, a second canvas, a second styling
  approach, or a scroll library.
- Do not add a dependency unless it solves a problem the current approach
  demonstrably cannot. Specifically: do not add GSAP unless native scroll state
  has been shown to be insufficient, in code, with the failure described.
- When something is genuinely wrong with the foundation, change the foundation
  once, deliberately, and update these docs in the same change.

**Violated when** a phase reimplements what a previous phase already built.
