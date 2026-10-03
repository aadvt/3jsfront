import { chapters } from '../content/chapters'
import type { Keyed } from '../utils/math'

/**
 * The stage's script, in one place.
 *
 * The world is vertical. You are at the top; your data hangs beneath you on a
 * thread; the system sits below that; and the data's route runs on downward
 * through the environments each chapter adds. Scrolling down the page moves the
 * data down the route — the one direction a visitor already understands.
 *
 * Every number here is a position on the story timeline (`storyPosition`):
 * −1 → 0 is the prologue, then one unit per chapter. Chapter positions are
 * looked up by id, so reordering `chapters.ts` cannot silently misalign the
 * stage.
 */

function chapter(id: string) {
  const index = chapters.findIndex((c) => c.id === id)
  if (index < 0) throw new Error(`timeline: unknown chapter "${id}"`)
  return index
}

export const CH = {
  data: chapter('data'),
  roles: chapter('people'),
  grounds: chapter('grounds'),
  purpose: chapter('purpose'),
  notice: chapter('notice'),
  consent: chapter('consent'),
  split: chapter('granularity'),
  record: chapter('record'),
  gate: chapter('enforcement'),
  withdrawal: chapter('withdrawal'),
  rights: chapter('rights'),
  duties: chapter('duties'),
  children: chapter('children'),
  manager: chapter('consent-manager'),
  system: chapter('system'),
}

/**
 * The prologue's beats. The hero and the three beats are each one viewport
 * tall, and the prologue's progress runs over three viewports of scroll, so a
 * beat is exactly in view at these positions (see `Prologue.tsx`).
 */
export const BEAT = {
  hero: -1,
  you: -2 / 3,
  data: -1 / 3,
  system: 0,
}

/**
 * Chapters told in moments (see `ChapterSection.tsx`): an opener and one step
 * per moment, each one viewport tall, then the summary. A chapter's progress
 * runs over (track − 1) viewports, so step k is fully in view at
 * k / (track − 1) — and consecutive steps are that far apart.
 */
function momentsOf(id: string) {
  const index = chapter(id)
  const spacing = 1 / (chapters[index].track - 1)
  return { step: (k: number) => index + k * spacing, spacing }
}

/** 02: three roles — principal, fiduciary, processor. */
const roles = momentsOf('people')
export const ROLES = {
  spacing: roles.spacing,
  opener: roles.step(0),
  principal: roles.step(1),
  fiduciary: roles.step(2),
  processor: roles.step(3),
  summary: roles.step(4),
}

/** 03: why do you need my data — held, consent, a legitimate use, per purpose. */
const grounds = momentsOf('grounds')
export const GROUNDS = {
  spacing: grounds.spacing,
  opener: grounds.step(0),
  held: grounds.step(1),
  consent: grounds.step(2),
  legitimate: grounds.step(3),
  perPurpose: grounds.step(4),
  summary: grounds.step(5),
}

/** 04: the answer has to be a purpose — named, only what it needs, no reuse. */
const purpose = momentsOf('purpose')
export const PURPOSE = {
  spacing: purpose.spacing,
  opener: purpose.step(0),
  named: purpose.step(1),
  needs: purpose.step(2),
  reuse: purpose.step(3),
  summary: purpose.step(4),
}

/** 05: before you answer — a wall, itemised, what and what for, what next. */
const notice = momentsOf('notice')
export const NOTICE = {
  spacing: notice.spacing,
  opener: notice.step(0),
  wall: notice.step(1),
  itemised: notice.step(2),
  whatWhy: notice.step(3),
  after: notice.step(4),
  summary: notice.step(5),
}

/** 07: one choice, several answers — one stream, separate, necessary, optional, vendors. */
const split = momentsOf('granularity')
export const SPLIT = {
  spacing: split.spacing,
  opener: split.step(0),
  oneStream: split.step(1),
  separate: split.step(2),
  necessary: split.step(3),
  optional: split.step(4),
  vendors: split.step(5),
  summary: split.step(6),
}

