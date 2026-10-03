import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useStoryFrame } from './useStoryFrame'
import { stage } from './stageState'
import { CH, DUTIES } from './timeline'
import { FIDUCIARY, PROCESSOR } from './System'
import { fade, fadeMesh, rectangle, stroke, strokes, type Stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

/**
 * Chapter 12: the other end of every line.
 *
 * The counterpart of chapter 11. There, you sat at the centre of a ring of
 * tools — your rights. Here the view turns to the organisation: the
 * fiduciary sits at the centre of its own ring — seven duties — and consent
 * handling is just one node on it. It lights first, alone, as if consent were
 * the whole law; then the other six arrive around it.
 *
 *   consent       a checkpoint ring with its bead (chapters 06–10)
 *   lawful        the barred fork (chapter 03)
 *   security      your data inside a double enclosure — not a padlock
 *   accuracy      two identical data shapes: a copy shared on, still true
 *   rights        a line back up to you (chapter 11, from the other end)
 *   processors    a contract between the solid block and the dashed one
 *   retention     a route held in a bracket, then cut off
 *
 * Below the ring, inside a dashed bracket — dashed because it applies only
 * to organisations the Government designates — three more: a Data
 * Protection Officer, an independent auditor, periodic assessments.
 */

type DutyId = 'consent' | 'lawful' | 'security' | 'accuracy' | 'rights' | 'processors' | 'retention'
type Tone = keyof StageColors

const ORDER: DutyId[] = ['consent', 'lawful', 'security', 'accuracy', 'rights', 'processors', 'retention']
const RX = 1.0
const RY = 1.12
const PULL = 0.74
const NODE = 0.22
const SIGNIFICANT_Y = -1.75
/** You, at the top of the world: where the rights line goes back to. */
const YOU = new THREE.Vector3(0, 0, 0)

const circle = (r: number, cx = 0, cy = 0, sy = 1) =>
  Array.from({ length: 41 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2
    return new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy, 0)
  })
const hexagon = (r: number, cx = 0, cy = 0) =>
  Array.from({ length: 7 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), 0)
  })

