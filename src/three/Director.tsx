import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spine } from './stageState'
import { DATA_KEYS, SHOTS, WITHDRAWAL, nearestKey, spineT, type Shot } from './timeline'
import { choiceStore } from '../state/choiceStore'
import { clamp01, damp, lerp, locate, span } from '../utils/math'

/**
 * Where the stage's subject sits on screen, per layout. The page decides where
 * the words go; the director keeps the picture out from under them.
 *
 * - Phone: the stage has the screen to itself before each card rises, so the
 *   subject sits a little above centre, clear of the header.
 * - Tablet: the pinned card covers the lower part, so the subject rides high.
 * - Desktop: the text column is on the left, so the subject sits in the open
 *   space to its right, and only that space counts when fitting a shot.
 */
function framing(width: number) {
  if (width >= 1024) return { fx: 0.6, fy: 0.52, usable: 0.36 }
  if (width >= 768) return { fx: 0.5, fy: 0.3, usable: 1 }
  return { fx: 0.5, fy: 0.42, usable: 1 }
}

const DEFAULT_SIDE = 0.22
/**
 * On a phone, the share of the screen's height a shot can count on: during a
 * moment or a chapter card, the lower part of the screen is words and the top
 * is the header. Measured at 390 × 844, about half the screen stays open; on
 * shorter phones (375 × 667, 320 × 568) the same card takes more of it.
 */
const phoneOpen = (width: number, height: number) => (height / width < 1.9 ? 0.42 : 0.5)
/** Frame time above which the stage gives up some resolution, in seconds. */
const SLOW_FRAME = 1 / 40
/** Elsewhere only the header takes a strip of the screen. */
const WIDE_OPEN = 0.85
const DEFAULT_LIFT = 0.1
/** How long the data takes to leave you when the page first opens, in seconds. */
const INTRO_SECONDS = 1.6

interface Props {
  reducedMotion: boolean
}

/**
 * Runs first every frame: damps the story position, places the data on its
 * route, and moves the camera through the shot list. Renders nothing.
 */
