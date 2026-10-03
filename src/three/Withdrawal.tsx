import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useStoryFrame } from './useStoryFrame'
import { stage, spinePoint } from './stageState'
import { AT } from './timeline'
import { fade, fadeMesh, rectangle, stroke, strokes } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { lerp } from '../utils/math'

/**
 * Chapter 10: you can change your mind.
 *
 * The parts of withdrawal that are new objects on the stage. (The rest are
 * state changes on objects that already exist — the data drains, the streams
 * and stations go dark — and live with those objects.) All of them read
 * `stage.withdrawal`, which `Director` computes from the scroll position or,
 * if the visitor pressed the control, from the time since they did.
 *
 *   - the withdrawal itself: a bead in the withdrawal tone, coming down the
 *     same thread the yes came down. No checkpoints this time.
 *   - the analytics stream stopped: a bar across it, above its vendor.
 *   - the record updated: a new slip filed on top of the old one, which stays.
 */
const BEAD_FROM = 2.2
/** The filed record mark (Journey) — the update is filed on top of it. */
const RECORD_AT = new THREE.Vector3(-1.3, -16.25, 0.15)

export function Withdrawal({ colors }: { colors: StageColors }) {
  const w = useMemo(() => {
    const root = new THREE.Group()
    const at = spinePoint(AT.withdrawal)

    const beadMaterial = new THREE.MeshStandardMaterial({ roughness: 0.4, transparent: true, opacity: 0 })
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 16), beadMaterial)
    bead.visible = false
    root.add(bead)

    const streamStop = strokes([new THREE.Vector3(-0.83, -17.15, 0.02), new THREE.Vector3(-0.47, -17.15, 0.02)], {
      width: 3.5,
    })
    streamStop.renderOrder = 2
    root.add(streamStop)

    const update = new THREE.Group()
    root.add(update)
    const paperMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.4), paperMaterial)
    paper.visible = false
    update.add(paper)
    const edge = stroke(rectangle(0, 0, 0.32, 0.4, 0.003), { width: 1.5 })
    const rules = strokes(
      [
        new THREE.Vector3(-0.09, 0.08, 0.003), new THREE.Vector3(0.09, 0.08, 0.003),
        new THREE.Vector3(-0.09, 0, 0.003), new THREE.Vector3(0.09, 0, 0.003),
      ],
      { width: 1 },
    )
    // The purpose the update changes, now declined: dashed, with a stop.
    const changed = stroke([new THREE.Vector3(-0.09, -0.08, 0.003), new THREE.Vector3(0.09, -0.08, 0.003)], {
      width: 1.75,
      dashed: true,
      dash: 0.02,
      gap: 0.018,
    })
    update.add(edge, rules, changed)

    return { root, at, bead, beadMaterial, streamStop, update, paper, paperMaterial, edge, rules, changed }
  }, [])

  useEffect(() => {
    w.beadMaterial.color.set(colors.withdraw)
    w.streamStop.material.color.set(colors.withdraw)
    w.paperMaterial.color.set(colors.paperRaised)
    w.edge.material.color.set(colors.withdraw)
    w.rules.material.color.set(colors.inkMuted)
    w.changed.material.color.set(colors.withdraw)
  }, [colors, w])

  useStoryFrame(() => {
    const { bead, stop, record } = stage.withdrawal

    // The withdrawal comes down the thread, and is gone when it arrives.
    const travelling = bead > 0.001 && bead < 0.999
    w.bead.visible = travelling
    if (travelling) {
      w.bead.position.set(w.at.x, w.at.y + lerp(BEAD_FROM, 0.2, bead), w.at.z)
      w.beadMaterial.opacity = Math.min(1, bead * 8, (1 - bead) * 8)
    }

    fade(w.streamStop, stop)

    // The update drops onto the record; the old slip underneath stays.
    w.update.position.set(RECORD_AT.x + 0.07, RECORD_AT.y - 0.07 + lerp(0.5, 0, record), RECORD_AT.z + 0.03)
    fadeMesh(w.paper, record)
    fade(w.edge, record)
    fade(w.rules, record)
    fade(w.changed, record)
  })

  return <primitive object={w.root} />
}
