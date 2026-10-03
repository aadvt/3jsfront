import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useStoryFrame } from './useStoryFrame'
import { stage } from './stageState'
import { BEAT, CH, ROLES } from './timeline'
import { boxEdges, fade, fadeMesh, stroke, strokes } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

/**
 * Where the system sits. A portrait arrangement, by design: the fiduciary
 * below you and to the left of the data's route, the processor lower still
 * and to the right. The data walks down between them, so on a phone the whole
 * cast stays about as wide as it is tall.
 */
const SIDE = 0.62
export const FIDUCIARY = new THREE.Vector3(-0.8, -2.9, -0.15)
export const PROCESSOR = new THREE.Vector3(0.8, -4.3, -0.15)

/**
 * The system the data goes into, drawn with the same marks as the plates:
 *
 * - **The Data Fiduciary**: a solid ink block. It decides, and it holds the
 *   responsibility.
 * - **A Data Processor**: the same block hollow, with dashed edges. The same
 *   kind of thing, acting on the fiduciary's behalf.
 * - **Engagement**: the line from the fiduciary to the processor.
 * - **Responsibility** (chapter 02): a line from the fiduciary to the data,
 *   drawn when the fiduciary takes it in. When the data moves on to the
 *   processor, the line goes with it: responsibility does not move.
 * - Its duties (chapter 12) are drawn as a ring around it: `Duties.tsx`.
 */
export function System({ colors }: { colors: StageColors }) {
  const group = useRef<THREE.Group>(null)
  const fiduciary = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)

  const parts = useMemo(() => {
    const processorEdges = strokes(
      boxEdges(SIDE, SIDE, SIDE).map((p) => p.add(PROCESSOR)),
      { width: 1.25, dashed: true, dash: 0.06, gap: 0.05 },
    )
    const engaged = stroke(
      [
        FIDUCIARY.clone().add(new THREE.Vector3(SIDE / 2, -SIDE / 2, 0)),
        PROCESSOR.clone().add(new THREE.Vector3(-SIDE / 2, SIDE / 2, 0)),
      ],
      { width: 1.5 },
    )
    // Rewritten every frame to end at the data. One segment; its six floats
    // are updated in place, so following the data never allocates.
    const holds = stroke([FIDUCIARY.clone(), FIDUCIARY.clone()], { width: 2 })
    holds.frustumCulled = false
    holds.renderOrder = 1
    return { processorEdges, engaged, holds }
  }, [])

  useEffect(() => {
    parts.processorEdges.material.color.set(colors.ink)
    parts.engaged.material.color.set(colors.ink)
    parts.holds.material.color.set(colors.ink)
  }, [colors, parts])

  useStoryFrame(() => {
    const pos = stage.pos

    // Rises into view as the prologue names it, then stays for the whole story.
    const present = span(pos, BEAT.data + 0.12, BEAT.system - 0.02)
    if (group.current) {
      group.current.position.y = lerp(-0.8, 0, present)
      group.current.visible = present > 0.004
    }

    // Chapter 02: while one role is being introduced, the roles not yet
    // introduced step back.
    const principal = around(pos, ROLES.principal, ROLES.spacing)
    const fiduciaryMoment = around(pos, ROLES.fiduciary, ROLES.spacing)
    const fiduciaryLevel = present * (1 - 0.75 * principal)
    const processorLevel = present * (1 - 0.75 * Math.min(1, principal + fiduciaryMoment))

    if (fiduciary.current) fadeMesh(fiduciary.current, fiduciaryLevel)
    if (shell.current) fadeMesh(shell.current, processorLevel * 0.55)
    fade(parts.processorEdges, processorLevel)
    fade(parts.engaged, processorLevel * lerp(0.35, 1, span(pos, ROLES.processor - 0.1, ROLES.processor)))

    // The fiduciary takes the data in, and keeps hold of it as it moves on.
    const holding =
      span(pos, ROLES.fiduciary - 0.06, ROLES.fiduciary) * (1 - span(pos, CH.grounds + 0.05, CH.grounds + 0.25))
    fade(parts.holds, holding)
    if (holding > 0.004) {
      const start = parts.holds.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute
      const a = start.data.array as Float32Array
      a[0] = FIDUCIARY.x + SIDE / 2
      a[1] = FIDUCIARY.y + (group.current?.position.y ?? 0)
      a[2] = FIDUCIARY.z
      a[3] = stage.data.x
      a[4] = stage.data.y
      a[5] = stage.data.z
      start.data.needsUpdate = true
    }
  })

  return (
    <>
      <group ref={group}>
        <mesh ref={fiduciary} position={FIDUCIARY}>
          <boxGeometry args={[SIDE, SIDE, SIDE]} />
          <meshStandardMaterial color={colors.ink} roughness={0.7} transparent />
        </mesh>
        <mesh ref={shell} position={PROCESSOR}>
          <boxGeometry args={[SIDE, SIDE, SIDE]} />
          <meshBasicMaterial color={colors.paperRaised} transparent depthWrite={false} />
        </mesh>
        <primitive object={parts.processorEdges} />
        <primitive object={parts.engaged} />
      </group>
      {/* Outside the rising group: it is drawn in world space, to the data. */}
      <primitive object={parts.holds} />
    </>
  )
}