/** 08: the agreement has to be showable — a slip filled in, field by field. */
const record = momentsOf('record')
export const RECORD = {
  spacing: record.spacing,
  opener: record.step(0),
  press: record.step(1),
  seen: record.step(2),
  decided: record.step(3),
  when: record.step(4),
  version: record.step(5),
  summary: record.step(6),
}

/** 10: you can change your mind — and what that changes. */
const withdrawal = momentsOf('withdrawal')
export const WITHDRAWAL = {
  spacing: withdrawal.spacing,
  opener: withdrawal.step(0),
  change: withdrawal.step(1),
  stop: withdrawal.step(2),
  record: withdrawal.step(3),
  systems: withdrawal.step(4),
  past: withdrawal.step(5),
  erasure: withdrawal.step(6),
  summary: withdrawal.step(7),
}

/** 11: what you can ask for — six tools around you. */
const rights = momentsOf('rights')
export const RIGHTS = {
  spacing: rights.spacing,
  opener: rights.step(0),
  access: rights.step(1),
  correction: rights.step(2),
  erasure: rights.step(3),
  grievance: rights.step(4),
  nomination: rights.step(5),
  withdraw: rights.step(6),
  summary: rights.step(7),
}

/** 12: the other end of every line — the organisation's ring of duties. */
const duties = momentsOf('duties')
export const DUTIES = {
  spacing: duties.spacing,
  opener: duties.step(0),
  banner: duties.step(1),
  lawful: duties.step(2),
  security: duties.step(3),
  accuracy: duties.step(4),
  rights: duties.step(5),
  processors: duties.step(6),
  retention: duties.step(7),
  significant: duties.step(8),
  summary: duties.step(9),
}

/** 13: under eighteen — a room, a guardian, what stays out, the prescribed check. */
const children = momentsOf('children')
export const CHILDREN = {
  spacing: children.spacing,
  opener: children.step(0),
  child: children.step(1),
  guardian: children.step(2),
  restricted: children.step(3),
  prescribed: children.step(4),
  summary: children.step(5),
}

/** 14: a Consent Manager is not a consent tool — two worlds. */
const manager = momentsOf('consent-manager')
export const MANAGER = {
  spacing: manager.spacing,
  opener: manager.step(0),
  alike: manager.step(1),
  manager: manager.step(2),
  reach: manager.step(3),
  platform: manager.step(4),
  qualification: manager.step(5),
  summary: manager.step(6),
}

/** 15: it was one system all along — synthesis. */
const system = momentsOf('system')
export const SYSTEM = {
  spacing: system.spacing,
  opener: system.step(0),
  lifecycle: system.step(1),
  beyond: system.step(2),
  rules: system.step(3),
  person: system.step(4),
  closing: system.step(5),
  summary: system.step(6),
}

/** 06: what makes a consent real — the test, three failures, a real yes. */
const consent = momentsOf('consent')
export const CONSENT = {
  spacing: consent.spacing,
  opener: consent.step(0),
  term: consent.step(1),
  silence: consent.step(2),
  uninformed: consent.step(3),
  bundled: consent.step(4),
  given: consent.step(5),
  summary: consent.step(6),
}

/* ------------------------------------------------------------- the spine -- */

/**
 * The route, as control points of one Catmull-Rom curve. A CatmullRomCurve3
 * passes through control point `i` at `t = i / (n − 1)`, so a landmark here is
 * addressed by its index and the data can be placed on it exactly.
 */
export const SPINE: [number, number, number][] = [
  [0, 0, 0], //  0 you
  [0, -1.3, 0], //  1 your data, at rest
  [0, -2.9, 0], //  2 taken in by the fiduciary (beside it, left)
  [0, -4.3, 0], //  3 passed to the processor (beside it, right)
  [0, -5.4, 0], //  4 the fork
  [-0.7, -6.6, 0], //  5 the lit branch: consent
  [0, -7.8, 0], //  6 rejoined
  [0, -9.2, 0], //  7 inside its purpose
  [0, -11.0, 0], //  8 the notice
  [0, -12.8, 0], //  9 consent
  [0, -14.6, 0], // 10 where the route splits
  [0, -16.4, 0], // 11 the record
  [0, -18.1, 0], // 12 the stations
  [0, -20.2, 0], // 13 withdrawal
  [0, -22.0, 0], // 14 a child's data
  [0, -23.8, 0], // 15 the two holders
  [0, -25.3, 0], // 16 end of the route
]

