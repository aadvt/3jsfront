import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStoryFrame } from './useStoryFrame'
import { stage, spine, spinePoint } from './stageState'
import { AT, BEAT, CH, CONSENT, GROUNDS, MANAGER, NOTICE, PURPOSE, RECORD, RIGHTS, SPLIT, SYSTEM, spineT } from './timeline'
import { FIDUCIARY, PROCESSOR } from './System'
import {
  along,
  boxEdges,
  bracketEdges,
  fade,
  fadeMesh,
  rectangle,
  stroke,
  strokes,
  type Stroke,
} from './stroke'
import type { StageColors } from '../hooks/useStageColors'
import { around, lerp, span } from '../utils/math'

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)

/** The purpose frame's size. It travels with the data once drawn. */
// Flat, like the purpose mark on the plates: brackets in the picture plane
// read as a boundary; brackets with depth read as stray glyphs.
const FRAME = { w: 2.2, h: 1.8, arm: 0.26 }

/** Stations reached in chapter 09: alternate sides, alternate answers. */
const STATIONS = [
  { y: -18.4, side: 1, pass: true },
  { y: -18.9, side: -1, pass: false },
  { y: -19.4, side: 1, pass: true },
  { y: -19.9, side: -1, pass: false },
]
const STATION_X = 0.72

type Tone = keyof StageColors

/**
 * Everything the data meets on its way down, built once and driven by the
 * story position. Each piece is named for the chapter whose `visual` field
 * specifies it, and draws only what that field lists.
 */
