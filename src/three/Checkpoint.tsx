import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spinePoint } from './stageState'
import { AT, CH, CONSENT } from './timeline'
import { boxEdges, fade, stroke, strokes } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, clamp01, lerp, span } from '../utils/math'

/**
 * Chapter 06: what makes a consent real.
 *
 * Consent has to come from you, so it comes down the thread — the line from
 * you to your data. Three checkpoints sit on the thread just above the data,
 * one per pair of the Act's words, top to bottom:
 *
 *   1. unambiguous, by a clear affirmative action
 *   2. specific and informed
 *   3. free and unconditional
 *
 * Would-be consents come down one at a time, each a bead. Each failure gets
 * one checkpoint further than the last, and is stopped there:
 *
 *   - silence, inactivity, a pre-ticked box: an EMPTY bead — nothing you did;
 *   - without a notice you could understand: a FOGGED bead;
 *   - bundled with something unrelated: a bead DRAGGING a box.
 *
 * Then a real yes — solid, in the consent tone — lights every checkpoint as it
 * passes, enters the data, and the data changes in place. The data never moves
 * here: consent is a property of the data, not a gate it walks through.
 *
 * Everything is driven by the story position; the text of each moment names
 * what the stage is showing at that instant.
 */

/** Heights above the data: first checkpoint at the top. */
const RINGS = [1.45, 1.05, 0.65]
const SPAWN = 2.2
const RING_RADIUS = 0.32
/** Tilted toward the viewer, so a ring reads as a ring on any screen. */
const RING_TILT = 1.05

type Attempt = 'silence' | 'uninformed' | 'bundled'
const ATTEMPTS: { id: Attempt; ring: number }[] = [
  { id: 'silence', ring: 0 },
  { id: 'uninformed', ring: 1 },
  { id: 'bundled', ring: 2 },
]