export const AT = {
  you: 0,
  rest: 1,
  fiduciary: 2,
  processor: 3,
  fork: 4,
  branch: 5,
  rejoin: 6,
  purpose: 7,
  notice: 8,
  consent: 9,
  split: 10,
  record: 11,
  gate: 12,
  withdrawal: 13,
  children: 14,
  manager: 15,
  end: 16,
}

/** Converts a spine index into the curve parameter that reaches it. */
export const spineT = (index: number) => index / (SPINE.length - 1)

/* ---------------------------------------------------------- the data -- */

/** Where the data is on the spine (`v`, a spine index) along the timeline. */
export const DATA_KEYS: (Keyed & { v: number })[] = [
  { at: BEAT.hero, v: AT.rest },
  // 02: from you to the fiduciary, then on to the processor it engages.
  { at: ROLES.principal + 0.07, v: AT.rest },
  { at: ROLES.fiduciary - 0.03, v: AT.fiduciary },
  { at: ROLES.fiduciary + 0.07, v: AT.fiduciary },
  { at: ROLES.processor - 0.03, v: AT.processor },
  // 03: down to the bar, held there while the grounds are named, then around
  // by the consent way once one ground is chosen for the purpose.
  { at: GROUNDS.opener + 0.02, v: AT.processor },
  { at: GROUNDS.held - 0.03, v: AT.fork },
  { at: GROUNDS.perPurpose - 0.08, v: AT.fork },
  { at: GROUNDS.perPurpose + 0.02, v: AT.rejoin },
  // 04: on into the purpose that will frame it.
  { at: PURPOSE.opener + 0.05, v: AT.rejoin },
  { at: PURPOSE.named - 0.04, v: AT.purpose },
  // 05: under the notice, before the question.
  { at: NOTICE.opener + 0.02, v: AT.purpose },
  { at: NOTICE.wall - 0.5 * NOTICE.spacing, v: AT.notice },
  // 06: into place under the checkpoints, then still: consent changes the
  // data where it is.
  { at: CONSENT.opener + 0.02, v: AT.notice },
  { at: CONSENT.term - 0.5 * CONSENT.spacing, v: AT.consent },
  // 07: to the head of the streams.
  { at: SPLIT.opener + 0.02, v: AT.consent },
  { at: SPLIT.oneStream - 0.5 * SPLIT.spacing, v: AT.split },
  // 08: down the necessary stream to where the record is made.
  { at: RECORD.opener + 0.02, v: AT.split },
  { at: RECORD.press - 0.5 * RECORD.spacing, v: AT.record },
  { at: CH.gate, v: AT.record },
  { at: CH.gate + 0.15, v: AT.gate },
  { at: CH.gate + 0.68, v: AT.gate + 0.85 },
  // 10: just past the stations, where the withdrawal arrives.
  { at: WITHDRAWAL.opener + 0.02, v: AT.gate + 0.85 },
  { at: WITHDRAWAL.change - 0.5 * WITHDRAWAL.spacing, v: AT.withdrawal },
  // 13: into the room that will close around it.
  { at: CHILDREN.opener + 0.02, v: AT.withdrawal },
  { at: CHILDREN.child - 0.5 * CHILDREN.spacing, v: AT.children },
  // 14: below the two holders.
  { at: MANAGER.opener + 0.02, v: AT.children },
  { at: MANAGER.alike - 0.5 * MANAGER.spacing, v: AT.manager },
]

/* ------------------------------------------------------------ the camera -- */

/**
 * A camera shot. `target` is a fixed point, or `null` to follow the data with
 * `nudge` added. `dist` is the preferred distance; `halfWidth` is how much of
 * the world, either side of the target, must stay in frame — on a narrow
 * phone the camera backs off until it fits. `side` and `lift` angle the view
 * so solids read as solids.
 */
