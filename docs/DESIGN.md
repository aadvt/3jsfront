# Design

The visual identity, and the vocabulary every illustration is built from. Read
this before adding a colour, a type style, or a shape.

## The identity in three rules

1. **Colour belongs to the data.** People and organisations are drawn in ink.
   Only the data, and the states it passes through, carry hue. The eye therefore
   always knows where the thing being followed is. The one coloured phrase in the
   hero is "your data" for the same reason.
2. **Two voices.** A tight grotesque (`--font-display`, `--font-sans`) speaks for
   this site: titles, framing, interface. A serif (`--font-serif`) carries the
   sentence to walk away with (`takeaway`), act premises, and the Act's own defined
   terms. A reader can tell the plain-language claim from the furniture around it
   by face alone.
3. **Paper, not glass.** Surfaces are warm and matte. Depth comes from hairlines
   and one soft shadow. Translucency (`--sheet-bg` + blur) is used only where the
   stage must show through: the chapter card, the header, the counter.

No webfonts. Every stack in `tokens.css` resolves to a good platform face on iOS,
Android, macOS and Windows.

## Colour

| Token          | Means                                        |
| -------------- | -------------------------------------------- |
| `--c-data`     | Your data, untouched. Also focus and "you are here". |
| `--c-purpose`  | A stated purpose, and its limits.            |
| `--c-grant`    | Consent attached.                            |
| `--c-withdraw` | Consent withdrawn, a refusal, a stricter rule. |
| `--ink*`       | People, organisations, connections, text.    |

Act accents (`[data-act]` in `app.css`) are drawn from these in story order. Do
not add a hue that is not a state of the data. State is never carried by colour
alone: a withdrawn datum is also hollow and dashed, a refused route also ends in
a bar, a declined route is also dashed.

## The mark vocabulary

Eight marks, defined as data in `src/content/vocabulary.ts` and drawn by
`src/components/marks.tsx`. The legend after the hero teaches them once.

| Mark        | Shape                                   | Why that shape |
| ----------- | --------------------------------------- | -------------- |
| You         | A point with a ring                     | An origin; everything is measured from it. |
| Your data   | A solid hexagon                         | The 2D projection of the data solid on the 3D stage. The only filled colour. |
| Fiduciary   | A solid ink square                      | An institution that decides. Solid because it holds the responsibility. |
| Processor   | The same square, hollow and dashed      | The same kind of thing, acting on someone else's instruction. |
| Purpose     | Corner brackets                         | A stated limit, not a container. Only the edges are drawn. |
| Consent     | The data hexagon, in the consent tone   | A state of the same object, never a second object. |
| Record      | A ruled slip                            | Evidence set down and left in place. |
| Right       | A line from you to an endpoint          | A right reaches a specific place the data went. A duty is the same line seen from the square. |

Supporting forms, used inside plates: routes (solid travelled, green consented,
dashed declined-but-open, faint not taken), a stop bar (refusal), stations (pass,
refuse, dark, held), a closed double boundary (the stricter rule for children).

**Adding a mark** means adding it to `MarkId`, `vocabulary.ts`, `marks.tsx`,
`Glyph.tsx`, and the `.mk-*` rules — and it must name a concept the text already
names. If it does not, it is decoration.

## The protagonist

Your data is a **bevelled hexagonal token** — the data mark, made solid — hanging
on a **thread** from **you** (a point with a ring). It is created once and never
replaced:

- its tone is its state: `--c-data`, then `--c-grant` once consent attaches, then
  drained (hollow, rust-edged) after withdrawal. A state is never a second object;
- the thread is the route the data has actually travelled, drawn from you to
  wherever it is now. It is what makes the data personal (it points back at you)
  and it is the one line that runs through every chapter;
- it keeps its face to the viewer and only sways, never spins, so it reads as the
  same flat mark the plates and the site icon use.

The opening picture — you, your data, the system — is built in three prologue
beats before the first chapter, and each beat has a flat equivalent
(`PrologueFigure`) for browsers without WebGL.

## Chapters told in moments

When a chapter's job is to introduce several terms that only make sense in
relation to each other, it is told in **moments** (chapter 02 is the pattern):
an opener with the title, then one viewport-tall step per term, then the
summary. Each step names one term with its mark, gives the source definition in
the serif voice and one plain line in the site's voice — and arrives at the
instant the stage shows that thing, while the things not yet introduced recede.

The picture is **composed for portrait first.** The roles are a vertical relay —
you, the fiduciary below and to the left of the data's route, the processor
lower and to the right — never more than ~2.5 units wide, so a phone shows the
cast filling its open screen instead of a wide diagram shrunk to fit. On a phone
a shot can count on about half the screen (the rest is header and card); shots
declare `halfHeight` and the director fits it to that open area.

