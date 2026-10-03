import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'

/**
 * Strokes with a constant on-screen width.
 *
 * WebGL lines are always one device pixel, which on a phone is a hairline you
 * cannot see. These are the three.js "fat line" addons: the width is in CSS
 * pixels whatever the distance, so a route on the stage reads with the same
 * weight as the same route on a plate. Resolution is kept current by the
 * addon itself, per render.
 */
export interface StrokeOptions {
  width?: number
  dashed?: boolean
  dash?: number
  gap?: number
}

function material({ width = 1.5, dashed = false, dash = 0.08, gap = 0.07 }: StrokeOptions) {
  return new LineMaterial({
    linewidth: width,
    dashed,
    dashSize: dash,
    gapSize: gap,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  })
}

/** A continuous polyline through `points`. */
export function stroke(points: THREE.Vector3[], options: StrokeOptions = {}) {
  const geometry = new LineGeometry()
  geometry.setPositions(points.flatMap((p) => [p.x, p.y, p.z]))
  const line = new Line2(geometry, material(options))
  if (options.dashed) line.computeLineDistances()
  line.visible = false
  return line
}

/** Independent segments: every two points are one stroke. */
export function strokes(points: THREE.Vector3[], options: StrokeOptions = {}) {
  const geometry = new LineSegmentsGeometry()
  geometry.setPositions(points.flatMap((p) => [p.x, p.y, p.z]))
  const line = new LineSegments2(geometry, material(options))
  if (options.dashed) line.computeLineDistances()
  line.visible = false
  return line
}

export type Stroke = Line2 | LineSegments2

/** Sets a stroke's opacity and hides it entirely when it would not show. */
export function fade(line: Stroke, opacity: number) {
  line.material.opacity = opacity
  line.visible = opacity > 0.004
}

/** Fades any mesh whose material is transparent. */
export function fadeMesh(mesh: THREE.Mesh, opacity: number) {
  ;(mesh.material as THREE.Material).opacity = opacity
  mesh.visible = opacity > 0.004
}

/**
 * Draws only the first `fraction` of a stroke. Used for a route that fills in
 * behind the data as it travels. Allocation-free: it changes how many
 * segments are drawn, not the geometry.
 */
export function reveal(line: Line2, fraction: number, segmentCount: number) {
  line.geometry.instanceCount = Math.max(0, Math.round(fraction * segmentCount))
}

/** Points sampled along part of a curve, for building a stroke. */
export function along(curve: THREE.Curve<THREE.Vector3>, from: number, to: number, samples: number) {
  const out: THREE.Vector3[] = []
  for (let i = 0; i <= samples; i++) out.push(curve.getPoint(from + ((to - from) * i) / samples))
  return out
}

/** The twelve edges of a box, as segment pairs. */
export function boxEdges(w: number, h: number, d: number) {
  const x = w / 2
  const y = h / 2
  const z = d / 2
  const c = (sx: number, sy: number, sz: number) => new THREE.Vector3(sx * x, sy * y, sz * z)
  const pairs: THREE.Vector3[] = []
  for (const sy of [-1, 1])
    for (const sz of [-1, 1]) pairs.push(c(-1, sy, sz), c(1, sy, sz))
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) pairs.push(c(sx, -1, sz), c(sx, 1, sz))
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) pairs.push(c(sx, sy, -1), c(sx, sy, 1))
  return pairs
}

/**
 * Corner brackets on a box: the 3D form of the purpose mark. Only the corners
 * are drawn, so it reads as a stated limit rather than a container.
 */
export function bracketEdges(w: number, h: number, d: number, arm: number) {
  const x = w / 2
  const y = h / 2
  const z = d / 2
  const pairs: THREE.Vector3[] = []
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        // A flat frame (d = 0) has one face, and no depth arms.
        if (z === 0 && sz > 0) continue
        // Every point is its own vector, so callers can transform them in place.
        const corner = new THREE.Vector3(sx * x, sy * y, sz * z)
        pairs.push(corner.clone(), corner.clone().setX(sx * (x - arm)))
        pairs.push(corner.clone(), corner.clone().setY(sy * (y - arm)))
        if (z > 0) pairs.push(corner.clone(), corner.clone().setZ(sz * (z - Math.min(arm, z))))
      }
  return pairs
}

/** A closed rectangle in the XY plane, as a polyline. */
export function rectangle(cx: number, cy: number, w: number, h: number, z = 0) {
  const x = w / 2
  const y = h / 2
  return [
    new THREE.Vector3(cx - x, cy - y, z),
    new THREE.Vector3(cx + x, cy - y, z),
    new THREE.Vector3(cx + x, cy + y, z),
    new THREE.Vector3(cx - x, cy + y, z),
    new THREE.Vector3(cx - x, cy - y, z),
  ]
}
