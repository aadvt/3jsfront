import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spinePoint } from './stageState'
import { AT, CH, CHILDREN } from './timeline'
import { fade, fadeMesh, rectangle, stroke, strokes, type Stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

/**
 * Chapter 13: under eighteen changes the rules.
 *
 * Additional protection, drawn as protection rather than as a warning:
 *
 *   - a child's data: a calm double wall closes around the data, inside its
 *     purpose — a room, in ink, not an alarm;
 *   - verifiable consent: a guardian (the same mark as you) appears above;
 *     their thread comes down through a single verification ring, and a bead
 *     in the consent tone goes through it into the room;
 *   - what stays out: four reaches come at the room from outside and are
 *     stopped at its wall — even with the guardian's line connected;
 *   - verification as prescribed: the ring is singled out, with a rule slip
 *     beside it. The page draws no particular method of checking; the text
 *     carries the qualification.
 *
 * One composition, one camera position: on a phone the flow is just the
 * card changing and the picture filling in.
 */

type Tone = keyof StageColors

/** The room's half-size, centred on the data. */
const ROOM = 0.48
const GUARDIAN = new THREE.Vector3(-0.75, 1.45, 0)
const ENTRY = new THREE.Vector3(-0.22, ROOM, 0)
const CHECK = GUARDIAN.clone().lerp(ENTRY, 0.5)
const REACHES = [0.33, 0.11, -0.11, -0.33]

export function Children({ colors }: { colors: StageColors }) {
  const camera = useThree((s) => s.camera)

  const c = useMemo(() => {
    const root = new THREE.Group()
    root.position.copy(spinePoint(AT.children))
    const paint: { material: { color: THREE.Color }; tone: Tone }[] = []
    const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)
    const line = <T extends Stroke>(s: T, tone: Tone, parent: THREE.Object3D = root) => {
      paint.push({ material: s.material, tone })
      parent.add(s)
      return s
    }
    const mesh = (geometry: THREE.BufferGeometry, tone: Tone, lit = false, parent: THREE.Object3D = root) => {
      const material = lit
        ? new THREE.MeshStandardMaterial({ roughness: 0.4, transparent: true, opacity: 0 })
        : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      const m = new THREE.Mesh(geometry, material)
      m.visible = false
      paint.push({ material, tone })
      parent.add(m)
      return m
    }

    // the room
    const floor = mesh(new THREE.PlaneGeometry(ROOM * 2, ROOM * 2), 'paperRaised')
    floor.position.z = -0.08
    const outer = line(stroke(rectangle(0, 0, ROOM * 2, ROOM * 2, -0.02), { width: 2 }), 'ink')
    const inner = line(stroke(rectangle(0, 0, ROOM * 2 - 0.1, ROOM * 2 - 0.1, -0.02), { width: 1 }), 'ink')
    // where the guardian's consent enters: lit once it has
    const entry = line(strokes([v(ENTRY.x - 0.12, ROOM, 0), v(ENTRY.x + 0.12, ROOM, 0)], { width: 3 }), 'grant')

    // the guardian, their thread, the verification ring on it
    const guardian = new THREE.Group()
    guardian.position.copy(GUARDIAN)
    root.add(guardian)
    const guardianCore = mesh(new THREE.SphereGeometry(0.06, 24, 12), 'ink', true, guardian)
    const guardianRing = mesh(new THREE.TorusGeometry(0.15, 0.007, 8, 64), 'inkMuted', false, guardian)
    const thread = line(stroke([GUARDIAN.clone(), ENTRY.clone()], { width: 1.5 }), 'inkSoft')
    const check = mesh(new THREE.TorusGeometry(0.13, 0.018, 10, 64), 'inkMuted')
    check.position.copy(CHECK)
    const bead = mesh(new THREE.SphereGeometry(0.065, 24, 12), 'grant', true)
    // the rule the check follows: a small slip beside the ring
    const rule = new THREE.Group()
    rule.position.copy(CHECK).add(v(-0.36, 0.02))
    root.add(rule)
    const ruleEdge = line(stroke(rectangle(0, 0, 0.16, 0.2, 0.01), { width: 1.25 }), 'ink', rule)
    const ruleText = line(
      strokes([v(-0.04, 0.04, 0.01), v(0.04, 0.04, 0.01), v(-0.04, 0, 0.01), v(0.04, 0, 0.01), v(-0.04, -0.04, 0.01), v(0.02, -0.04, 0.01)], {
        width: 1,
      }),
      'inkMuted',
      rule,
    )
    const ruleLink = line(stroke([CHECK.clone().add(v(-0.28, 0.02)), CHECK.clone().add(v(-0.14, 0))], { width: 1, dashed: true, dash: 0.02, gap: 0.02 }), 'inkMuted')

    // what stays out: reaches from outside, stopped at the wall
    const reaches = line(
      strokes(REACHES.flatMap((y) => [v(1.45, y + 0.08), v(ROOM + 0.1, y)]), {
        width: 1.5,
        dashed: true,
        dash: 0.04,
        gap: 0.035,
      }),
      'inkMuted',
    )
    const stops = line(
      strokes(REACHES.flatMap((y) => [v(ROOM + 0.07, y - 0.08), v(ROOM + 0.07, y + 0.08)]), { width: 3 }),
      'withdraw',
    )

    return {
      root, paint, floor, outer, inner, entry, guardianCore, guardianRing, thread, check, bead,
      ruleEdge, ruleText, ruleLink, reaches, stops,
    }
  }, [])

  const tones = useMemo(() => ({ idle: new THREE.Color(), pass: new THREE.Color(), strong: new THREE.Color() }), [])
  useEffect(() => {
    for (const { material, tone } of c.paint) material.color.set(colors[tone])
    tones.idle.set(colors.inkMuted)
    tones.pass.set(colors.grant)
    tones.strong.set(colors.ink)
  }, [colors, c, tones])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = CHILDREN.spacing
    const at = (m: number) => span(pos, m - 0.45 * sp, m - 0.15 * sp)

    // Built over the chapter; kept, quieter, while the next chapter is near.
    // It steps aside entirely while chapter 14 draws just below it, and
    // returns, quieter, for the whole-system view.
    const aside = span(pos, CH.manager - 0.15, CH.manager + 0.05) * (1 - span(pos, CH.system, CH.system + 0.3))
    const present = at(CHILDREN.child) * lerp(1, 0.45, span(pos, CHILDREN.summary, CHILDREN.summary + 0.5 * sp)) * (1 - aside)
    c.root.visible = present > 0.004
    if (!c.root.visible) return

    // the room
    fadeMesh(c.floor, present * 0.75)
    fade(c.outer, present)
    fade(c.inner, present * 0.8)

    // the guardian, and their consent through the check
    const guardianIn = present * at(CHILDREN.guardian)
    fadeMesh(c.guardianCore, guardianIn)
    fadeMesh(c.guardianRing, guardianIn)
    c.guardianRing.quaternion.copy(camera.quaternion)
    fade(c.thread, guardianIn)
    const travel = span(pos, CHILDREN.guardian - 0.3 * sp, CHILDREN.guardian + 0.05 * sp)
    c.bead.position.lerpVectors(GUARDIAN, ENTRY, travel)
    fadeMesh(c.bead, guardianIn * (travel > 0.01 && travel < 0.99 ? 1 : 0))
    const verified = span(travel, 0.45, 0.55)
    const checkMaterial = c.check.material as THREE.MeshBasicMaterial
    const prescribed = around(pos, CHILDREN.prescribed, sp)
    checkMaterial.color.copy(tones.idle).lerp(tones.pass, verified).lerp(tones.strong, prescribed * 0.6)
    c.check.scale.setScalar(lerp(1, 1.35, prescribed))
    c.check.quaternion.copy(camera.quaternion)
    fadeMesh(c.check, guardianIn)
    fade(c.entry, guardianIn * span(travel, 0.9, 1))

    // what stays out — even with the guardian's line connected
    const kept = present * at(CHILDREN.restricted)
    fade(c.reaches, kept * 0.9)
    fade(c.stops, kept)

    // the check follows the prescribed rule
    const ruleIn = present * span(pos, CHILDREN.prescribed - 0.45 * sp, CHILDREN.prescribed - 0.15 * sp)
    fade(c.ruleEdge, ruleIn)
    fade(c.ruleText, ruleIn)
    fade(c.ruleLink, ruleIn)
  })

  return <primitive object={c.root} />
}
