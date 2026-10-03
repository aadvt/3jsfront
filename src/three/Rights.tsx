import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useStoryFrame } from './useStoryFrame'
import { stage } from './stageState'
import { RIGHTS } from './timeline'
import { fade, fadeMesh, rectangle, stroke, strokes, type Stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

/**
 * Chapter 11: what you can ask for.
 *
 * The camera comes back up the thread to you. Around you, six small tools sit
 * in a hexagonal ring — the shape of your data — each joined to you by a
 * faint line. As each right is named, its tool drifts in toward you and
 * lights, the rest recede, and it does one quiet thing:
 *
 *   - access: a small summary sheet comes up the thread to you;
 *   - correction: a data shape with a missing edge has it completed;
 *   - erasure: a data shape fades inside a bracket — the situations described;
 *   - grievance: a pulse goes from you, to the organisation, to the Board;
 *   - nomination: a second, dashed ring beside yours firms up;
 *   - withdrawal: the bead from chapter 10, down a short thread.
 *
 * Deliberately calmer than chapters 06 and 10: no failures, no flashes. This
 * chapter is about having the tools.
 */

type RightId = 'access' | 'correction' | 'erasure' | 'grievance' | 'nomination' | 'withdraw'
type Tone = keyof StageColors

/** Hexagonal ring around you: angle in degrees, in moment order. */
const RING: { id: RightId; angle: number }[] = [
  { id: 'access', angle: 120 },
  { id: 'correction', angle: 60 },
  { id: 'erasure', angle: 0 },
  { id: 'grievance', angle: 300 },
  { id: 'nomination', angle: 240 },
  { id: 'withdraw', angle: 180 },
]
const RX = 1.0
const RY = 1.12
const PULL = 0.72

const hexagon = (r: number, cx = 0, cy = 0) =>
  Array.from({ length: 7 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), 0)
  })

