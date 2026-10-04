import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { Color, TubeGeometry, Vector3, type Group, type Mesh, type MeshPhysicalMaterial } from 'three'
import { dataState, useChoices } from '../state/journey'
import { damp } from '../utils/math'
import { useColors } from './kit'
import { thread, threadT } from './layout'
import { stage } from './presence'

const SEGMENTS = 720
const RADIAL = 6

/**
 * The thread: what makes the data personal is that it points back at you, and
 * it goes wherever the data goes. The whole route is drawn faintly; the part
 * already travelled is drawn in the data's tone.
 */
export function Thread() {
  const c = useColors()
  const geometry = useMemo(() => new TubeGeometry(thread, SEGMENTS, 0.014, RADIAL, false), [])
  const travelled = useRef<Mesh>(null)

  useFrame(() => {
    const mesh = travelled.current
    if (!mesh) return
    const count = Math.floor(threadT(stage.pos) * SEGMENTS) * RADIAL * 6
    mesh.geometry.setDrawRange(0, count)
  })

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={c.hairline} transparent opacity={0.55} />
      </mesh>
      <mesh ref={travelled} geometry={geometry} scale={1.0}>
        <meshBasicMaterial color={c.data} />
      </mesh>
    </group>
  )
}

/**
 * Your data: one hexagonal token, the only thing you follow. It rests at the
 * data's place in each station and travels the thread between them. Its
 * material is its state: blue untouched, green once a real consent is attached,
 * hollow once that consent is withdrawn (it keeps its shape: withdrawal is not
 * erasure).
 */
export function DataToken() {
  const c = useColors()
  const group = useRef<Group>(null)
  const solid = useRef<MeshPhysicalMaterial>(null)
  const shell = useRef<Mesh>(null)
  const scratch = useMemo(() => ({ p: new Vector3(), color: new Color(), raw: new Color(), grant: new Color(), withdraw: new Color(), fill: 1 }), [])

  useFrame((state, dt) => {
    const g = group.current
    const m = solid.current
    if (!g || !m) return
    thread.getPoint(threadT(stage.pos), scratch.p)
    g.position.copy(scratch.p)
    if (!stage.still) g.rotation.y += dt * 0.5

    const tone = dataState(useChoices.getState(), stage.pos)
    scratch.raw.set(c.data)
    scratch.grant.set(c.grant)
    scratch.withdraw.set(c.withdraw)
    const target = tone === 'consented' ? scratch.grant : tone === 'withdrawn' ? scratch.withdraw : scratch.raw
    scratch.color.copy(m.color).lerp(target, stage.still ? 1 : 1 - Math.exp(-6 * dt))
    m.color.copy(scratch.color)
    m.emissive.copy(scratch.color)
    // Withdrawn: the solid drains away and the shell remains.
    scratch.fill = stage.still ? (tone === 'withdrawn' ? 0 : 1) : damp(scratch.fill, tone === 'withdrawn' ? 0 : 1, 4, dt)
    m.opacity = scratch.fill
    m.emissiveIntensity = 0.25 + 0.35 * scratch.fill + 0.15 * Math.sin(state.clock.elapsedTime * 2.2)
    if (shell.current) (shell.current.material as MeshPhysicalMaterial).color.copy(scratch.color)
  })

  return (
    <group ref={group}>
      <Float speed={stage.still ? 0 : 2} rotationIntensity={0.15} floatIntensity={0.25} floatingRange={[-0.05, 0.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.13, 6]} />
          <meshPhysicalMaterial ref={solid} color={c.data} emissive={c.data} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} transparent />
        </mesh>
        <mesh ref={shell} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.16, 6, 1, true]} />
          <meshPhysicalMaterial color={c.data} wireframe />
        </mesh>
      </Float>
    </group>
  )
}