export function Duties({ colors }: { colors: StageColors }) {
  const d = useMemo(() => {
    const root = new THREE.Group()
    root.position.copy(FIDUCIARY)
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
    /** A node: a quiet disc with a square outline — the fiduciary's own mark. */
    const node = (parent: THREE.Object3D, at: THREE.Vector3) => {
      const g = new THREE.Group()
      g.position.copy(at)
      parent.add(g)
      const disc = mesh(new THREE.CircleGeometry(NODE, 48), 'paperRaised', g)
      disc.position.z = -0.01
      const edge = line(stroke(rectangle(0, 0, NODE * 1.9, NODE * 1.9), { width: 1 }), 'hairline', g)
      return { g, disc, edge, parts: [] as Stroke[], meshes: [] as THREE.Mesh[] }
    }

    const duties = ORDER.map((id, k) => {
      const a = Math.PI / 2 + (k / ORDER.length) * Math.PI * 2
      const home = v(Math.cos(a) * RX, Math.sin(a) * RY)
      const n = node(root, home)
      const tie = line(stroke([v(0, 0), home.clone()], { width: 1.25 }), 'inkMuted', root)
      tie.frustumCulled = false
      return { id, home, ...n, tie }
    })
    const duty = (id: DutyId) => duties.find((x) => x.id === id)!

    // consent — a checkpoint ring, its thread, its bead
    const consent = duty('consent')
    consent.parts.push(
      line(stroke([v(0, 0.16), v(0, -0.12)], { width: 1 }), 'inkSoft', consent.g),
      line(stroke(circle(0.11, 0, -0.02, 0.4), { width: 1.75 }), 'grant', consent.g),
    )
    consent.meshes.push(mesh(new THREE.CircleGeometry(0.035, 20), 'grant', consent.g))
    consent.meshes[0].position.set(0, 0.08, 0.003)

    // lawful — the barred fork
    const lawful = duty('lawful')
    lawful.parts.push(
      line(stroke([v(0, 0.15), v(0, 0.06), v(-0.1, -0.04), v(0, -0.14)], { width: 1.5 }), 'ink', lawful.g),
      line(stroke([v(0, 0.06), v(0.1, -0.04), v(0, -0.14)], { width: 1.25, dashed: true, dash: 0.02, gap: 0.02 }), 'inkMuted', lawful.g),
      line(strokes([v(-0.05, 0.01), v(0.05, 0.01)], { width: 2.5 }), 'withdraw', lawful.g),
    )

    // security — your data inside a double enclosure
    const security = duty('security')
    security.parts.push(
      line(stroke(hexagon(0.06), { width: 1.75 }), 'data', security.g),
      line(stroke(rectangle(0, 0, 0.2, 0.2), { width: 1.5 }), 'ink', security.g),
      line(stroke(rectangle(0, 0, 0.27, 0.27), { width: 1 }), 'ink', security.g),
    )

    // accuracy — a copy shared on, identical
    const accuracy = duty('accuracy')
    accuracy.parts.push(
      line(stroke(hexagon(0.06, -0.09), { width: 1.75 }), 'data', accuracy.g),
      line(stroke(hexagon(0.06, 0.09), { width: 1.75 }), 'data', accuracy.g),
      line(stroke([v(-0.03, 0), v(0.03, 0)], { width: 1, dashed: true, dash: 0.012, gap: 0.01 }), 'inkMuted', accuracy.g),
    )

    // rights — you, and a line to the organisation
    const rights = duty('rights')
    rights.parts.push(
      line(stroke(circle(0.045, -0.09, 0.05), { width: 1.25 }), 'inkMuted', rights.g),
      line(stroke([v(-0.06, 0.03), v(0.06, -0.04)], { width: 1.25 }), 'ink', rights.g),
      line(stroke(rectangle(0.09, -0.06, 0.06, 0.06), { width: 2.5 }), 'ink', rights.g),
    )
    rights.meshes.push(mesh(new THREE.CircleGeometry(0.018, 16), 'ink', rights.g))
    rights.meshes[0].position.set(-0.09, 0.05, 0.003)

    // processors — a contract between the solid block and the dashed one
    const processors = duty('processors')
    processors.parts.push(
      line(stroke(rectangle(-0.12, 0, 0.07, 0.07), { width: 3 }), 'ink', processors.g),
      line(stroke(rectangle(0.12, 0, 0.07, 0.07), { width: 1.25, dashed: true, dash: 0.015, gap: 0.012 }), 'ink', processors.g),
      line(stroke(rectangle(0, 0, 0.06, 0.08), { width: 1.25 }), 'ink', processors.g),
      line(strokes([v(-0.085, 0), v(-0.03, 0), v(0.03, 0), v(0.085, 0)], { width: 1 }), 'inkMuted', processors.g),
    )

    // retention — a route held in a bracket, then cut off
    const retention = duty('retention')
    retention.parts.push(
      line(stroke([v(-0.15, 0), v(0.05, 0)], { width: 1.75 }), 'ink', retention.g),
      line(strokes([v(0.05, -0.06), v(0.07, -0.06), v(0.07, -0.06), v(0.07, 0.06), v(0.07, 0.06), v(0.05, 0.06)], { width: 1.5 }), 'purpose', retention.g),
      line(stroke([v(0.1, 0), v(0.17, 0)], { width: 1, dashed: true, dash: 0.012, gap: 0.012 }), 'hairline', retention.g),
    )

    // The two duties with a real counterpart on stage, drawn to it when named:
    // rights back to you; processors to the processor it engaged.
    const toYou = line(stroke([v(0, 0), v(0, 1)], { width: 1.5 }), 'ink', root)
    toYou.frustumCulled = false
    const toProcessor = line(stroke([v(0, 0), v(1, 0)], { width: 1.5, dashed: true, dash: 0.04, gap: 0.035 }), 'ink', root)
    toProcessor.frustumCulled = false

    // Significant Data Fiduciaries: three more, inside a dashed bracket.
    const significant = new THREE.Group()
    significant.position.set(0, SIGNIFICANT_Y, 0)
    root.add(significant)
    const bracket = line(
      stroke(rectangle(0, 0, 1.6, 0.62), { width: 1.25, dashed: true, dash: 0.05, gap: 0.04 }),
      'inkMuted',
      significant,
    )
    const extras = [-0.5, 0, 0.5].map((x) => node(significant, v(x, 0)))
    // a Data Protection Officer — a person, inside the organisation's square
    extras[0].parts.push(
      line(stroke(circle(0.05, 0, 0.02), { width: 1.25 }), 'ink', extras[0].g),
      line(stroke([v(-0.08, -0.1), v(-0.06, -0.05), v(0.06, -0.05), v(0.08, -0.1)], { width: 1.25 }), 'ink', extras[0].g),
    )
    // an independent auditor — a person outside, reading the record
    extras[1].parts.push(
      line(stroke(circle(0.04, -0.09, 0.04), { width: 1.25 }), 'ink', extras[1].g),
      line(stroke(rectangle(0.07, -0.02, 0.09, 0.12), { width: 1.25 }), 'ink', extras[1].g),
      line(strokes([v(0.04, 0.01), v(0.1, 0.01), v(0.04, -0.03), v(0.1, -0.03)], { width: 1 }), 'inkMuted', extras[1].g),
    )
    // periodic assessments — a time rail with repeating marks
    extras[2].parts.push(
      line(stroke([v(-0.15, -0.04), v(0.15, -0.04)], { width: 1.25 }), 'inkMuted', extras[2].g),
      line(strokes([-0.1, 0, 0.1].flatMap((x) => [v(x, -0.04), v(x, 0.07)]), { width: 2.5 }), 'ink', extras[2].g),
    )

    return { root, paint, duties, toYou, toProcessor, significant, bracket, extras }
  }, [])

  useEffect(() => {
    for (const { material, tone } of d.paint) material.color.set(colors[tone])
  }, [colors, d])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = DUTIES.spacing

    // Arrives with the chapter; afterwards it stays, quieter, so the
    // whole-system view in chapter 15 still shows what the organisation owes.
    const present = span(pos, DUTIES.opener - 0.45 * sp, DUTIES.opener)
    const after = lerp(1, 0.5, span(pos, DUTIES.summary, DUTIES.summary + 0.3 * sp))
    const away = 1 - span(pos, CH.children - 0.3, CH.children) * (1 - span(pos, CH.system, CH.system + 0.3))
    const shown = present * after * away
    d.root.visible = shown > 0.004
    if (!d.root.visible) return

    // Consent first, alone; the other six arrive around it.
    const othersIn = span(pos, DUTIES.banner - 0.25 * sp, DUTIES.banner + 0.15 * sp)
    const level: Record<DutyId, number> = {
      consent: around(pos, DUTIES.banner, sp),
      lawful: around(pos, DUTIES.lawful, sp),
      security: around(pos, DUTIES.security, sp),
      accuracy: around(pos, DUTIES.accuracy, sp),
      rights: around(pos, DUTIES.rights, sp),
      processors: around(pos, DUTIES.processors, sp),
      retention: around(pos, DUTIES.retention, sp),
    }
    const significantOn = around(pos, DUTIES.significant, sp)
    const anyActive = Math.max(...Object.values(level), significantOn)

    for (const n of d.duties) {
      const on = level[n.id]
      const arrived = n.id === 'consent' ? 1 : othersIn
      n.g.position.copy(n.home).multiplyScalar(lerp(1, PULL, on))
      n.g.scale.setScalar(lerp(1, 1.4, on))
      const seen = shown * arrived * lerp(lerp(1, 0.35, anyActive), 1, on)
      fadeMesh(n.disc, seen)
      fade(n.edge, seen * lerp(0.6, 1, on))
      for (const part of n.parts) fade(part, seen)
      for (const m of n.meshes) fadeMesh(m, seen)
      const a = (n.tie.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
      const p = a.array as Float32Array
      const len = n.g.position.length()
      const out = (NODE * n.g.scale.x) / Math.max(len, 0.001)
      p[0] = n.g.position.x * (0.31 / len)
      p[1] = n.g.position.y * (0.31 / len)
      p[2] = -0.02
      p[3] = n.g.position.x * (1 - out)
      p[4] = n.g.position.y * (1 - out)
      p[5] = -0.02
      a.needsUpdate = true
      fade(n.tie, seen * lerp(0.5, 1, on))
    }

    // The two duties with a counterpart on stage reach to it.
    const reach = (s: Stroke, from: THREE.Vector3, to: THREE.Vector3, level: number) => {
      const a = (s.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
      const p = a.array as Float32Array
      p[0] = from.x
      p[1] = from.y
      p[2] = 0.01
      p[3] = to.x - FIDUCIARY.x
      p[4] = to.y - FIDUCIARY.y
      p[5] = to.z - FIDUCIARY.z
      a.needsUpdate = true
      fade(s, shown * level)
    }
    const rightsNode = d.duties[ORDER.indexOf('rights')].g.position
    const processorsNode = d.duties[ORDER.indexOf('processors')].g.position
    reach(d.toYou, rightsNode, YOU, span(level.rights, 0.4, 0.9))
    reach(d.toProcessor, processorsNode, PROCESSOR, span(level.processors, 0.4, 0.9))

    // Significant Data Fiduciaries — conditional, so dashed, and quieter
    // whenever it is not the subject.
    const sdf = shown * span(pos, DUTIES.significant - 0.45 * sp, DUTIES.significant - 0.15 * sp)
    const sdfSeen = sdf * lerp(0.55, 1, significantOn)
    fade(d.bracket, sdfSeen)
    for (const n of d.extras) {
      fadeMesh(n.disc, sdfSeen)
      fade(n.edge, sdfSeen * 0.8)
      for (const part of n.parts) fade(part, sdfSeen)
    }
  })

  return <primitive object={d.root} />
}

