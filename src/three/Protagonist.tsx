import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spine } from './stageState'
import { CONSENT, ROLES } from './timeline'
import { along, fade, reveal, stroke, strokes } from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

const HEX_RADIUS = 0.36
const THREAD_SAMPLES = 720

interface Props {
  colors: StageColors
}

/**
 * The cast that never leaves the stage.
 *
 * - **You**: a point with a ring, at the top of the world. The ring always
 *   faces the viewer, so it reads as the same mark as on the plates.
 * - **Your data**: a bevelled hexagonal token — the data mark, made solid. It
 *   is created once and never replaced. Consent and withdrawal are states of
 *   this one object: its tone changes, it does not swap for another.
 * - **The thread**: the route the data has travelled, drawn from you to
 *   wherever it is now. It is what makes the data *personal* — it points back
 *   at you — and it goes everywhere the data goes.
 */
export function Protagonist({ colors }: Props) {
  const camera = useThree((s) => s.camera)

  const you = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const token = useRef<THREE.Group>(null)
  const body = useRef<THREE.MeshPhysicalMaterial>(null)

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    for (let i = 0; i < 6; i++) {
      // Flat-top, matching the hexagon on the plates and in the site mark.
      const a = (Math.PI / 3) * i
      const x = HEX_RADIUS * Math.cos(a)
      const y = HEX_RADIUS * Math.sin(a)
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.11,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 1,
    })
    g.center()
    return g
  }, [])

  // The withdrawn outline: the token's own silhouette edges, as strokes.
  const edges = useMemo(() => {
    const position = new THREE.EdgesGeometry(geometry, 40).getAttribute('position')
    const points: THREE.Vector3[] = []
    for (let i = 0; i < position.count; i++) {
      points.push(new THREE.Vector3().fromBufferAttribute(position, i))
    }
    return strokes(points, { width: 1.5 })
  }, [geometry])

  const thread = useMemo(() => {
    const line = stroke(along(spine, 0, 1, THREAD_SAMPLES), { width: 1.5 })
    line.frustumCulled = false
    // Over every state of the route: the thread is the data's own path.
    line.renderOrder = 2
    return line
  }, [])

  // Story tones, kept as Color objects so the frame loop can blend them.
  const tones = useMemo(
    () => ({
      data: new THREE.Color(),
      grant: new THREE.Color(),
      withdraw: new THREE.Color(),
      mixed: new THREE.Color(),
    }),
    [],
  )

  useEffect(() => {
    tones.data.set(colors.data)
    tones.grant.set(colors.grant)
    tones.withdraw.set(colors.withdraw)
    thread.material.color.set(colors.inkSoft)
    edges.material.color.set(colors.withdraw)
  }, [colors, tones, thread, edges])

  useStoryFrame(() => {
    const pos = stage.pos
    const intro = 1 - (1 - stage.intro) ** 3

    // Far shots would shrink the cast to specks; let them grow a little with
    // distance so they stay legible as the same objects.
    const distance = camera.position.distanceTo(stage.data)
    const legible = Math.max(1, distance / 14)

    // Named in chapter 02 as the Data Principal: a slight lift while it is.
    const named = around(pos, ROLES.principal, ROLES.spacing)
    if (you.current) you.current.scale.setScalar(legible * (1 + 0.25 * named))
    if (ring.current) ring.current.quaternion.copy(camera.quaternion)

    // State: consent attaches in chapter 06; withdrawal drains it in chapter 10.
    // Attaches the instant a real yes arrives down the thread (Checkpoint.tsx).
    const consent = span(pos, CONSENT.given - 0.1 * CONSENT.spacing, CONSENT.given + 0.02 * CONSENT.spacing)
    const drained = stage.withdrawal.drain

    tones.mixed.lerpColors(tones.data, tones.grant, consent * (1 - drained))
    if (drained > 0) tones.mixed.lerp(tones.withdraw, drained * 0.35)

    if (body.current) {
      body.current.color.copy(tones.mixed)
      // A share of the tone as emission keeps the face reading as the token's
      // colour under any light, as it does on the page.
      body.current.emissive.copy(tones.mixed)
      body.current.opacity = lerp(1, 0.14, drained)
      body.current.depthWrite = drained < 0.5
    }
    fade(edges, drained)

    if (token.current) {
      token.current.position.copy(stage.data)
      token.current.scale.setScalar(Math.max(0.001, intro) * legible)
      if (stage.idle) {
        // A slow sway, never a spin: the hexagon keeps its face to the viewer.
        // Only with a mouse: on a phone the stage rests when the reader does.
        token.current.rotation.y = Math.sin(stage.elapsed * 0.35) * 0.32
        token.current.rotation.x = Math.sin(stage.elapsed * 0.23) * 0.1
        token.current.position.y += Math.sin(stage.elapsed * 0.6) * 0.015
      }
    }

    fade(thread, intro)
    reveal(thread, stage.dataT * intro, THREAD_SAMPLES)
  })

  return (
    <>
      <group ref={you}>
        <mesh>
          <sphereGeometry args={[0.075, 32, 16]} />
          <meshStandardMaterial color={colors.ink} roughness={0.5} />
        </mesh>
        <mesh ref={ring}>
          <torusGeometry args={[0.19, 0.007, 8, 72]} />
          <meshBasicMaterial color={colors.inkMuted} />
        </mesh>
      </group>

      <primitive object={thread} />

      <group ref={token}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            ref={body}
            color={colors.data}
            roughness={0.34}
            metalness={0}
            clearcoat={0.9}
            clearcoatRoughness={0.25}
            emissiveIntensity={0.42}
            transparent
          />
        </mesh>
        {/* Drawn only once consent is withdrawn: the shape remains, drained. */}
        <primitive object={edges} />
      </group>
    </>
  )
}
