# Information architecture

Why the story is in this order, and what each chapter exists to do. A later phase
may change a visual; it should not change this order without a reason stated here.

## The problem with the source's order

The canonical ConsentGuru page is organised as reference material: what the Act is,
definitions, consent, consent management, notice, rights, duties, children,
Consent Manager, product, lifecycle, FAQ. That is the right shape for someone who
already knows what they are looking for.

It is the wrong shape for a beginner, for three reasons:

1. **Definitions arrive before they are needed.** A glossary of nine terms is a
   wall. Terms land better introduced one at a time, at the moment the story needs
   each one.
2. **Consent arrives before the reason consent exists.** The page states, in its
   overview, that consent is one lawful ground among several — then spends the
   next three sections on consent. A reader who skims arrives at the common
   misconception: that the Act is a consent law and a banner is compliance.
3. **Rights and duties are presented as two lists.** They are the same
   relationships seen from opposite ends. Presented separately, the reader learns
   two lists and not the one structure.

## The reordering

Three principles drove it.

**Roles before rules.** You cannot understand a duty without knowing who holds it,
or a right without knowing who you exercise it against. So the cast is established
in chapter 02, before any obligation appears.

**Grounds before consent.** Chapter 03 establishes that processing needs consent
*or* a listed legitimate use, before chapter 06 explains what consent is. This
inoculates against the misconception above. The source makes the point in its
overview; we make it a chapter, because it changes how everything after it reads.

**Act II is one question and its answer.** Chapter 03 is titled with the
question a visitor actually has — "Why do you need my data?" — and answers it in
steps: holding the data is not a reason; a ground is needed, consent or a
legitimate use the Act lists; one ground per purpose. Chapter 04 answers the
"for what?" — the purpose, which comes before the processing and limits it — and
ends by handing the reader the question Act III exists to answer: *when consent
is the basis, what makes that consent valid?* Notice (05) is the first half of
that answer (informed), consent (06) the rest.

**Mechanics before entitlements.** Record (08), enforcement (09) and withdrawal
(10) come before rights (11). A reader who has already watched a recorded decision
be obeyed, and then watched withdrawal propagate, understands what a right *acts
on*. Teaching the rights first would make them abstract.

Two further judgements:

- **Granularity is its own chapter** (07), not a footnote to consent. "One switch
  is not a choice" is the single most actionable idea on the page for anyone
  building a banner, and it is invisible if folded into the consent test.
- **Consent Manager vs CMP is placed late** (14), in the act about where the rules
  tighten rather than near the definitions. The distinction only lands once the
  reader knows what consent records and withdrawal actually are — otherwise
  "registered role vs software" is a difference without a referent.

## The seven acts

Acts exist for the reader. Fifteen chapters in a row is a list; fifteen chapters in
seven acts is a story with a shape, and the rail can show hierarchy instead of a
flat enumeration.

| Act | Title | Chapters | What the act is for |
| --- | --- | --- | --- |
| I | What is in play | 01 Data, 02 Roles | Establish the subject and the cast. |
| II | Why anything may happen at all | 03 Grounds, 04 Purpose | Install the two gates that precede all processing. |
| III | The moment of choice | 05 Notice, 06 Consent, 07 Purposes | The transaction itself, in the order it happens. |
| IV | What the choice does | 08 Record, 09 Applied, 10 Withdrawal | Prove a decision is real: stored, obeyed, reversible. |
| V | Who owes what | 11 Rights, 12 Duties | One structure, read from both ends. |
| VI | Where the rules tighten | 13 Children, 14 Manager | Two places the ordinary answer is wrong. |
| VII | The whole system | 15 System | Assemble it, and state the limits honestly. |

## Chapter contracts

Each chapter answers three questions. They are fields in the model, not notes:
`takeaway` (what the visitor walks away knowing), `visual.event` (what makes it
obvious), and `brief` (the minimum text required). If a chapter cannot state a
single `takeaway`, it is two chapters or none.

