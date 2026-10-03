import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spinePoint } from './stageState'
import { AT, MANAGER } from './timeline'
import { boxEdges, fade, fadeMesh, rectangle, stroke, strokes, type Stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { lerp, span } from '../utils/math'

/**
 * Chapter 14: a Consent Manager is not a consent tool.
 *
 * One composition, built step by step above the data:
 *
 *   1. two identical holders, side by side, each with a record, each linked
 *      down to your data — the confusion, shown honestly;
 *   2. a divider appears and they separate: one to your side, joined to you
 *      and registered with the Data Protection Board (the double square);
 *   3. from your side, it reaches across to several organisations — one
 *      place to give, see, review and withdraw;
 *   4. the other settles inside the organisation's boundary, beside the
 *      fiduciary that runs it — software;
 *   5. a line from it toward the Board is stopped — deploying it registers
 *      nobody — and its line to the fiduciary firms: the duty stays there.
 *
 * Related, not the same: they hold the same kind of record about the same
 * data, and stand in different worlds.
 */

type Tone = keyof StageColors

const HOLDER_Y = 0.78
const MANAGER_AT = new THREE.Vector3(-0.78, HOLDER_Y, 0)
const PLATFORM_AT = new THREE.Vector3(0.78, HOLDER_Y, 0)
const YOU_AT = new THREE.Vector3(-1.5, HOLDER_Y, 0)
const BOARD_AT = new THREE.Vector3(-0.78, 1.78, 0)
const FIDUCIARY_AT = new THREE.Vector3(1.5, HOLDER_Y, 0)
const OTHERS = [new THREE.Vector3(0.7, -0.55, 0), new THREE.Vector3(1.32, -0.42, 0)]

export function ConsentManager({ colors }: { colors: StageColors }) {
  const camera = useThree((s) => s.camera)

  const m = useMemo(() => {
    const root = new THREE.Group()
    root.position.copy(spinePoint(AT.manager))
    const paint: { material: { color: THREE.Color }; tone: Tone }[] = []
    const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)
    const line = <T extends Stroke>(s: T, tone: Tone, parent: THREE.Object3D = root) => {
      paint.push({ material: s.material, tone })
      parent.add(s)
      return s
    }
    const mesh = (geometry: THREE.BufferGeometry, tone: Tone, lit = false, parent: THREE.Object3D = root) => {
      const material = lit
        ? new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, opacity: 0 })
        : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: tone === 'paperRaised' })
      const mm = new THREE.Mesh(geometry, material)
      mm.visible = false
      paint.push({ material, tone })
      parent.add(mm)
      return mm
    }
    /** A holder: a slab with a record slip on it. Both are made identically. */
    const holder = () => {
      const g = new THREE.Group()
      root.add(g)
      const slab = mesh(new THREE.BoxGeometry(0.46, 0.58, 0.08), 'paperRaised', false, g)
      const edge = line(strokes(boxEdges(0.46, 0.58, 0.08), { width: 1.25 }), 'inkSoft', g)
      const slip = line(stroke(rectangle(0, 0, 0.2, 0.26, 0.05), { width: 1.25 }), 'ink', g)
      const rules = line(
        strokes([v(-0.05, 0.05, 0.05), v(0.05, 0.05, 0.05), v(-0.05, 0, 0.05), v(0.05, 0, 0.05), v(-0.05, -0.05, 0.05), v(0.02, -0.05, 0.05)], {
          width: 1,
        }),
        'inkMuted',
        g,
      )
      // its link down to the data it holds a record about
      const down = line(stroke([v(0, 0), v(0, -1)], { width: 1, dashed: true, dash: 0.035, gap: 0.03 }), 'inkMuted')
      down.frustumCulled = false
      return { g, slab, edge, slip, rules, down }
    }
    const manager = holder()
    const platform = holder()

    // the two worlds
    const divider = line(stroke([v(0, 2.15), v(0, 0.3)], { width: 1.25, dashed: true, dash: 0.06, gap: 0.05 }), 'hairline')

    // your side: you, the Board, registration
    const youCore = mesh(new THREE.SphereGeometry(0.06, 24, 12), 'ink', true)
    youCore.position.copy(YOU_AT)
    const youRing = mesh(new THREE.TorusGeometry(0.15, 0.007, 8, 64), 'inkMuted')
    youRing.position.copy(YOU_AT)
    const toYou = line(stroke([YOU_AT.clone().add(v(0.17, 0)), MANAGER_AT.clone().add(v(-0.24, 0))], { width: 2 }), 'ink')
    const board = line(
      strokes([...boxEdges(0.2, 0.2, 0).map((p) => p.add(BOARD_AT)), ...boxEdges(0.3, 0.3, 0).map((p) => p.add(BOARD_AT))], {
        width: 1.5,
      }),
      'ink',
    )
    const registered = line(stroke([MANAGER_AT.clone().add(v(0, 0.3)), BOARD_AT.clone().add(v(0, -0.16))], { width: 2 }), 'ink')

    // across: one place, many organisations
    const fiduciary = mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), 'ink', true)
    fiduciary.position.copy(FIDUCIARY_AT)
    const others = OTHERS.map((p) => {
      const o = mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), 'ink', true)
      o.position.copy(p)
      return o
    })
    const across = line(
      strokes(
        [FIDUCIARY_AT, ...OTHERS].flatMap((p) => [MANAGER_AT.clone().add(v(0.1, -0.3)), p.clone().add(v(-0.08, 0.05))]),
        { width: 1.25, dashed: true, dash: 0.04, gap: 0.035 },
      ),
      'grant',
    )

    // the organisation's side: its boundary, the platform inside it
    const domain = line(stroke(rectangle(1.14, HOLDER_Y, 1.0, 0.82), { width: 1.5, dashed: true, dash: 0.05, gap: 0.04 }), 'ink')
    const runs = line(stroke([PLATFORM_AT.clone().add(v(0.24, 0)), FIDUCIARY_AT.clone().add(v(-0.11, 0))], { width: 2 }), 'ink')

    // the qualification: no registration from deploying software
    const stopAt = PLATFORM_AT.clone().lerp(BOARD_AT, 0.48)
    const attempt = line(
      stroke([PLATFORM_AT.clone().add(v(-0.1, 0.3)), stopAt], { width: 1.5, dashed: true, dash: 0.04, gap: 0.035 }),
      'inkMuted',
    )
    const dir = BOARD_AT.clone().sub(PLATFORM_AT).normalize()
    const perp = v(-dir.y, dir.x).multiplyScalar(0.11)
    const refused = line(strokes([stopAt.clone().add(perp), stopAt.clone().sub(perp)], { width: 3 }), 'withdraw')

    return {
      root, paint, manager, platform, divider, youCore, youRing, toYou, board, registered,
      fiduciary, others, across, domain, runs, attempt, refused,
    }
  }, [])

  useEffect(() => {
    for (const { material, tone } of m.paint) material.color.set(colors[tone])
  }, [colors, m])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = MANAGER.spacing
    const at = (k: number) => span(pos, k - 0.45 * sp, k - 0.15 * sp)

    const present = at(MANAGER.alike) * lerp(1, 0.45, span(pos, MANAGER.summary + 0.2 * sp, MANAGER.summary + 0.6 * sp))
    m.root.visible = present > 0.004
    if (!m.root.visible) return

    const apart = at(MANAGER.manager)
    const reach = at(MANAGER.reach)
    const platformIn = at(MANAGER.platform)
    const qualified = at(MANAGER.qualification)

    // 1–2: identical and side by side, then apart, to their own sides
    m.manager.g.position.set(lerp(-0.3, MANAGER_AT.x, apart), HOLDER_Y, 0)
    m.platform.g.position.set(lerp(0.3, PLATFORM_AT.x, apart), HOLDER_Y, 0)
    for (const h of [m.manager, m.platform]) {
      fadeMesh(h.slab, present)
      fade(h.edge, present)
      fade(h.slip, present)
      fade(h.rules, present)
      const a = (h.down.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
      const p = a.array as Float32Array
      p[0] = h.g.position.x
      p[1] = HOLDER_Y - 0.3
      p[2] = 0
      p[3] = 0
      p[4] = 0.4
      p[5] = 0
      a.needsUpdate = true
      fade(h.down, present * 0.8)
    }

    fade(m.divider, present * apart)
    fadeMesh(m.youCore, present * apart)
    fadeMesh(m.youRing, present * apart)
    m.youRing.quaternion.copy(camera.quaternion)
    fade(m.toYou, present * apart)
    fade(m.board, present * apart)
    fade(m.registered, present * apart)

    // 3: from your side, across to several organisations
    fadeMesh(m.fiduciary, present * reach)
    for (const o of m.others) fadeMesh(o, present * reach)
    fade(m.across, present * reach * lerp(1, 0.45, platformIn))

    // 4: the platform inside the organisation's boundary
    fade(m.domain, present * platformIn)
    fade(m.runs, present * platformIn)
    m.runs.material.linewidth = lerp(2, 3.5, qualified)

    // 5: deploying it registers nobody
    fade(m.attempt, present * qualified)
    fade(m.refused, present * qualified)
  })

  return <primitive object={m.root} />
}