function build() {
  const root = new THREE.Group()
  /** Every stroke and material with the token it is painted in. */
  const paint: { material: { color: THREE.Color }; tone: Tone }[] = []

  const addStroke = <T extends Stroke>(line: T, tone: Tone, parent: THREE.Object3D = root) => {
    paint.push({ material: line.material, tone })
    parent.add(line)
    return line
  }
  const addMesh = (
    geometry: THREE.BufferGeometry,
    tone: Tone,
    parent: THREE.Object3D = root,
    lit = false,
  ) => {
    const material = lit
      ? new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, opacity: 0 })
      : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false
    paint.push({ material, tone })
    parent.add(mesh)
    return mesh
  }

  // ── The route ahead: where the data has not been yet. Faint and dashed.
  const ahead = addStroke(
    stroke(along(spine, spineT(AT.rest), 1, 420), { width: 1.25, dashed: true, dash: 0.07, gap: 0.08 }),
    'hairline',
  )
  // Drawn first, so every state of the route paints over it.
  ahead.renderOrder = -1

  // ── 03 Grounds: why do you need my data? Three ways down from where the
  // data stops. Straight down — because it is held — is barred. Around the
  // left is consent; around the right, a legitimate use the Act lists, which a
  // relabelled purpose tries and fails to join.
  const forkTop = spinePoint(AT.fork)
  const forkBottom = spinePoint(AT.rejoin)
  const barY = forkTop.y - 0.5
  const straight = addStroke(
    stroke([forkTop, forkBottom], { width: 1.25, dashed: true, dash: 0.06, gap: 0.07 }),
    'hairline',
  )
  const bar = addStroke(strokes([v(-0.3, barY), v(0.3, barY)], { width: 3 }), 'withdraw')
  const consentWay = addStroke(
    stroke(along(spine, spineT(AT.fork), spineT(AT.rejoin), 60), { width: 2.75 }),
    'grant',
  )
  const legitimateCurve = new THREE.CatmullRomCurve3([forkTop, v(0.7, -6.6), forkBottom], false, 'catmullrom', 0.5)
  const legitimateFaint = addStroke(
    stroke(legitimateCurve.getPoints(60), { width: 1.5, dashed: true, dash: 0.07, gap: 0.08 }),
    'inkMuted',
  )
  const legitimateLit = addStroke(stroke(legitimateCurve.getPoints(60), { width: 2.75 }), 'ink')
  const join = legitimateCurve.getPoint(0.42)
  const shortcut = addStroke(
    stroke([v(join.x + 0.95, join.y + 0.25), v(join.x + 0.2, join.y + 0.05)], {
      width: 1.5,
      dashed: true,
      dash: 0.05,
      gap: 0.05,
    }),
    'inkMuted',
  )
  const shortcutStop = addStroke(
    strokes([v(join.x + 0.2, join.y - 0.1), v(join.x + 0.2, join.y + 0.2)], { width: 2.75 }),
    'withdraw',
  )

  // ── 04 Purpose: a bracketed frame that, once drawn, travels with the data.
  const frame = new THREE.Group()
  root.add(frame)
  const brackets = addStroke(
    strokes(bracketEdges(FRAME.w, FRAME.h, 0, FRAME.arm), { width: 2 }),
    'purpose',
    frame,
  )
  const edge = FRAME.w / 2
  const reach = addStroke(stroke([v(0.42, 0), v(edge, 0)], { width: 1.75 }), 'inkSoft', frame)
  const refusal = addStroke(strokes([v(edge, -0.16), v(edge, 0.16)], { width: 2.75 }), 'withdraw', frame)
  const beyond = addStroke(
    stroke([v(edge + 0.08, 0), v(edge + 0.7, 0)], { width: 1.25, dashed: true, dash: 0.05, gap: 0.06 }),
    'hairline',
    frame,
  )

  // ── 05 Notice: above the data, unfolding downward. First a dense wall of
  // lines; then a few separate items; the first two reach down to what they
  // describe — the data, and the purpose around it.
  const noticeAt = spinePoint(AT.notice)
  const sheetW = 1.05
  const sheetH = 1.3
  const notice = new THREE.Group() // its origin is the sheet's top-left corner
  notice.position.set(noticeAt.x + 0.3, noticeAt.y + 2.35, -0.05)
  root.add(notice)
  const sheet = new THREE.Group() // unfolds downward from its top edge
  notice.add(sheet)
  const surface = addMesh(new THREE.PlaneGeometry(sheetW, sheetH), 'paperRaised', sheet)
  surface.position.set(sheetW / 2, -sheetH / 2, 0)
  // Transparent objects are sorted by distance, and the lower items sit
  // farther from the camera than the sheet's centre. Draw the paper first so
  // nothing written on it can end up underneath it.
  surface.renderOrder = -1
  const border = addStroke(stroke(rectangle(sheetW / 2, -sheetH / 2, sheetW, sheetH, 0.001), { width: 1 }), 'hairline', sheet)
  const wallOfText = Array.from({ length: 15 }, (_, i) => {
    const line = addMesh(new THREE.PlaneGeometry(0.85 - (i % 4 === 3 ? 0.25 : 0), 0.018), 'inkMuted', sheet)
    line.geometry.translate((0.85 - (i % 4 === 3 ? 0.25 : 0)) / 2, 0, 0)
    line.position.set(0.1, -0.12 - i * 0.075, 0.002)
    return line
  })
  const rows = Array.from({ length: 6 }, (_, i) => {
    const y = -0.2 - i * 0.18
    const tick = addMesh(new THREE.PlaneGeometry(0.06, 0.05), 'inkMuted', sheet)
    tick.position.set(0.14, y, 0.003)
    const width = 0.62 - (i % 3) * 0.12
    const bar = addMesh(new THREE.PlaneGeometry(width, 0.05), 'ink', sheet)
    bar.geometry.translate(width / 2, 0, 0)
    bar.position.set(0.24, y, 0.003)
    return { tick, bar }
  })
  // "What": from the first item down to the data.
  const toData = addStroke(
    stroke([v(notice.position.x, notice.position.y - 0.2), v(noticeAt.x + 0.22, noticeAt.y + 0.3)], {
      width: 1.5,
      dashed: true,
      dash: 0.05,
      gap: 0.04,
    }),
    'ink',
  )
  // "What for": from the second item down to the purpose's top-right corner.
  const toPurpose = addStroke(
    stroke(
      [
        v(notice.position.x + sheetW, notice.position.y - 0.38),
        v(noticeAt.x + FRAME.w / 2, noticeAt.y + FRAME.h / 2),
      ],
      { width: 1.5, dashed: true, dash: 0.05, gap: 0.04 },
    ),
    'purpose',
  )

  // ── 06 Consent: the route ahead firms up in the consent tone.
  const permitted = addStroke(
    stroke(along(spine, spineT(AT.consent), spineT(AT.gate + 0.85), 220), { width: 2.75 }),
    'grant',
  )

  // ── 07 Purposes: one thick stream comes apart into three, each inside its
  // own purpose. Centre: necessary for the service. Left: analytics, allowed in
  // this illustration. Right: advertising, declined — open, but stopped short
  // of its vendor.
  const fork = spinePoint(AT.split)
  const streamEnd = -17.25
  const vendorY = -17.5
  const side = (sx: number) =>
    new THREE.CatmullRomCurve3([fork, v(sx * 0.45, fork.y - 0.6), v(sx * 0.65, fork.y - 1.3), v(sx * 0.65, streamEnd)]).getPoints(60)
  const centre = [fork, v(0, streamEnd)]
  const bundled = addStroke(stroke(centre, { width: 8 }), 'inkSoft')
  const neutral = [side(-1), centre, side(1)].map((points) =>
    addStroke(stroke(points, { width: 2 }), 'inkMuted'),
  )
  const necessary = addStroke(stroke(centre, { width: 3 }), 'ink')
  necessary.renderOrder = 1
  const agreed = addStroke(stroke(side(-1), { width: 2.75 }), 'grant')
  const declined = addStroke(
    stroke(side(1), { width: 1.75, dashed: true, dash: 0.08, gap: 0.07 }),
    'inkMuted',
  )
  const adStop = addStroke(strokes([v(0.5, -16.95), v(0.8, -16.95)], { width: 3 }), 'withdraw')
  const streamPurposes = addStroke(
    strokes(
      [-0.65, 0, 0.65].flatMap((x) =>
        bracketEdges(0.3, 0.3, 0, 0.08).map((p) => p.add(v(x, -16.1))),
      ),
      { width: 1.75 },
    ),
    'purpose',
  )
  const vendorFill = addMesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), 'grant', root, true)
  vendorFill.position.set(-0.65, vendorY, 0)
  const vendorReached = addStroke(
    strokes(boxEdges(0.22, 0.22, 0.22).map((p) => p.add(v(-0.65, vendorY))), { width: 1.5, dashed: true, dash: 0.04, gap: 0.035 }),
    'grant',
  )
  const vendorDark = addStroke(
    strokes(boxEdges(0.22, 0.22, 0.22).map((p) => p.add(v(0.65, vendorY))), { width: 1.5, dashed: true, dash: 0.04, gap: 0.035 }),
    'inkMuted',
  )

  // ── 08 Record: a slip set down beside the route, which stays.
  const record = new THREE.Group()
  record.position.set(-1.3, -16.25, 0.15)
  root.add(record)
  const slip = addMesh(new THREE.BoxGeometry(0.32, 0.4, 0.03), 'paperRaised', record, true)
  const slipEdge = addStroke(stroke(rectangle(0, 0, 0.32, 0.4, 0.02), { width: 1.25 }), 'ink', record)
  const slipRules = addStroke(
    strokes([v(-0.09, 0.08, 0.02), v(0.09, 0.08, 0.02), v(-0.09, 0, 0.02), v(0.09, 0, 0.02), v(-0.09, -0.08, 0.02), v(0.04, -0.08, 0.02)], {
      width: 1,
    }),
    'inkMuted',
    record,
  )
  const pin = addStroke(stroke([v(0.16, 0), v(0.7, 0)], { width: 1.25 }), 'inkSoft', record)

  // ── 09 Applied: stations admit or refuse, each on its own answer.
  const stations = STATIONS.map(({ y, side, pass }) => {
    const x = side * STATION_X
    if (pass) {
      const spur = addStroke(stroke([v(0, y), v(x - side * 0.08, y)], { width: 2.25 }), 'grant')
      const node = addMesh(new THREE.SphereGeometry(0.075, 24, 12), 'grant', root, true)
      node.position.set(x, y, 0)
      return { pass, spur, node, extra: [] as Stroke[] }
    }
    const half = side * 0.38
    const spur = addStroke(stroke([v(0, y), v(half, y)], { width: 2.25 }), 'grant')
    const bar = addStroke(strokes([v(half, y - 0.12), v(half, y + 0.12)], { width: 2.75 }), 'withdraw')
    const rest = addStroke(
      stroke([v(half + side * 0.06, y), v(x - side * 0.08, y)], { width: 1.25, dashed: true, dash: 0.04, gap: 0.05 }),
      'hairline',
    )
    const node = addMesh(new THREE.TorusGeometry(0.07, 0.013, 8, 40), 'withdraw')
    node.position.set(x, y, 0)
    return { pass, spur, node, extra: [bar, rest] }
  })
  const reached = stations.filter((s) => s.pass)

  // ── 11 Rights: lines from you to the data and everywhere it went.
  const youPoint = v(0, 0, 0)
  const ends = [
    spinePoint(AT.withdrawal),
    ...STATIONS.filter((s) => s.pass).map((s) => v(s.side * STATION_X, s.y)),
    FIDUCIARY.clone(),
    PROCESSOR.clone(),
  ]
  const rights = addStroke(strokes(ends.flatMap((end) => [youPoint, end]), { width: 1.25 }), 'inkSoft')

  // ── 13 Children: see Children.tsx.

  // ── 14 Manager: see ConsentManager.tsx.

  // ── 15 System: the dashed boundary of duties around everything. The
  // lifecycle itself is traced by Assembly.tsx.
  const duties = addStroke(
    stroke(rectangle(0, -12.45, 6.2, 27.3, -0.8), { width: 1.25, dashed: true, dash: 0.25, gap: 0.22 }),
    'inkMuted',
  )

  return {
    root,
    paint,
    ahead,
    straight,
    bar,
    consentWay,
    legitimateFaint,
    legitimateLit,
    shortcut,
    shortcutStop,
    frame,
    brackets,
    reach,
    refusal,
    beyond,
    sheet,
    surface,
    border,
    wallOfText,
    rows,
    toData,
    toPurpose,
    permitted,
    bundled,
    neutral,
    necessary,
    agreed,
    declined,
    adStop,
    streamPurposes,
    vendorFill,
    vendorReached,
    vendorDark,
    record,
    slip,
    slipEdge,
    slipRules,
    pin,
    stations,
    reached,
    rights,
    duties,
  }
}

