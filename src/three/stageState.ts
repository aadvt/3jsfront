import * as THREE from 'three'
import { AT, SPINE, spineT } from './timeline'

/**
 * Per-frame values every part of the scene reads. Written once per frame by
 * `Director` (mounted first, so it runs first) and read by everything else in
 * their own `useFrame`. A plain mutable object for the same reason the story
 * store is one: nothing here may cause a React render.
 */
export const stage = {
  /** The damped story position. Everything on stage keys off this. */
  pos: -1,
  /** 0 → 1 as the data first leaves you when the page opens. */
  intro: 0,
  /** Where the data is, in world space. */
  data: new THREE.Vector3(...SPINE[AT.rest]),
  /** The data's parameter along the spine curve. */
  dataT: spineT(AT.rest),
  elapsed: 0,
  /**
   * Whether the stage may move on its own (the data's slow sway). Only with
   * a mouse and without reduced motion: on a phone, a resting stage should
   * render nothing at all.
   */
  idle: false,
  /**
   * Chapter 10, as 0 → 1 progress for each thing withdrawal changes, in the
   * order it changes them. Computed by `Director` from scroll, or from the
   * time since the visitor pressed the control — whichever is further on.
   */
  withdrawal: { bead: 0, drain: 0, stop: 0, record: 0, systems: 0 },
}

/** The route, as one curve. Built once and shared. */
export const spine = new THREE.CatmullRomCurve3(
  SPINE.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

/** A point on the spine at a landmark index, for building geometry. */
export function spinePoint(index: number, offset: [number, number, number] = [0, 0, 0]) {
  return spine.getPoint(spineT(index)).add(new THREE.Vector3(...offset))
}