A moment is either a defined term (with its mark and source definition) or a
plain titled step — chapter 03 asks its question this way. A chapter can end on a
**next question**, set under a heavy rule in the site's voice, which hands the
reader to the chapter that answers it.

**Chapter 06 is the page's set piece.** Consent comes down the thread from you
as a bead, through three checkpoints (unambiguous / clear affirmative action;
specific / informed; free / unconditional). Failures look like what they are —
an empty bead for silence, a fogged one for uninformed, one dragging a dashed
box for bundled — and each gets one checkpoint further than the last before it
is stopped. The real yes is the only bead in the consent tone; it turns each
checkpoint green as it passes and the data changes in place. A moment can carry
a `tag` naming the words it tests.

**Chapters 11 and 12 are one structure seen from two ends.** In 11 you sit at
the centre of a ring of six tools (your rights); in 12 the fiduciary sits at the
centre of a ring of seven duties, and the rights node's line reaches back up to
you. Consent handling is one node on the organisation's ring — the page's
answer to "isn't this just a consent-banner law?". Conditional duties
(Significant Data Fiduciaries) are drawn in a dashed bracket: dashed means
"applies only if".

Relationships are shown as lines that behave, not as labels: the fiduciary's
line to the data stays attached when the data moves on to the processor, which
is "responsibility stays with the fiduciary" without a word on the stage.

## Plates

`src/components/Plate.tsx` draws each `treatment` as a still diagram, from the
marks only, using only the elements that chapter's `visual.elements` lists. All
plates share one 320 × 104 coordinate space, so a mark is the same size in every
chapter.

The plate is the static version of the stage: it is what the story looks like
with no animation and no WebGL. The 3D layer elaborates it in Phase 2; it does
not replace it, and the two must not disagree. The plate is `aria-hidden`; the
figure caption carries the same description in text.

## Type

Mobile-first fluid scale. The minimum of each `clamp()` is the 375px design.

| Token        | 375px | Desktop | Used for |
| ------------ | ----- | ------- | -------- |
| `--t-h1`     | 57    | 112     | The hero title only. |
| `--t-numeral`| 72    | 144     | Act numerals (serif). |
| `--t-h2`     | 30    | 48      | Chapter and act titles. |
| `--t-lead`   | 19    | 24      | Takeaways, premises (serif). |
| `--t-body`   | 16    | 18      | Brief. |
| `--t-small`  | 13    | 15      | Terms, cautions, captions. |
| `--t-micro`  | 11    | 11      | Caps labels. |

Caps labels share one rule (top of `app.css`): micro size, 600 weight,
`--track-caps`. Numbers are mono and tabular wherever they count something.

## Mobile is the primary product

Measured, not assumed — six portrait phones from 320 × 568 to 430 × 932.

- **Step cards are sized for the smallest phone.** Step headings and definitions
  scale with the screen (`clamp` from 26px / 17px at 320px to the full title
  sizes), and the longest cards' copy was cut until no card covers more than
  about two-thirds of a 320 × 568 screen (it was 83%).
- **The picture is framed above the card.** Shots declare the half-height they
  need; on a phone it is measured against the open part of the screen (half of
  a tall phone, 42% of a short one), and on short phones every step's subject
  rides a little higher still. Individual shots were recomposed where the
  subject sat under the card.
- **The hero always gives the picture a band** of at least 40% of the screen;
  on a short phone the lead flows just below the first screen.
- **No dead scroll.** Chapters told in moments are only as tall as their
  content on a phone; their summary drops the plate (the stage just showed it)
  and folds the picture's description into "What the picture showed". Act
  breaks hold 56% of a screen, not 72%. The whole story went from ~117 to ~103
  screens on a 390 × 844 phone, ~122 to ~114 on 320 × 568.
- **The ending looks down the route from above**, so the whole system recedes
  into depth and fills a portrait screen instead of standing as a thin column.

## Layout, by width

- **Phone (base).** Each chapter opens on a window onto the stage, then a card
  rises over it on the page's own scroll, at full length — no nested scroller.
  The card leads with the plate. The counter lives in the header row so nothing
  sits on the reading surface.
- **768.** The panel is pinned (CSS sticky) and floats as a card over the stage.
- **1024.** The card dissolves into a hairline-ruled column; the rail becomes a
  table of contents. The plate is capped in height to keep words in view.

## Known gaps

- The stage's camera framing lets the 3D objects drift under text that sits
  directly on the page (act breaks at every width, the desktop column). Framing
  belongs to Phase 2's per-chapter camera; the cards are unaffected.