export function Checkpoint({ colors }: { colors: StageColors }) {
  const camera = useThree((s) => s.camera)

  const c = useMemo(() => {
    const root = new THREE.Group()
    root.position.copy(spinePoint(AT.consent))

    const ringMaterials = RINGS.map(
      () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    )
    const rings = RINGS.map((y, i) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, 0.022, 10, 64), ringMaterials[i])
      mesh.position.y = y
      mesh.rotation.x = RING_TILT
      mesh.visible = false
      root.add(mesh)
      return mesh
    })

    // One stop bar per checkpoint, across the thread just above it.
    const stops = RINGS.map((y) => {
      const bar = strokes([new THREE.Vector3(-0.22, y + 0.13, 0.02), new THREE.Vector3(0.22, y + 0.13, 0.02)], {
        width: 3.5,
      })
      root.add(bar)
      return bar
    })

    // The bead: one would-be consent at a time. Filled, or empty with a
    // dashed outline that always faces the viewer.
    const bead = new THREE.Group()
    root.add(bead)
    const fillMaterial = new THREE.MeshStandardMaterial({ roughness: 0.4, transparent: true, opacity: 0 })
    const fill = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 16), fillMaterial)
    bead.add(fill)
    const outlinePoints: THREE.Vector3[] = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2
      outlinePoints.push(new THREE.Vector3(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0))
    }
    const outline = stroke(outlinePoints, { width: 2.5, dashed: true, dash: 0.035, gap: 0.03 })
    bead.add(outline)

    // What a bundled consent drags behind it: something unrelated, chained on.
    const baggage = new THREE.Group()
    root.add(baggage)
    const chain = stroke([new THREE.Vector3(0.13, 0, 0), new THREE.Vector3(0.42, 0.14, 0)], {
      width: 1.5,
      dashed: true,
      dash: 0.03,
      gap: 0.03,
    })
    const box = strokes(
      boxEdges(0.22, 0.22, 0.22).map((p) => p.add(new THREE.Vector3(0.55, 0.18, 0))),
      { width: 1.5, dashed: true, dash: 0.04, gap: 0.035 },
    )
    baggage.add(chain, box)

    // The instant consent attaches: one ring spreading from the data.
    const pulseMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    const pulse = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 8, 72), pulseMaterial)
    pulse.visible = false
    root.add(pulse)

    return { root, rings, ringMaterials, stops, bead, fill, fillMaterial, outline, baggage, chain, box, pulse, pulseMaterial }
  }, [])

  const tones = useMemo(
    () => ({
      idle: new THREE.Color(),
      pass: new THREE.Color(),
      fail: new THREE.Color(),
      fog: new THREE.Color(),
      soft: new THREE.Color(),
    }),
    [],
  )

  useEffect(() => {
    tones.idle.set(colors.inkMuted)
    tones.pass.set(colors.grant)
    tones.fail.set(colors.withdraw)
    tones.fog.set(colors.hairline)
    tones.soft.set(colors.inkSoft)
    for (const bar of c.stops) bar.material.color.set(colors.withdraw)
    c.outline.material.color.set(colors.inkSoft)
    c.chain.material.color.set(colors.inkMuted)
    c.box.material.color.set(colors.ink)
    c.pulseMaterial.color.set(colors.grant)
  }, [colors, c, tones])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = CONSENT.spacing

    // The checkpoints appear once the data has settled beneath them (it must
    // never pass through them), and leave once the route splits.
    const present =
      span(pos, CONSENT.term - 0.45 * sp, CONSENT.term - 0.15 * sp) *
      (1 - span(pos, CH.split + 0.1, CH.split + 0.35))
    c.root.visible = present > 0.004
    if (!c.root.visible) return

    // ── the real yes: travels the whole way, lighting each checkpoint it passes
    const givenTravel = span(pos, CONSENT.given - 0.48 * sp, CONSENT.given - 0.06 * sp)
    const givenY = lerp(SPAWN, 0, givenTravel)

    // ── which attempt, if any, is on the thread now
    let attempt: Attempt | null = null
    let travel = 0
    let shown = 0
    for (const a of ATTEMPTS) {
      const at = CONSENT[a.id]
      const level = around(pos, at, sp)
      if (level > shown) {
        shown = level
        attempt = a.id
        travel = span(pos, at - 0.48 * sp, at - 0.1 * sp)
      }
    }
    const givenShown =
      span(pos, CONSENT.given - 0.5 * sp, CONSENT.given - 0.42 * sp) *
      (1 - span(pos, CONSENT.given - 0.1 * sp, CONSENT.given - 0.04 * sp))
    const real = givenShown > shown

    // ── checkpoints: idle, flashing on the failure they stop, green once passed
    c.rings.forEach((ring, i) => {
      const material = c.ringMaterials[i]
      // Green from the instant the real yes crosses it, and from then on.
      const passed = clamp01((RINGS[i] + 0.05 - givenY) / 0.1)
      const failing = ATTEMPTS.find((a) => a.ring === i)
      const hit = failing
        ? around(pos, CONSENT[failing.id], sp) * span(pos, CONSENT[failing.id] - 0.14 * sp, CONSENT[failing.id] - 0.08 * sp)
        : 0
      material.color.copy(tones.idle).lerp(tones.fail, hit).lerp(tones.pass, passed)
      material.opacity = present * lerp(0.75, 1, Math.max(hit, passed))
      ring.visible = material.opacity > 0.004
      fade(c.stops[i], hit)
    })

    // ── the bead
    if (real) {
      // The real yes.
      c.bead.position.set(0, givenY, 0)
      c.fillMaterial.color.copy(tones.pass)
      c.fillMaterial.opacity = givenShown
      c.fill.visible = givenShown > 0.004
      fade(c.outline, 0)
      c.baggage.visible = false
    } else if (attempt) {
      const stopY = RINGS[ATTEMPTS.find((a) => a.id === attempt)!.ring] + 0.24
      c.bead.position.set(0, lerp(SPAWN, stopY, travel), 0)
      const fill = attempt === 'silence' ? 0 : shown
      c.fillMaterial.color.copy(attempt === 'uninformed' ? tones.fog : tones.soft)
      c.fillMaterial.opacity = fill * (attempt === 'uninformed' ? 0.85 : 1)
      c.fill.visible = fill > 0.004
      fade(c.outline, attempt === 'silence' ? shown : 0)
      c.baggage.visible = attempt === 'bundled'
      if (c.baggage.visible) {
        c.baggage.position.copy(c.bead.position)
        fade(c.chain, shown)
        fade(c.box, shown)
      }
    } else {
      c.fill.visible = false
      fade(c.outline, 0)
      c.baggage.visible = false
    }
    c.outline.quaternion.copy(camera.quaternion)

    // ── the moment it attaches
    const burst = span(pos, CONSENT.given - 0.06 * sp, CONSENT.given + 0.35 * sp)
    c.pulse.visible = burst > 0.004 && burst < 0.996
    c.pulse.scale.setScalar(lerp(1, 2.6, burst))
    c.pulse.quaternion.copy(camera.quaternion)
    c.pulseMaterial.opacity = (1 - burst) * 0.9
  })

  return <primitive object={c.root} />
}
