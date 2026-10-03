import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spinePoint } from './stageState'
import { AT, SYSTEM } from './timeline'
import { fade, reveal, stroke } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { lerp, span } from '../utils/math'

/**
 * Chapter 15: the whole path, in one view.
 *
 * Synthesis, not new information. Nearly everything on stage here already
 * exists; this component adds only two things:
 *
 *   - the lifecycle, traced: one line in the data's tone that runs through the
 *     places the story showed each of the source's seven steps, lighting a
 *     ring at each — notice, request, choice, recorded, applied, change or
 *     withdraw — and then goes back up to the record for "updated", so the
 *     line closes into a loop. A lifecycle, drawn as one;
 *   - you, at the top: a slow ring that spreads from you when the camera
 *     climbs the thread back to where it all started.
 *
 * The rest — the duties ring, the children's room, the two worlds of chapter
 * 14, the dashed boundary of duties — is brought back by the components that
 * own it, keyed off `CH.system`.
 */

/** Where each lifecycle step happened on the stage, in order. */
function anchors() {
  const at = (index: number, dx = 0, dy = 0) => spinePoint(index, [dx, dy, 0.05])
  return [
    at(AT.notice, 0.82, 1.7), // 01 notice — the notice sheet
    at(AT.consent, 0, 1.05), // 02 consent request — the checkpoints
    at(AT.split, 0, -1.5), // 03 your choice — the purpose streams
    new THREE.Vector3(-1.3, -16.25, 0.2), // 04 recorded — the record slip
    new THREE.Vector3(0.72, -18.4, 0.05), // 05 applied — the stations
    at(AT.withdrawal, 0, 0), // 06 change or withdraw — where it arrived
    new THREE.Vector3(-1.23, -16.32, 0.25), // 07 updated — back up to the record
  ]
}

export function Assembly({ colors }: { colors: StageColors }) {
  const camera = useThree((s) => s.camera)

  const a = useMemo(() => {
    const root = new THREE.Group()
    const points = anchors()
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3)
    const SAMPLES = 400
    const trail = stroke(curve.getPoints(SAMPLES), { width: 2.5 })
    trail.renderOrder = 3
    trail.frustumCulled = false
    root.add(trail)
    const ringMaterials: THREE.MeshBasicMaterial[] = []
    const rings = points.map((p) => {
      const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      ringMaterials.push(material)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 10, 64), material)
      ring.position.copy(p)
      ring.visible = false
      root.add(ring)
      return ring
    })
    // You, where it started.
    const haloMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.008, 8, 96), haloMaterial)
    halo.visible = false
    root.add(halo)
    return { root, trail, SAMPLES, rings, ringMaterials, halo, haloMaterial }
  }, [])

  useEffect(() => {
    a.trail.material.color.set(colors.data)
    for (const m of a.ringMaterials) m.color.set(colors.data)
    a.haloMaterial.color.set(colors.ink)
  }, [colors, a])

  useStoryFrame(() => {
    const pos = stage.pos
    const sp = SYSTEM.spacing
    const at = (m: number) => span(pos, m - 0.45 * sp, m - 0.15 * sp)

    // The lifecycle is traced during its moment, and stays.
    const traced = span(pos, SYSTEM.lifecycle - 0.5 * sp, SYSTEM.lifecycle + 0.05 * sp)
    const present = traced > 0 ? 1 : 0
    a.root.visible = present > 0
    if (!a.root.visible) return

    // Bright while it is the subject, softer once the view moves on.
    const level = lerp(1, 0.6, at(SYSTEM.beyond)) * lerp(1, 0.75, at(SYSTEM.closing))
    fade(a.trail, level)
    reveal(a.trail, traced, a.SAMPLES)
    a.rings.forEach((ring, i) => {
      const lit = span(traced, i / 7, i / 7 + 0.1)
      a.ringMaterials[i].opacity = lit * level * 0.8
      ring.visible = lit > 0.004
      ring.quaternion.copy(camera.quaternion)
      // Each ring sized for the distance it is seen from.
      ring.scale.setScalar(Math.min(2, Math.max(1, camera.position.distanceTo(ring.position) / 18)))
    })

    // A slow ring from you, when the view climbs back to the start.
    const home = span(pos, SYSTEM.person - 0.4 * sp, SYSTEM.person + 0.35 * sp)
    a.halo.visible = home > 0.004 && home < 0.996
    a.halo.position.set(0, 0, 0.02)
    a.halo.scale.setScalar(lerp(1, 4, home))
    a.halo.quaternion.copy(camera.quaternion)
    a.haloMaterial.opacity = Math.sin(home * Math.PI) * 0.6
  })

  return <primitive object={a.root} />
}