export interface Shot extends Keyed {
  target: [number, number, number] | null
  nudge?: [number, number, number]
  dist: number
  halfWidth: number
  /**
   * How much of the world above and below the target must stay in frame. On a
   * phone this is measured against the part of the screen a card leaves open.
   */
  halfHeight?: number
  side?: number
  lift?: number
  /**
   * Phones only: how far below (or, negative, above) the usual framing point
   * the subject sits, as a fraction of screen height. The phone hero puts its
   * title above the picture, so the picture sits lower; the prologue beats put
   * a card below it, so it sits higher.
   */
  phoneDrop?: number
  /** Phones shorter than about 19:9 (375 × 667, 320 × 568): replaces `phoneDrop`. */
  shortDrop?: number
}

export const SHOTS: Shot[] = [
  // Prologue: the person, then the data, then the whole arrangement.
  { at: BEAT.hero, target: [0, -0.65, 0], dist: 8.4, halfWidth: 0.9, phoneDrop: 0.08, shortDrop: 0.17 },
  { at: BEAT.you, target: [0, 0.25, 0], dist: 2.2, halfWidth: 0.5, phoneDrop: -0.1 },
  { at: BEAT.data, target: null, nudge: [0, 0.15, 0], dist: 2.9, halfWidth: 0.6, phoneDrop: -0.1 },
  { at: BEAT.system, target: [0, -2.15, 0], dist: 6, halfWidth: 1.25, halfHeight: 2.55, phoneDrop: -0.1 },

  // I — close on the data and its thread. Then the roles, one at a time, in
  // a portrait composition: you, the fiduciary to the left below, the
  // processor to the right below that. Never wider than ~2.5 units, so on a
  // phone the cast fills the screen rather than shrinking to fit it.
  { at: CH.data + 0.41, target: null, dist: 2.4, halfWidth: 0.7, side: 0.35 },
  { at: ROLES.opener, target: [0, -2.15, 0], dist: 6, halfWidth: 1.25, halfHeight: 2.55, phoneDrop: -0.1 },
  { at: ROLES.principal, target: [0, -0.35, 0], dist: 2.6, halfWidth: 0.6, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: ROLES.fiduciary, target: [-0.4, -2.8, 0], dist: 3.4, halfWidth: 1.2, halfHeight: 0.85, phoneDrop: -0.1 },
  { at: ROLES.processor, target: [-0.05, -3.85, 0], dist: 4, halfWidth: 1.25, halfHeight: 1.05, phoneDrop: -0.1 },
  { at: ROLES.summary, target: [0, -2.15, 0], dist: 6, halfWidth: 1.25, halfHeight: 2.55 },

  // II — why do you need my data: the bar, each way around it, the way taken.
  // Then the purpose: loose, closing in, refusing a reach.
  { at: GROUNDS.opener, target: [0, -6.1, 0], dist: 5, halfWidth: 1.2, halfHeight: 2.05, phoneDrop: -0.1 },
  { at: GROUNDS.held, target: [0, -5.65, 0], dist: 3, halfWidth: 0.8, halfHeight: 0.7, phoneDrop: -0.1 },
  { at: GROUNDS.consent, target: [-0.3, -6.5, 0], dist: 4, halfWidth: 1, halfHeight: 1.25, phoneDrop: -0.1 },
  { at: GROUNDS.legitimate, target: [0.45, -6.5, 0], dist: 4, halfWidth: 1.25, halfHeight: 1.25, phoneDrop: -0.1 },
  { at: GROUNDS.perPurpose, target: [0, -6.6, 0], dist: 4.5, halfWidth: 1.1, halfHeight: 1.5, phoneDrop: -0.1 },
  { at: GROUNDS.summary, target: [0, -6.6, 0], dist: 4.5, halfWidth: 1.1, halfHeight: 1.5 },
  { at: PURPOSE.opener, target: null, dist: 4.6, halfWidth: 1.2, halfHeight: 1.2, phoneDrop: -0.1 },
  { at: PURPOSE.named, target: null, dist: 4.6, halfWidth: 1.8, halfHeight: 1.5, phoneDrop: -0.1 },
  { at: PURPOSE.needs, target: null, dist: 4, halfWidth: 1.25, halfHeight: 1.05, phoneDrop: -0.1 },
  { at: PURPOSE.reuse, target: null, nudge: [0.55, 0, 0], dist: 4, halfWidth: 1.35, halfHeight: 1, phoneDrop: -0.1 },
  { at: PURPOSE.summary, target: null, dist: 4.6, halfWidth: 1.3, halfHeight: 1.1 },

  // III — the notice beside it, consent on it, the routes coming apart.
  // 05 — the notice above the data: up close while it resolves and lights,
  // wider when its first two items reach down to the data and the purpose.
  { at: NOTICE.opener, target: null, nudge: [0.45, 1.1, 0], dist: 5, halfWidth: 1, halfHeight: 1.6, phoneDrop: -0.1 },
  { at: NOTICE.wall, target: null, nudge: [0.82, 1.7, 0], dist: 3, halfWidth: 0.62, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: NOTICE.itemised, target: null, nudge: [0.82, 1.7, 0], dist: 3, halfWidth: 0.62, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: NOTICE.whatWhy, target: null, nudge: [0.45, 1.15, 0], dist: 4, halfWidth: 1, halfHeight: 1.35, phoneDrop: -0.1 },
  { at: NOTICE.after, target: null, nudge: [0.82, 1.7, 0], dist: 3, halfWidth: 0.62, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: NOTICE.summary, target: null, nudge: [0.4, 1, 0], dist: 4.4, halfWidth: 1, halfHeight: 1.5 },
  // 06 — the thread above the data, where would-be consents are tested.
  // Lifted, so the checkpoint rings read as rings rather than lines.
  { at: CONSENT.opener, target: null, nudge: [0, 0.9, 0], dist: 5, halfWidth: 1, halfHeight: 1.6, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.term, target: null, nudge: [0, 0.9, 0], dist: 5, halfWidth: 1, halfHeight: 1.6, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.silence, target: null, nudge: [0, 1.4, 0], dist: 3.4, halfWidth: 0.7, halfHeight: 0.85, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.uninformed, target: null, nudge: [0, 1.15, 0], dist: 3.6, halfWidth: 0.75, halfHeight: 1, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.bundled, target: null, nudge: [0.2, 0.9, 0], dist: 3.8, halfWidth: 0.95, halfHeight: 1.1, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.given, target: null, nudge: [0, 0.75, 0], dist: 4.4, halfWidth: 1, halfHeight: 1.45, lift: 0.3, phoneDrop: -0.1 },
  { at: CONSENT.summary, target: null, nudge: [0, -0.2, 0], dist: 4.4, halfWidth: 1.2, halfHeight: 1.2 },
  // 07 — the streams below the data, framed upright: data at the top,
  // vendors at the bottom.
  { at: SPLIT.opener, target: null, nudge: [0, -1.3, 0], dist: 5, halfWidth: 0.95, halfHeight: 1.75, phoneDrop: -0.1 },
  { at: SPLIT.oneStream, target: null, nudge: [0, -1.35, 0], dist: 5, halfWidth: 0.95, halfHeight: 1.8, phoneDrop: -0.1 },
  { at: SPLIT.optional, target: null, nudge: [0, -1.35, 0], dist: 5, halfWidth: 0.95, halfHeight: 1.8, phoneDrop: -0.1 },
  { at: SPLIT.vendors, target: null, nudge: [0, -1.55, 0], dist: 5, halfWidth: 0.95, halfHeight: 1.95, phoneDrop: -0.1 },
  { at: SPLIT.summary, target: null, nudge: [0, -1.4, 0], dist: 5, halfWidth: 0.95, halfHeight: 1.85 },

  // IV — the record, the stations, and the stations going dark.
  // 08 — the slip under the data, and the shelf of versions beside it.
  { at: RECORD.opener, target: [0.05, -16.95, 0.4], dist: 4.4, halfWidth: 1.05, halfHeight: 1.15, phoneDrop: -0.1 },
  { at: RECORD.press, target: [0.05, -17.05, 0.4], dist: 3.6, halfWidth: 1.05, halfHeight: 1.05, phoneDrop: -0.1 },
  { at: RECORD.version, target: [0.1, -17.15, 0.45], dist: 3.4, halfWidth: 1.05, halfHeight: 0.85, phoneDrop: -0.1 },
  { at: RECORD.summary, target: [-0.6, -16.5, 0.1], dist: 4.4, halfWidth: 1.2, halfHeight: 1 },
  { at: CH.gate + 0.3, target: [0, -19.0, 0], dist: 6.4, halfWidth: 1.6 },
  // 10 — the withdrawal down the thread; the stream it stops; the record;
  // the stations; the route already travelled; and the data, still there.
  { at: WITHDRAWAL.opener, target: null, nudge: [0, 0.6, 0], dist: 4.5, halfWidth: 1, halfHeight: 1.3, phoneDrop: -0.1 },
  { at: WITHDRAWAL.change, target: null, nudge: [0, 0.4, 0], dist: 4, halfWidth: 0.9, halfHeight: 1.1, phoneDrop: -0.1 },
  { at: WITHDRAWAL.stop, target: [-0.25, -18.55, 0], dist: 5, halfWidth: 1, halfHeight: 1.85, phoneDrop: -0.1 },
  { at: WITHDRAWAL.record, target: [-1, -16.6, 0.1], dist: 3.5, halfWidth: 0.8, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: WITHDRAWAL.systems, target: [0.1, -19.1, 0], dist: 5, halfWidth: 1, halfHeight: 1.3, phoneDrop: -0.1 },
  { at: WITHDRAWAL.past, target: [0, -15.5, 0], dist: 8, halfWidth: 1.2, halfHeight: 5, phoneDrop: -0.1 },
  { at: WITHDRAWAL.erasure, target: null, nudge: [0, 0.1, 0], dist: 3.6, halfWidth: 0.7, halfHeight: 0.75, phoneDrop: -0.1 },
  { at: WITHDRAWAL.summary, target: [0, -18.6, 0], dist: 5, halfWidth: 1, halfHeight: 1.8 },

  // V — back out until you are in frame again, then from the other end.
  // 11 — back up the thread to you, and stay there, calm: the tools come to
  // you, the camera barely moves. Then wide, to show where rights reach.
  { at: RIGHTS.opener, target: [0, -0.1, 0], dist: 5, halfWidth: 1.4, halfHeight: 1.45, side: 0.1, phoneDrop: -0.1 },
  { at: RIGHTS.access, target: [-0.1, 0, 0], dist: 5, halfWidth: 1.4, halfHeight: 1.45, side: 0.1, phoneDrop: -0.1 },
  { at: RIGHTS.withdraw, target: [-0.1, -0.1, 0], dist: 5, halfWidth: 1.4, halfHeight: 1.45, side: 0.1, phoneDrop: -0.1 },
  { at: RIGHTS.summary, target: [0, -9.6, 0], dist: 33, halfWidth: 2.4, side: 0.1, phoneDrop: 0.1 },
  // 12 — the view turns to the organisation: the fiduciary at the centre of
  // its ring of duties, seen from its own side. Wider for the reaches back to
  // you and to the processor, and for the dashed bracket below.
  { at: DUTIES.opener, target: [-0.8, -2.95, 0], dist: 5, halfWidth: 1.4, halfHeight: 1.45, side: -0.35, phoneDrop: -0.1 },
  { at: DUTIES.retention, target: [-0.8, -2.95, 0], dist: 5, halfWidth: 1.4, halfHeight: 1.45, side: -0.35, phoneDrop: -0.1 },
  { at: DUTIES.significant, target: [-0.8, -3.6, 0], dist: 5, halfWidth: 1.4, halfHeight: 2.05, side: -0.35, phoneDrop: -0.1 },
  { at: DUTIES.summary, target: [-0.6, -2.5, 0], dist: 6, halfWidth: 1.5, halfHeight: 2.6, side: -0.3 },

  // VI — close again where the rules tighten.
  // 13 — one still composition: the room, the guardian above, the reaches
  // from the right. The camera holds; only the card and the picture change.
  { at: CHILDREN.opener, target: null, nudge: [0.25, 0.62, 0], dist: 5, halfWidth: 1.3, halfHeight: 1.3, phoneDrop: -0.1 },
  { at: CHILDREN.prescribed, target: null, nudge: [0.25, 0.62, 0], dist: 5, halfWidth: 1.3, halfHeight: 1.3, phoneDrop: -0.1 },
  { at: CHILDREN.summary, target: null, nudge: [0.25, 0.4, 0], dist: 5, halfWidth: 1.3, halfHeight: 1.25 },
  // 14 — one still composition above the data: your side and the
  // organisation's, with the Board above. Close for the confusion, then the
  // whole of both worlds.
  { at: MANAGER.opener, target: null, nudge: [0, 0.65, 0], dist: 4, halfWidth: 0.8, halfHeight: 0.85, phoneDrop: -0.1 },
  { at: MANAGER.alike, target: null, nudge: [0, 0.65, 0], dist: 4, halfWidth: 0.8, halfHeight: 0.85, phoneDrop: -0.1 },
  { at: MANAGER.manager, target: null, nudge: [0, 0.8, 0], dist: 5, halfWidth: 1.7, halfHeight: 1.25, phoneDrop: -0.1 },
  { at: MANAGER.qualification, target: null, nudge: [0, 0.65, 0], dist: 5, halfWidth: 1.7, halfHeight: 1.35, phoneDrop: -0.1 },
  { at: MANAGER.summary, target: null, nudge: [0, 0.65, 0], dist: 5, halfWidth: 1.7, halfHeight: 1.35 },

  // VII — everything, still.
  // 15 — the lifecycle across the places it happened; then everything; then
  // up the thread to you; then the whole system, still, from a calm angle.
  { at: SYSTEM.opener, target: [0, -14.4, 0], dist: 20, halfWidth: 1.6, halfHeight: 6.4, side: 0.15, phoneDrop: -0.05 },
  { at: SYSTEM.lifecycle, target: [0, -14.4, 0], dist: 20, halfWidth: 1.6, halfHeight: 6.6, side: 0.15, phoneDrop: -0.1 },
  { at: SYSTEM.beyond, target: [-0.3, -12.6, 0], dist: 38, halfWidth: 2.4, halfHeight: 13, side: 0.18, phoneDrop: -0.05 },
  { at: SYSTEM.rules, target: [-0.3, -12.6, 0], dist: 38, halfWidth: 2.4, halfHeight: 13, side: 0.18, phoneDrop: -0.05 },
  { at: SYSTEM.person, target: [0, -0.9, 0], dist: 5, halfWidth: 1, halfHeight: 1.5, side: 0.12, phoneDrop: -0.1 },
  { at: SYSTEM.closing, target: [-0.2, -13, 0], dist: 24, halfWidth: 2.6, halfHeight: 0, side: 0.35, lift: 1.25, phoneDrop: -0.1 },
  { at: SYSTEM.summary, target: [-0.2, -13, 0], dist: 24, halfWidth: 2.6, halfHeight: 0, side: 0.4, lift: 1.25 },
]

/* ------------------------------------------------------- reduced motion -- */

const momentSets = [ROLES, GROUNDS, PURPOSE, NOTICE, CONSENT, SPLIT, RECORD, WITHDRAWAL, RIGHTS, DUTIES, CHILDREN, MANAGER, SYSTEM]

/**
 * Every position where the story has a complete state to show: each prologue
 * beat, each camera shot, each moment of every chapter told in moments.
 *
 * Under reduced motion the stage does not travel between these — it cuts. The
 * story position is snapped to the nearest one, so each step appears in its
 * finished state, with no camera movement and no animated travel, and the
 * whole story is still told.
 */
const REDUCED_KEYS: number[] = [
  ...new Set([
    ...Object.values(BEAT),
    ...SHOTS.map((shot) => shot.at),
    ...momentSets.flatMap((set) =>
      Object.entries(set)
        .filter(([name]) => name !== 'spacing')
        .map(([, value]) => value),
    ),
  ]),
].sort((a, b) => a - b)

/** The nearest complete state to a story position. */
export function nearestKey(position: number) {
  let best = REDUCED_KEYS[0]
  for (const key of REDUCED_KEYS) {
    if (Math.abs(key - position) < Math.abs(best - position)) best = key
    else if (key > position) break
  }
  return best
}