| # | Chapter | Walks away knowing | Visual event |
| --- | --- | --- | --- |
| 01 | Data | Personal data is anything that points at an identifiable person; the Act covers it once digital, including digitised paper. | A point resolves, then sheds one solid — the only object you will follow. |
| 02 | Roles | You are the Data Principal; the Fiduciary decides and stays responsible even when a Processor does the work. | Told in moments: the data passes from you to the fiduciary to a processor; the fiduciary's line stays on it. |
| 03 | Grounds | Asked as "Why do you need my data?": processing needs consent *or* a listed legitimate use. Consent is not the only path and not a catch-all. | Told in moments: holding is barred; consent and a legitimate use light in turn; a relabelled shortcut is refused; one way is taken. |
| 04 | Purpose | A purpose is named, limits collection, and cannot be quietly swapped. Ends on: what makes consent valid? | Told in moments: a loose frame closes in to fit; a reach past its edge is refused. |
| 05 | Notice | A notice is itemised and arrives *with* the request — not a footer policy. | Told in moments: a wall of lines above the data resolves into items; the first two reach down to the data and its purpose; the rest light. |
| 06 | Consent | Free, specific, informed, unconditional, unambiguous — by clear affirmative action. | Told in moments: would-be consents come down the thread from you; an empty one, a fogged one and a bundled one are each stopped at a checkpoint; a real yes passes all three and the object changes state *in place*. |
| 07 | Purposes | Optional purposes must be separable from what the service needs; one choice reaches different processing differently. | Told in moments: one stream becomes three, each in its own purpose; necessary runs, analytics (allowed, illustrative) reaches its vendor, advertising (declined) stops short but stays open. |
| 08 | Record | The agreement must be demonstrable: request, notice version, decision, time — and earlier notice versions kept. | Told in moments: a slip fills in field by field (snapshot linked to its version, purposes as decided, time and identifier); a new notice version arrives and the old one stays; the slip is filed beside the route and persists. |
| 09 | Applied | The record must reach the things that would otherwise run. | Stations pass or visibly refuse the object. |
| 10 | Withdrawal | As easy as consenting; earlier lawful processing stays lawful; what relied on it stops; the record is updated and connected systems told; withdrawal is not the same as erasure. | Told in moments, with the story's one real control: a withdrawal comes down the same thread; the data drains in place; the consent-based stream stops and its vendor goes dark; a new slip is filed over the old; stations darken *in sequence*; the travelled route stays; the hollowed data is still there. |
| 11 | Rights | Access, correction, erasure, grievance, nomination — against the fiduciary, onward to the Board. | Told in moments: back up the thread to you; six tools in a ring each draw in and do one quiet action as named; then lines reach every place the data went. |
| 12 | Duties | Consent is one duty of several: lawful processing, security, accuracy, rights and grievances, processor contracts, retention and deletion. Designated Significant Data Fiduciaries carry more. | Told in moments: the view turns to the organisation, at the centre of its own ring of seven duties (chapter 11's ring, from the other end); consent lights first and alone, then the rest arrive; a dashed bracket below holds the designated-only duties. |
| 13 | Children | Under 18; verifiable consent of a parent or lawful guardian; no detrimental processing, tracking, behavioural monitoring or targeted advertising directed at children; verification in the prescribed manner. | Told in moments, one still composition: a double wall closes around the data; a guardian's consent comes down their thread through a single check; reaches from outside stop at the wall; the check is shown beside the rule it follows — no method of checking is drawn. |
| 14 | Manager | A Consent Manager is a registered role accountable to you; a consent management platform is software a fiduciary runs. Deploying one registers nobody and does not by itself make an organisation compliant. | Told in moments: two identical holders above the data separate across a divider — one to your side, registered with the Board, reaching across to several organisations; one inside the organisation's boundary, its line toward the Board stopped. |
| 15 | System | Synthesis: the seven-step lifecycle, inside wider duties, about a person — and the rules keep moving. Ends on "It was never just a banner." | Told in moments: a line in the data's tone traces the lifecycle through the places the story showed each step and loops back to the record; the view widens to everything around it; rises up the thread to you; settles on the whole system, still. |

## Copy budget

Deliberately tight. Per chapter: one `takeaway` sentence, two short `brief`
paragraphs, optionally three or four `depth` bullets, optionally one `caution`, and
one to three `terms`. That is the ceiling, not a target to fill.

The reason is structural, not stylistic. From 768px up the chapter panel is
`position: sticky` in a viewport-height container, so always-visible copy has to fit
it. On a phone the card scrolls at full length (see `ARCHITECTURE.md`), so the
budget there is about reading time, not overflow — every extra line is a line read
on a small screen. Content that outgrows the budget belongs in `depth`, behind a
disclosure.

## What is deliberately not a chapter

- **Penalties** — a `depth` block under Duties, not a chapter. Leading with ₹250
  crore would make a scare story out of an explainer, and the source is explicit
  that a penalty follows an inquiry.
- **Exemptions and territorial scope** — the source says these are specific and
  should be read from the Act rather than assumed. A beginner explainer that
  summarised them would be inventing precision.
- **Product capability lists** — the source's ConsentGuru feature inventory is
  vendor material. What it legitimately contributes is the distinction in chapter
  14 and the lifecycle in chapter 15.
- **The FAQ** — its answers are folded into the chapters that cover the same
  ground, rather than repeated as a list.

## Closing sections

After chapter 15 the page leaves the sticky story and becomes a reference:

(The seven-step lifecycle is told inside chapter 15 itself, in text and on the
stage; a separate list after the ending repeated it and was removed.)

- **`StoryIndex`** — all fifteen takeaways, grouped by act. This is the page for
  someone who will not scroll, and it is why the experience still works with no 3D
  at all.
- **`Colophon`** — the legal notice, in full, in plain language.