/**
 * The journey: the route and every environment along it.
 */
export function Journey({ colors }: { colors: StageColors }) {
  const camera = useThree((s) => s.camera)
  const j = useMemo(() => build(), [])
  const tones = useMemo(() => ({ grant: new THREE.Color(), ink: new THREE.Color() }), [])

  useEffect(() => {
    for (const { material, tone } of j.paint) material.color.set(colors[tone])
    tones.grant.set(colors.grant)
    tones.ink.set(colors.ink)
  }, [colors, j, tones])

  useStoryFrame(() => {
    const pos = stage.pos

    // How "close" the camera is working: the wide shots in Acts V and VII
    // thin out the detail that only reads up close.
    const wide = Math.min(1, Math.max(0, (camera.position.distanceTo(stage.data) - 9) / 10))
    const close = 1 - wide

    // Route ahead: appears once the data is introduced.
    fade(j.ahead, span(pos, BEAT.you, BEAT.data) * 0.9)

    // 03 — the bar and the three ways appear with the question; each ground
    // lights as it is named; consent stays lit once it is the way taken.
    const g = GROUNDS.spacing
    const groundsIn = span(pos, GROUNDS.opener - 0.06, GROUNDS.opener + 0.06)
    const settled = lerp(1, 0.5, span(pos, CH.notice, CH.notice + 0.3))
    fade(j.straight, groundsIn * settled)
    fade(j.bar, groundsIn * lerp(0.6, 1, around(pos, GROUNDS.held, g)) * settled)
    const consentLit = Math.max(
      around(pos, GROUNDS.consent, g),
      span(pos, GROUNDS.perPurpose - 0.5 * g, GROUNDS.perPurpose - 0.12 * g),
    )
    fade(j.consentWay, consentLit * settled)
    fade(j.legitimateFaint, groundsIn * settled)
    const legitimate = around(pos, GROUNDS.legitimate, g)
    fade(j.legitimateLit, legitimate)
    fade(j.shortcut, legitimate)
    fade(j.shortcutStop, legitimate)

    // 04 — the purpose forms loose around the data, closes in until it fits
    // (only what it needs), then refuses a reach past its edge (no reuse).
    // From then on it rides with the data.
    const p = PURPOSE.spacing
    const frameIn = span(pos, PURPOSE.named - 0.5 * p, PURPOSE.named - 0.12 * p)
    const fitted = span(pos, PURPOSE.needs - 0.5 * p, PURPOSE.needs - 0.12 * p)
    j.frame.position.copy(stage.data)
    j.frame.scale.setScalar(lerp(lerp(1.9, 1.5, frameIn), 1, fitted))
    const managerAside =
      span(pos, MANAGER.opener, MANAGER.alike - 0.2 * MANAGER.spacing) * (1 - span(pos, CH.system, CH.system + 0.3))
    fade(j.brackets, frameIn * lerp(1, 0.35, wide) * (1 - managerAside))
    const reachIn =
      span(pos, PURPOSE.reuse - 0.5 * p, PURPOSE.reuse - 0.12 * p) *
      (1 - span(pos, CH.notice - 0.1, CH.notice + 0.11))
    fade(j.reach, reachIn)
    fade(j.refusal, reachIn)
    fade(j.beyond, reachIn * 0.9)

    // 05 — the notice unfolds downward as a wall of lines; the wall resolves
    // into items; the first two reach the data and its purpose; the rest
    // light. It is kept afterwards, quieter: the version a record points to.
    const n = NOTICE.spacing
    const unfold = span(pos, NOTICE.opener + 0.05 * n, NOTICE.wall - 0.2 * n)
    // It steps aside while chapter 06 holds the stage near it, then returns.
    const aside =
      span(pos, CONSENT.opener, CONSENT.term - 0.2 * CONSENT.spacing) * (1 - span(pos, CH.split, CH.split + 0.3))
    const kept = lerp(1, 0.5, span(pos, CH.consent, CH.consent + 0.3)) * (1 - aside) * close
    j.sheet.scale.y = Math.max(0.001, unfold)
    fadeMesh(j.surface, unfold * kept)
    fade(j.border, unfold * kept)
    const itemised = span(pos, NOTICE.itemised - 0.45 * n, NOTICE.itemised - 0.15 * n)
    for (const line of j.wallOfText) fadeMesh(line, unfold * (1 - itemised) * 0.7 * kept)
    j.rows.forEach(({ tick, bar }, i) => {
      const lit =
        i < 2
          ? span(pos, NOTICE.whatWhy - 0.45 * n, NOTICE.whatWhy - 0.2 * n)
          : span(pos, NOTICE.after - (0.5 - 0.07 * (i - 2)) * n, NOTICE.after - (0.3 - 0.07 * (i - 2)) * n)
      fadeMesh(tick, itemised * kept * 0.8)
      fadeMesh(bar, itemised * kept * lerp(0.2, 0.95, lit))
    })
    const linked =
      span(pos, NOTICE.whatWhy - 0.35 * n, NOTICE.whatWhy - 0.1 * n) * (1 - span(pos, CH.consent, CH.consent + 0.2))
    fade(j.toData, linked)
    fade(j.toPurpose, linked)

    // 06, 07 — consent firms the route ahead; it splits; a declined route stays.
    // Withdrawal stops what relied on consent (Director computes when).
    const drained = stage.withdrawal.stop
    const yes = span(pos, CONSENT.given - 0.05 * CONSENT.spacing, CONSENT.given + 0.3 * CONSENT.spacing)
    fade(j.permitted, yes * (1 - drained * 0.85))
    // 07 — one stream; it comes apart into three, each in its own purpose;
    // the centre runs; analytics lights and advertising stops short; each
    // reaches — or does not reach — its vendor.
    const sp = SPLIT.spacing
    const at = (m: number) => span(pos, m - 0.45 * sp, m - 0.15 * sp)
    const separated = at(SPLIT.separate)
    const necessaryOn = at(SPLIT.necessary)
    const answered = at(SPLIT.optional)
    const reached = at(SPLIT.vendors)
    fade(j.bundled, at(SPLIT.oneStream) * (1 - separated) * 0.85)
    fade(j.neutral[0], separated * (1 - answered))
    fade(j.neutral[1], separated * (1 - necessaryOn))
    fade(j.neutral[2], separated * (1 - answered))
    fade(j.streamPurposes, separated * lerp(1, 0.45, span(pos, CH.record, CH.record + 0.3)))
    fade(j.necessary, necessaryOn * lerp(1, 0.6, span(pos, CH.record, CH.record + 0.3)))
    fade(j.agreed, answered * (1 - drained * 0.85))
    fade(j.declined, answered)
    fade(j.adStop, answered)
    fadeMesh(j.vendorFill, reached * 0.4 * (1 - drained))
    fade(j.vendorReached, reached * (1 - drained * 0.7))
    fade(j.vendorDark, reached * 0.55)

    // 08 — the record mark beside the route takes over from the slip filled
    // in under the data (Evidence.tsx) as it is filed, and stays.
    const recordIn = span(pos, RECORD.summary - 0.2 * RECORD.spacing, RECORD.summary - 0.05 * RECORD.spacing)
    fadeMesh(j.slip, recordIn)
    fade(j.slipEdge, recordIn)
    fade(j.slipRules, recordIn)
    fade(j.pin, recordIn)

    // 09, 10 — stations answer; on withdrawal, the ones reached go dark in turn.
    const gateIn = span(pos, CH.gate, CH.gate + 0.26)
    j.stations.forEach((s) => {
      fade(s.spur, gateIn)
      for (const line of s.extra) fade(line, gateIn)
      fadeMesh(s.node, gateIn)
    })
    j.reached.forEach((s, k) => {
      // Told one after another, not all at once.
      const dark = span(stage.withdrawal.systems, k * 0.4, k * 0.4 + 0.6)
      const material = s.node.material as THREE.MeshStandardMaterial
      material.color.lerpColors(tones.grant, tones.ink, dark)
      s.spur.material.color.lerpColors(tones.grant, tones.ink, dark)
      fade(s.spur, gateIn * lerp(1, 0.4, dark))
    })

    // 11 — the rights fan out from you; they return for the whole-system view.
    const rightsIn =
      span(pos, RIGHTS.summary - 0.45 * RIGHTS.spacing, RIGHTS.summary - 0.1 * RIGHTS.spacing) *
        // They step aside while the duties ring is close up in chapter 12.
        (1 - span(pos, CH.duties - 0.1, CH.duties + 0.05)) +
      span(pos, SYSTEM.beyond - 0.45 * SYSTEM.spacing, SYSTEM.beyond - 0.15 * SYSTEM.spacing) * 0.5
    fade(j.rights, Math.min(1, rightsIn))

    // 15 — the boundary of duties arrives when the view widens beyond the
    // lifecycle, and stays.
    fade(j.duties, span(pos, SYSTEM.beyond - 0.45 * SYSTEM.spacing, SYSTEM.beyond - 0.15 * SYSTEM.spacing))
  })

  return <primitive object={j.root} />
}