export function Rights({ colors }: { colors: StageColors }) {
  const r = useMemo(() => {
    const root = new THREE.Group()
    const paint: { material: { color: THREE.Color }; tone: Tone }[] = []
    const v = (x: number, y: number) => new THREE.Vector3(x, y, 0)
    const line = <T extends Stroke>(s: T, tone: Tone, parent: THREE.Object3D) => {
      paint.push({ material: s.material, tone })
      parent.add(s)
      return s
    }
    const mesh = (geometry: THREE.BufferGeometry, tone: Tone, parent: THREE.Object3D) => {
      const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      const m = new THREE.Mesh(geometry, material)
      m.visible = false
      paint.push({ material, tone })
      parent.add(m)
      return m
    }

    const tools = RING.map(({ id, angle }) => {
      const a = THREE.MathUtils.degToRad(angle)
      const home = v(Math.cos(a) * RX, Math.sin(a) * RY)
      const g = new THREE.Group()
      g.position.copy(home)
      root.add(g)
      // The line from you to the tool. Rewritten each frame as the tool moves.
      const tie = line(stroke([v(0, 0), home.clone()], { width: 1.25 }), 'inkMuted', root)
      tie.frustumCulled = false
      // A quiet disc behind each tool, so it reads as one thing.
      const disc = mesh(new THREE.CircleGeometry(0.24, 48), 'paperRaised', g)
      disc.position.z = -0.01
      const ring = line(stroke(hexagon(0.24), { width: 1 }), 'hairline', g)
      return { id, home, g, tie, disc, ring, parts: [] as Stroke[] }
    })
    const tool = (id: RightId) => tools.find((t) => t.id === id)!

    // access — a summary sheet
    const access = tool('access')
    access.parts.push(
      line(stroke(rectangle(0, 0, 0.18, 0.22), { width: 1.25 }), 'ink', access.g),
      line(strokes([v(-0.05, 0.05), v(0.05, 0.05), v(-0.05, 0), v(0.05, 0), v(-0.05, -0.05), v(0.02, -0.05)], { width: 1 }), 'inkMuted', access.g),
    )
    // the summary that comes back up the thread to you
    const summary = new THREE.Group()
    root.add(summary)
    const summaryPaper = mesh(new THREE.PlaneGeometry(0.14, 0.17), 'paperRaised', summary)
    const summaryEdge = line(stroke(rectangle(0, 0, 0.14, 0.17, 0.002), { width: 1.25 }), 'ink', summary)

    // correction — a data shape with one edge missing, completed
    const correction = tool('correction')
    const hexPts = hexagon(0.13)
    correction.parts.push(line(stroke(hexPts.slice(0, 6), { width: 1.75 }), 'data', correction.g))
    const missing = line(stroke([hexPts[5], hexPts[6]], { width: 1.75, dashed: true, dash: 0.025, gap: 0.02 }), 'inkMuted', correction.g)
    const completed = line(stroke([hexPts[5], hexPts[6]], { width: 2.25 }), 'data', correction.g)
    const correctionFill = mesh(new THREE.CircleGeometry(0.11, 6), 'data', correction.g)

    // erasure — a data shape inside a bracket (the situations described), fading
    const erasure = tool('erasure')
    const erasureShape = line(stroke(hexagon(0.11), { width: 1.75 }), 'data', erasure.g)
    erasure.parts.push(
      line(
        strokes(
          [v(-0.17, 0.12), v(-0.17, 0.17), v(-0.17, 0.17), v(-0.12, 0.17), v(0.17, 0.12), v(0.17, 0.17), v(0.17, 0.17), v(0.12, 0.17),
            v(-0.17, -0.12), v(-0.17, -0.17), v(-0.17, -0.17), v(-0.12, -0.17), v(0.17, -0.12), v(0.17, -0.17), v(0.17, -0.17), v(0.12, -0.17)],
          { width: 1.5 },
        ),
        'purpose',
        erasure.g,
      ),
    )
    const erasureGhost = line(stroke(hexagon(0.11), { width: 1.25, dashed: true, dash: 0.02, gap: 0.02 }), 'hairline', erasure.g)

    // grievance — you, the organisation, the Board: a path that goes on
    const grievance = tool('grievance')
    grievance.parts.push(
      line(stroke([v(-0.15, 0), v(0.12, 0)], { width: 1.25 }), 'inkMuted', grievance.g),
      line(stroke(rectangle(0.02, 0, 0.07, 0.07), { width: 3 }), 'ink', grievance.g),
      line(stroke(rectangle(0.15, 0, 0.09, 0.09), { width: 1.25 }), 'ink', grievance.g),
      line(stroke(rectangle(0.15, 0, 0.13, 0.13), { width: 1.25 }), 'ink', grievance.g),
    )
    const grievanceDot = mesh(new THREE.CircleGeometry(0.025, 20), 'ink', grievance.g)
    grievanceDot.position.set(-0.15, 0, 0.002)
    const pulse = mesh(new THREE.CircleGeometry(0.03, 20), 'ink', grievance.g)

    // nomination — your ring, and a second one: someone you name
    const nomination = tool('nomination')
    nomination.parts.push(
      line(stroke(Array.from({ length: 41 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2
        return v(-0.08 + Math.cos(a) * 0.07, Math.sin(a) * 0.07)
      }), { width: 1.5 }), 'ink', nomination.g),
      line(stroke([v(-0.01, 0), v(0.05, 0)], { width: 1.25 }), 'inkMuted', nomination.g),
    )
    const nomineeDashed = line(stroke(Array.from({ length: 41 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2
      return v(0.12 + Math.cos(a) * 0.07, Math.sin(a) * 0.07)
    }), { width: 1.5, dashed: true, dash: 0.02, gap: 0.02 }), 'inkMuted', nomination.g)
    const nomineeSolid = line(stroke(Array.from({ length: 41 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2
      return v(0.12 + Math.cos(a) * 0.07, Math.sin(a) * 0.07)
    }), { width: 1.5 }), 'ink', nomination.g)
    const youCore = mesh(new THREE.CircleGeometry(0.025, 20), 'ink', nomination.g)
    youCore.position.set(-0.08, 0, 0.002)

    // withdrawal — a short thread, a bead in the withdrawal tone, a stop
    const withdraw = tool('withdraw')
    withdraw.parts.push(
      line(stroke([v(0, 0.15), v(0, -0.12)], { width: 1.25 }), 'inkSoft', withdraw.g),
      line(strokes([v(-0.06, -0.12), v(0.06, -0.12)], { width: 2.5 }), 'withdraw', withdraw.g),
    )
    const bead = mesh(new THREE.CircleGeometry(0.04, 24), 'withdraw', withdraw.g)

    return {
      root, paint, tools, summary, summaryPaper, summaryEdge, missing, completed, correctionFill,
      erasureShape, erasureGhost, pulse, grievanceDot, nomineeDashed, nomineeSolid, youCore, bead,
    }
  }, [])

  useEffect(() => {
    for (const { material, tone } of r.paint) material.color.set(colors[tone])
  }, [colors, r])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = RIGHTS.spacing
    const present =
      span(pos, RIGHTS.opener - 0.4 * sp, RIGHTS.opener + 0.1 * sp) *
      (1 - span(pos, RIGHTS.summary - 0.45 * sp, RIGHTS.summary - 0.15 * sp))
    r.root.visible = present > 0.004
    if (!r.root.visible) return

    // Which tool is in hand, and how far.
    const level: Record<RightId, number> = {
      access: around(pos, RIGHTS.access, sp),
      correction: around(pos, RIGHTS.correction, sp),
      erasure: around(pos, RIGHTS.erasure, sp),
      grievance: around(pos, RIGHTS.grievance, sp),
      nomination: around(pos, RIGHTS.nomination, sp),
      withdraw: around(pos, RIGHTS.withdraw, sp),
    }
    const anyActive = Math.max(...Object.values(level))

    for (const t of r.tools) {
      const on = level[t.id]
      // In hand: drifts in toward you, a little larger. Otherwise it recedes.
      t.g.position.copy(t.home).multiplyScalar(lerp(1, PULL, on))
      t.g.scale.setScalar(lerp(1, 1.45, on))
      const seen = present * lerp(lerp(1, 0.35, anyActive), 1, on)
      fadeMesh(t.disc, seen)
      fade(t.ring, seen * lerp(0.6, 1, on))
      for (const part of t.parts) fade(part, seen)
      // The tie from you to it.
      const a = (t.tie.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
      const p = a.array as Float32Array
      const d = t.g.position.length()
      const inner = 0.24 / Math.max(d, 0.001)
      p[0] = t.g.position.x * 0.22
      p[1] = t.g.position.y * 0.22
      p[2] = -0.02
      p[3] = t.g.position.x * (1 - inner * t.g.scale.x)
      p[4] = t.g.position.y * (1 - inner * t.g.scale.x)
      p[5] = -0.02
      a.needsUpdate = true
      fade(t.tie, present * lerp(0.35, 1, on))
      t.tie.material.linewidth = lerp(1.25, 2, on)
    }

    const toolSeen = (id: RightId) => present * lerp(lerp(1, 0.35, anyActive), 1, level[id])
    const act = (at: number) => span(pos, at - 0.3 * sp, at + 0.05 * sp)

    // access: the summary comes up the thread to you
    const up = act(RIGHTS.access)
    const travelling = level.access * (up > 0.01 && up < 0.99 ? 1 : 0)
    r.summary.position.set(0, lerp(-1.5, -0.3, up), 0.05)
    fadeMesh(r.summaryPaper, travelling)
    fade(r.summaryEdge, travelling)

    // correction: the missing edge is completed
    const fixed = act(RIGHTS.correction) * level.correction
    fade(r.missing, toolSeen('correction') * (1 - fixed))
    fade(r.completed, toolSeen('correction') * fixed)
    fadeMesh(r.correctionFill, toolSeen('correction') * fixed * 0.35)

    // erasure: the shape fades, leaving its outline as a ghost
    const gone = act(RIGHTS.erasure) * level.erasure
    fade(r.erasureShape, toolSeen('erasure') * (1 - gone))
    fade(r.erasureGhost, toolSeen('erasure') * gone)

    // grievance: a pulse goes on past the organisation, to the Board
    const path = act(RIGHTS.grievance)
    r.pulse.position.set(lerp(-0.15, 0.15, path), 0, 0.003)
    fadeMesh(r.pulse, level.grievance * (path > 0.01 && path < 0.99 ? 1 : 0))
    fadeMesh(r.grievanceDot, toolSeen('grievance'))

    // nomination: the second ring firms up
    const named = act(RIGHTS.nomination) * level.nomination
    fade(r.nomineeDashed, toolSeen('nomination') * (1 - named))
    fade(r.nomineeSolid, toolSeen('nomination') * named)
    fadeMesh(r.youCore, toolSeen('nomination'))

    // withdrawal: the bead down a short thread
    const down = act(RIGHTS.withdraw)
    r.bead.position.set(0, lerp(0.15, -0.08, down), 0.003)
    fadeMesh(r.bead, toolSeen('withdraw'))
  })

  return <primitive object={r.root} />
}
