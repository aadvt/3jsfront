import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useStoryFrame } from './useStoryFrame'
import { stage } from './stageState'
import { RECORD } from './timeline'
import { bracketEdges, fade, fadeMesh, rectangle, stroke, strokes, type Stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { lerp, span } from '../utils/math'

/**
 * Chapter 08: the agreement has to be showable.
 *
 * A click is over in an instant; a record is not. Under your data a slip is
 * filled in, one field per moment, each from the thing that produced it:
 *
 *   - what you saw: a snapshot of the notice, with a line to the version it
 *     was — "version 1" on a small shelf of notice versions beside the slip;
 *   - what you decided: the three purposes, stamped in the states you left
 *     them in (allowed, declined, necessary);
 *   - when: a mark on a time rail, with an identifier strip under it;
 *   - which version: the notice changes. Version 2 arrives on the shelf;
 *     version 1 moves down and stays, and the slip still points at it.
 *
 * Then the slip is filed: it shrinks into the small record mark beside the
 * route (`Journey.tsx`), which stays for the rest of the story.
 */

/** Where the slip is filled in: below the data, a little in front of it. */
const SLIP_AT = new THREE.Vector3(-0.15, -17.3, 0.6)
/** Where the filed record lives for the rest of the story. Must match the record mark in Journey. */
const FILED_AT = new THREE.Vector3(-1.3, -16.25, 0.15)
const FILED_SCALE = 0.36
const W = 0.9
const H = 1.2
const SHELF_X = 0.8
const SNAP = new THREE.Vector2(-0.2, 0.3)

type Tone = keyof StageColors

export function Evidence({ colors }: { colors: StageColors }) {
  const e = useMemo(() => {
    const root = new THREE.Group()
    root.position.copy(SLIP_AT)
    const paint: { material: { color: THREE.Color }; tone: Tone }[] = []
    const v = (x: number, y: number, z = 0.004) => new THREE.Vector3(x, y, z)

    const mesh = (geometry: THREE.BufferGeometry, tone: Tone, parent: THREE.Object3D, order = 0) => {
      // Paper writes depth, so the routes and vendors behind the slip stay
      // behind it instead of showing through.
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: tone === 'paperRaised',
      })
      const m = new THREE.Mesh(geometry, material)
      m.visible = false
      m.renderOrder = order
      paint.push({ material, tone })
      parent.add(m)
      return m
    }
    const line = <T extends Stroke>(s: T, tone: Tone, parent: THREE.Object3D) => {
      s.renderOrder = 2
      paint.push({ material: s.material, tone })
      parent.add(s)
      return s
    }
    /** A small notice sheet: paper, an edge, and `rows` lines of text. */
    const sheet = (parent: THREE.Object3D, w: number, h: number, rows: number) => {
      const g = new THREE.Group()
      parent.add(g)
      const paper = mesh(new THREE.PlaneGeometry(w, h), 'paperRaised', g, 0)
      const edge = line(stroke(rectangle(0, 0, w, h, 0.002), { width: 1.25 }), 'inkMuted', g)
      const text = Array.from({ length: rows }, (_, i) => {
        const len = w * (i % 3 === 2 ? 0.45 : 0.7)
        const bar = mesh(new THREE.PlaneGeometry(len, h * 0.045), 'inkMuted', g, 1)
        bar.position.set(-w * 0.35 + len / 2, h * 0.36 - i * (h * 0.72) / Math.max(1, rows - 1), 0.003)
        return bar
      })
      return { g, paper, edge, text }
    }

    // ── the slip
    const slip = mesh(new THREE.PlaneGeometry(W, H), 'paperRaised', root, 0)
    const blank = line(
      stroke(rectangle(0, 0, W, H, 0.002), { width: 1.5, dashed: true, dash: 0.05, gap: 0.04 }),
      'inkMuted',
      root,
    )
    const edge = line(stroke(rectangle(0, 0, W, H, 0.002), { width: 1.75 }), 'ink', root)

    // what you saw: a snapshot of the notice
    const snapshot = sheet(root, 0.3, 0.38, 6)
    snapshot.g.position.set(SNAP.x, SNAP.y, 0)

    // what you decided: three purposes, in the states you left them in
    const purposeMarks = line(
      strokes([0.42, 0.3, 0.18].flatMap((y) => bracketEdges(0.09, 0.08, 0, 0.025).map((p) => p.add(v(0.12, y)))), {
        width: 1.25,
      }),
      'purpose',
      root,
    )
    const allowed = line(stroke([v(0.2, 0.42), v(0.38, 0.42)], { width: 2.5 }), 'grant', root)
    const necessary = line(stroke([v(0.2, 0.3), v(0.38, 0.3)], { width: 2.5 }), 'ink', root)
    const declined = line(stroke([v(0.2, 0.18), v(0.38, 0.18)], { width: 1.75, dashed: true, dash: 0.025, gap: 0.02 }), 'inkMuted', root)
    const declinedStop = line(strokes([v(0.29, 0.14), v(0.29, 0.22)], { width: 2.5 }), 'withdraw', root)

    // when: a time rail with a mark, and an identifier strip
    const rail = line(
      strokes(
        [v(-0.35, -0.22), v(0.35, -0.22), ...Array.from({ length: 8 }, (_, i) => [v(-0.35 + i * 0.1, -0.24), v(-0.35 + i * 0.1, -0.2)]).flat()],
        { width: 1.25 },
      ),
      'inkMuted',
      root,
    )
    const now = line(strokes([v(0.12, -0.3), v(0.12, -0.12)], { width: 3 }), 'ink', root)
    const id = Array.from({ length: 11 }, (_, i) => {
      const h = 0.04 + ((i * 37) % 5) * 0.012
      const bar = mesh(new THREE.PlaneGeometry(0.03, h), 'ink', root, 1)
      bar.position.set(-0.33 + i * 0.062, -0.44 + h / 2, 0.004)
      return bar
    })

    // which version: the shelf of notice versions beside the slip
    const shelf = new THREE.Group()
    shelf.position.set(SHELF_X, 0, 0)
    root.add(shelf)
    const v1 = sheet(shelf, 0.3, 0.36, 6)
    const v2 = sheet(shelf, 0.3, 0.36, 7)
    // From the snapshot to the version it was. Rewritten each frame to follow
    // version 1 as it moves down the shelf; it never lets go of it.
    const pointer = line(stroke([v(0, 0), v(1, 0)], { width: 1.5, dashed: true, dash: 0.035, gap: 0.03 }), 'ink', root)
    pointer.frustumCulled = false

    return {
      root, paint, slip, blank, edge, snapshot, purposeMarks, allowed, necessary, declined,
      declinedStop, rail, now, id, shelf, v1, v2, pointer,
    }
  }, [])

  useEffect(() => {
    for (const { material, tone } of e.paint) material.color.set(colors[tone])
  }, [colors, e])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = RECORD.spacing
    const at = (m: number) => span(pos, m - 0.45 * sp, m - 0.15 * sp)

    const present = at(RECORD.press)
    // Filed at the end: it moves to its place beside the route, shrinks to the
    // size of the record mark there, and hands over to it.
    const filing = span(pos, RECORD.summary - 0.5 * sp, RECORD.summary - 0.05 * sp)
    const whole = present * (1 - span(pos, RECORD.summary - 0.15 * sp, RECORD.summary - 0.02 * sp))
    e.root.visible = whole > 0.004
    if (!e.root.visible) return
    e.root.position.lerpVectors(SLIP_AT, FILED_AT, filing)
    e.root.scale.setScalar(lerp(1, FILED_SCALE, filing))

    const seen = at(RECORD.seen)
    const decided = at(RECORD.decided)
    const when = at(RECORD.when)
    const changed = at(RECORD.version)

    fadeMesh(e.slip, whole)
    fade(e.blank, whole * (1 - seen))
    fade(e.edge, whole * seen)

    const sheetLevel = (s: typeof e.snapshot, level: number) => {
      fadeMesh(s.paper, level)
      fade(s.edge, level)
      for (const bar of s.text) fadeMesh(bar, level * 0.85)
    }
    sheetLevel(e.snapshot, whole * seen)

    fade(e.purposeMarks, whole * decided)
    fade(e.allowed, whole * decided)
    fade(e.necessary, whole * decided)
    fade(e.declined, whole * decided)
    fade(e.declinedStop, whole * decided)

    fade(e.rail, whole * when)
    fade(e.now, whole * when)
    for (const bar of e.id) fadeMesh(bar, whole * when * 0.9)

    // The shelf: version 1 when you saw it; then version 2 arrives on top and
    // version 1 moves down — kept, not replaced. The shelf leaves before filing.
    const shelfLevel = whole * (1 - filing)
    const v1y = lerp(0.3, -0.2, changed)
    e.v1.g.position.set(0, v1y, 0)
    sheetLevel(e.v1, shelfLevel * seen * lerp(1, 0.7, changed))
    e.v2.g.position.set(lerp(0.4, 0, changed), 0.3, 0.01)
    sheetLevel(e.v2, shelfLevel * changed)

    const a = (e.pointer.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
    const p = a.array as Float32Array
    p[0] = SNAP.x + 0.15
    p[1] = SNAP.y
    p[2] = 0.006
    p[3] = SHELF_X - 0.15
    p[4] = v1y
    p[5] = 0.006
    a.needsUpdate = true
    fade(e.pointer, shelfLevel * seen)
  })

  return <primitive object={e.root} />
}
