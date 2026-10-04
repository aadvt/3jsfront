import { clamp01 } from '../utils/math'

/**
 * Per-frame values every part of the scene reads, written once per frame by
 * the rig (mounted first, so its frame callback runs first).
 */
export const stage = {
  /** The journey position, damped: what the camera actually shows. */
  pos: -1,
  elapsed: 0,
  /** Reduced motion: cut between complete states, no idle animation. */
  still: false,
}

/** 1 while a station is framed, falling to 0 a station away. */
export function presence(index: number) {
  const near = clamp01(1 - Math.abs(stage.pos - index) * 1.15)
  // In the overview the first stations stand assembled, so the route reads as
  // a route; the rest wait, out of the way of the title.
  const overview = index < 5 ? clamp01(-stage.pos * 1.4) : 0
  return Math.max(near, overview)
}

/** An eased reveal for the n-th part of a station, so models assemble in order. */
export function reveal(index: number, order: number) {
  const t = clamp01(presence(index) * 1.9 - order * 0.14)
  return 1 - (1 - t) * (1 - t) * (1 - t)
}

