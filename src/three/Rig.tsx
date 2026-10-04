import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, PerspectiveCamera, Vector3 } from 'three'
import { journey, useChoices } from '../state/journey'
import { damp, lerp } from '../utils/math'
import { overview, placements, toWorld } from './layout'
import { stage } from './presence'

const OVERVIEW_DIR = new Vector3(Math.sin(-0.55), 0.45, Math.cos(-0.55)).normalize()

interface Pose {
  pos: Vector3
  target: Vector3
  dist: number
}

const makePose = (): Pose => ({ pos: new Vector3(), target: new Vector3(), dist: 1 })

/**
 * The camera. Each station's view says what must be visible (a centre and a
 * radius); the rig fits that sphere into the stage window the page measured,
 * and shifts the projection so the sphere's centre lands in the window's
 * centre. The page decides where the words go; the camera frames the model in
 * the space that is left, at every size, so the two always line up.
 *
 * Between stations the camera orbits the helix axis (cylindrical blend), so
 * it swings round to the next station instead of cutting through models.
 */
export function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)
  const scratch = useRef({
    a: makePose(),
    b: makePose(),
    goal: makePose(),
    dir: new Vector3(),
    view: { x: -1, y: -1, w: -1, h: -1, W: -1, H: -1 },
    look: new Vector3(),
    first: true,
    px: 0,
    py: 0,
  })

  /** Distance at which a sphere of `radius` fills the stage window. */
  const fit = (radius: number) => {
    const { window: win, viewport } = journey
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360)
    const tanFit = tanHalf * (Math.min(win.height, win.width) / viewport.height)
    return (radius / Math.sin(Math.atan(tanFit))) * 1.04
  }

  const stationPose = (index: number, out: Pose) => {
    const p = placements[index]
    const selection = useChoices.getState().selection
    const key = p.viewFrom ? selection[p.viewFrom] ?? Object.keys(p.views)[0] : 'main'
    const view = p.views[key] ?? Object.values(p.views)[0]
    const s = scratch.current
    toWorld(p, view.center[0], view.center[1], view.center[2], out.target)
    // The view direction, rotated into the world like the station is.
    toWorld(p, view.dir[0], view.dir[1], view.dir[2], s.dir).sub(p.position).normalize()
    out.dist = fit(view.radius)
    out.pos.copy(out.target).addScaledVector(s.dir, out.dist)
  }

  const overviewPose = (out: Pose) => {
    out.target.copy(overview.target)
    out.dist = fit(overview.radius)
    out.pos.copy(out.target).addScaledVector(OVERVIEW_DIR, out.dist)
  }

  /** Blend two camera positions around the helix axis, not through it. */
  const orbit = (a: Vector3, b: Vector3, t: number, out: Vector3) => {
    const ta = Math.atan2(a.x, a.z)
    let tb = Math.atan2(b.x, b.z)
    while (tb - ta > Math.PI) tb -= Math.PI * 2
    while (tb - ta < -Math.PI) tb += Math.PI * 2
    const theta = lerp(ta, tb, t)
    const r = lerp(Math.hypot(a.x, a.z), Math.hypot(b.x, b.z), t)
    // A little lift mid-way, so the swing reads as travel.
    const y = lerp(a.y, b.y, t) + Math.sin(t * Math.PI) * 1.2
    return out.set(Math.sin(theta) * r, y, Math.cos(theta) * r)
  }

  useFrame((state, dt) => {
    const s = scratch.current
    stage.still = reducedMotion
    stage.elapsed = state.clock.elapsedTime

    // The story position, smoothed (or cut, under reduced motion).
    const goalPos = journey.position
    stage.pos = reducedMotion || s.first ? goalPos : damp(stage.pos, goalPos, 7, dt)
    if (Math.abs(stage.pos - goalPos) < 1e-4) stage.pos = goalPos

    // Shift the projection so the window's centre is the optical centre.
    const { window: win, viewport } = journey
    const v = s.view
    if (v.x !== win.x || v.y !== win.y || v.w !== win.width || v.h !== win.height || v.W !== viewport.width || v.H !== viewport.height) {
      Object.assign(v, { x: win.x, y: win.y, w: win.width, h: win.height, W: viewport.width, H: viewport.height })
      const cx = win.x + win.width / 2
      const cy = win.y + win.height / 2
      camera.setViewOffset(viewport.width, viewport.height, viewport.width / 2 - cx, viewport.height / 2 - cy, viewport.width, viewport.height)
      camera.updateProjectionMatrix()
    }

    // Two poses either side of the position, and the blend between them.
    const p = Math.max(-1, Math.min(placements.length - 1, stage.pos))
    const i = Math.floor(p)
    const t = p - i
    if (i < 0) overviewPose(s.a)
    else stationPose(i, s.a)
    if (t > 0 && i + 1 < placements.length) {
      stationPose(i + 1, s.b)
      orbit(s.a.pos, s.b.pos, t, s.goal.pos)
      s.goal.target.lerpVectors(s.a.target, s.b.target, t)
      s.goal.dist = lerp(s.a.dist, s.b.dist, t)
    } else {
      s.goal.pos.copy(s.a.pos)
      s.goal.target.copy(s.a.target)
      s.goal.dist = s.a.dist
    }

    // Camera follows the goal; a view change inside a station glides.
    const k = reducedMotion || s.first ? 1 : 1 - Math.exp(-9 * Math.min(dt, 0.1))
    camera.position.lerp(s.goal.pos, k)
    s.look.lerp(s.goal.target, k)
    s.first = false

    // A mouse adds a little depth by moving the eye, never the subject.
    s.px = damp(s.px, reducedMotion ? 0 : journey.pointerX, 3, dt)
    s.py = damp(s.py, reducedMotion ? 0 : journey.pointerY, 3, dt)
    camera.lookAt(s.look)
    camera.translateX(s.px * s.goal.dist * 0.03)
    camera.translateY(s.py * s.goal.dist * 0.02)
    camera.lookAt(s.look)

    // Fog starts just behind the subject, so other stations fade into paper.
    const fog = scene.fog as Fog | null
    if (fog) {
      fog.near = s.goal.dist + 2
      fog.far = s.goal.dist + (i < 0 ? lerp(70, 22, t) : 22)
    }

    // On demand: keep drawing until the camera has settled.
    if (camera.position.distanceToSquared(s.goal.pos) > 1e-6 || stage.pos !== goalPos) invalidate()
  }, -10)

  return null
}