export function Director({ reducedMotion }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  const setDpr = useThree((s) => s.setDpr)
  const viewportDpr = useThree((s) => s.viewport.dpr)
  const fit = useRef({ aspect: 1, phone: false, short: false, open: 1, fx: 0.5, fy: 0.5, drop: Number.NaN })
  // Frame-time sampling for stepping resolution down on a slow device.
  const pace = useRef({ sum: 0, count: 0, awake: false, lastDrop: 0, dpr: 0 })

  // Temporaries for the frame loop, so it never allocates.
  const scratch = useMemo(
    () => ({
      hit: { a: 0, b: 0, t: 0 },
      targetA: new THREE.Vector3(),
      targetB: new THREE.Vector3(),
      target: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      pointer: { x: 0, y: 0 },
      started: -1,
    }),
    [],
  )

  // Shift the projection so the scene's centre lands in the open part of the
  // screen, rather than moving the camera and changing the composition.
  useEffect(() => {
    const { fx, fy, usable } = framing(size.width)
    Object.assign(fit.current, {
      aspect: (size.width * usable) / size.height,
      phone: size.width < 768,
      short: size.width < 768 && size.height / size.width < 1.9,
      open: size.width < 768 ? phoneOpen(size.width, size.height) : WIDE_OPEN,
      fx,
      fy,
      drop: Number.NaN, // force the frame loop to apply the new offset
    })
  }, [size.width, size.height])

  const applyOffset = (drop: number) => {
    const f = fit.current
    if (Math.abs(drop - f.drop) < 0.0005) return
    f.drop = drop
    camera.setViewOffset(
      size.width,
      size.height,
      (0.5 - f.fx) * size.width,
      (0.5 - f.fy - drop) * size.height,
      size.width,
      size.height,
    )
    camera.updateProjectionMatrix()
  }

  // Pointer parallax is a depth cue for a mouse. On touch, "pointer" events
  // fire while scrolling, which would make the stage twitch with the thumb.
  const finePointer = useMemo(() => window.matchMedia('(pointer: fine)').matches, [])

  useStoryFrame((frame, dt, elapsed) => {
    stage.elapsed = elapsed
    stage.idle = finePointer && !reducedMotion

    // A slow device gives up resolution, a step at a time, never below 1. Only
    // frames drawn back to back count — a frame after a rest says nothing.
    const pc = pace.current
    if (pc.dpr === 0) pc.dpr = viewportDpr
    if (pc.awake && dt < 0.25) {
      pc.sum += dt
      pc.count += 1
      if (pc.count >= 30) {
        if (pc.sum / pc.count > SLOW_FRAME && pc.dpr > 1 && elapsed - pc.lastDrop > 2) {
          pc.dpr = Math.max(1, pc.dpr - 0.25)
          setDpr(pc.dpr)
          pc.lastDrop = elapsed
        }
        pc.sum = 0
        pc.count = 0
      }
    }

    // The intro is the one time-based motion: the data leaves you once, when
    // the page opens. Under reduced motion it has simply already happened.
    if (scratch.started < 0) scratch.started = elapsed
    stage.intro = reducedMotion ? 1 : clamp01((elapsed - scratch.started - 0.25) / INTRO_SECONDS)

    // Under reduced motion the stage cuts between complete states instead of
    // travelling between them.
    const goal = reducedMotion ? nearestKey(frame.storyPosition) : frame.storyPosition
    stage.pos = reducedMotion ? goal : damp(stage.pos, goal, 4.5, dt)
    const pos = stage.pos

    // The data: its spine index from the key table, then its point on the curve.
    const hit = locate(DATA_KEYS, pos, scratch.hit)
    const index = lerp(DATA_KEYS[hit.a].v, DATA_KEYS[hit.b].v, hit.t)
    stage.dataT = spineT(index)
    spine.getPoint(stage.dataT, stage.data)
    // While it is still leaving you, it travels down the thread from the origin.
    const intro = 1 - (1 - stage.intro) ** 3
    stage.data.multiplyScalar(intro)

    // Withdrawal (chapter 10): each consequence, in order. By scroll, it plays
    // out from the moment after the control; by the control, it plays out in
    // a few seconds from the press. Whichever is further on wins — but only
    // once the story has reached the chapter, so scrolling back up shows the
    // consent as it was.
    const w = stage.withdrawal
    const sp = WITHDRAWAL.spacing
    const reached = pos > WITHDRAWAL.opener - 0.3 * sp ? 1 : 0
    const at = (m: number, a: number, b: number) => span(pos, m + a * sp, m + b * sp)
    const pressedAt = choiceStore.withdrawnAt
    const t = pressedAt === null ? -1 : reducedMotion ? 99 : (performance.now() - pressedAt) / 1000
    const after = (from: number, length: number) => clamp01((t - from) / length)
    w.bead = reached * Math.max(at(WITHDRAWAL.change, 0.2, 0.6), after(0, 1))
    w.drain = reached * Math.max(at(WITHDRAWAL.change, 0.5, 0.8), after(0.9, 0.7))
    w.stop = reached * Math.max(at(WITHDRAWAL.stop, -0.4, -0.12), after(1.6, 0.8))
    w.record = reached * Math.max(at(WITHDRAWAL.record, -0.4, -0.12), after(2.4, 0.8))
    w.systems = reached * Math.max(at(WITHDRAWAL.systems, -0.5, 0), after(3.2, 1.6))

    // The camera.
    locate(SHOTS, pos, hit)
    const a = SHOTS[hit.a]
    const b = SHOTS[hit.b]
    shotTarget(a, scratch.targetA)
    shotTarget(b, scratch.targetB)
    scratch.target.lerpVectors(scratch.targetA, scratch.targetB, hit.t)

    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const open = fit.current.open
    const reach = (shot: Shot) =>
      Math.max(
        shot.dist,
        shot.halfWidth / (tanHalf * fit.current.aspect),
        (shot.halfHeight ?? 0) / (tanHalf * open),
      )
    const dist = lerp(reach(a), reach(b), hit.t)
    const side = lerp(a.side ?? DEFAULT_SIDE, b.side ?? DEFAULT_SIDE, hit.t)
    const lift = lerp(a.lift ?? DEFAULT_LIFT, b.lift ?? DEFAULT_LIFT, hit.t)
    // On a short phone a step's card takes more of the screen, so a subject
    // framed above a card (a negative drop) rides a little higher still.
    const drop = (shot: Shot) => {
      const phone = shot.phoneDrop ?? 0
      if (!fit.current.short) return phone
      return shot.shortDrop ?? (phone < 0 ? phone - 0.05 : phone)
    }
    applyOffset(fit.current.phone ? lerp(drop(a), drop(b), hit.t) : 0)

    const px = finePointer && !reducedMotion ? frame.pointerX : 0
    const py = finePointer && !reducedMotion ? frame.pointerY : 0
    scratch.pointer.x = damp(scratch.pointer.x, px, 2.5, dt)
    scratch.pointer.y = damp(scratch.pointer.y, py, 2.5, dt)

    scratch.dir.set(side + scratch.pointer.x * 0.06, lift + scratch.pointer.y * 0.04, 1).normalize()
    camera.position.copy(scratch.target).addScaledVector(scratch.dir, dist)
    camera.lookAt(scratch.target)

    // Render on demand: ask for another frame only while something is still
    // moving. Otherwise the stage sleeps until the story position changes.
    const settling =
      Math.abs(stage.pos - goal) > 1e-4 ||
      stage.intro < 1 ||
      (pressedAt !== null && t < 6) ||
      Math.abs(scratch.pointer.x - px) > 1e-3 ||
      Math.abs(scratch.pointer.y - py) > 1e-3 ||
      stage.idle
    pc.awake = settling
    if (settling) invalidate()
  })

  return null
}

function shotTarget(shot: Shot, out: THREE.Vector3) {
  if (shot.target) return out.set(...shot.target)
  out.copy(stage.data)
  if (shot.nudge) {
    out.x += shot.nudge[0]
    out.y += shot.nudge[1]
    out.z += shot.nudge[2]
  }
  return out
}
