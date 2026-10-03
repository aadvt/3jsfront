import type { ReactNode } from 'react'
import type { Treatment } from '../content/types'
import {
  Datum,
  Endpoint,
  Label,
  Link,
  Org,
  Principal,
  Purpose,
  Record,
  Route,
  Station,
  Stop,
} from './marks'

/**
 * The static plate for a chapter: its `visual.event`, drawn at rest from the
 * mark vocabulary.
 *
 * This is the still version of the stage. It is what the story looks like with
 * no animation and no WebGL, and it is the diagram the 3D layer elaborates on
 * rather than replaces. Each composition uses only the elements the chapter's
 * `visual.elements` lists — the same rule the 3D scene follows.
 *
 * The plate is `aria-hidden`: the chapter's figure caption carries the same
 * description in text, so nothing here is the only copy of anything.
 *
 * All plates share one 320 × 104 coordinate space, so their marks are the same
 * size from chapter to chapter and the vocabulary stays legible as a system.
 */
const PLATE_W = 320
const PLATE_H = 104
const MID = PLATE_H / 2

const plates: Record<Treatment, () => ReactNode> = {
  // 01 — a point, and the one solid it sheds.
  origin: () => (
    <>
      <Route d={`M106 ${MID}H196`} state="faint" />
      <Principal x={92} y={MID} />
      <Datum x={214} y={MID} r={15} />
      <Label x={92} y={MID + 30}>You</Label>
      <Label x={214} y={MID + 30} tone="strong">Your data</Label>
    </>
  ),

  // 02 — three positions, and responsibility drawn from decider to doer.
  cast: () => (
    <>
      <Link d={`M52 ${MID}H98`} dashed />
      <Link d={`M124 ${MID}H184`} dashed />
      <Link d={`M200 ${MID}H262`} />
      <Principal x={40} y={MID} />
      <Datum x={111} y={MID} />
      <Org x={192} y={MID} kind="fiduciary" />
      <Org x={272} y={MID} kind="processor" />
      <Label x={40} y={MID + 30}>You</Label>
      <Label x={192} y={MID + 30} tone="strong">Fiduciary</Label>
      <Label x={272} y={MID + 30}>Processor</Label>
      <Label x={232} y={MID - 12}>responsible</Label>
    </>
  ),

  // 03 — two routes ahead; for this purpose, exactly one is lit.
  grounds: () => (
    <>
      <Route d={`M62 ${MID}C110 ${MID} 110 26 160 26H296`} state="travelled" />
      <Route d={`M62 ${MID}C110 ${MID} 110 78 160 78H296`} state="faint" />
      <Datum x={48} y={MID} />
      <Label x={296} y={18} anchor="end" tone="strong">Consent</Label>
      <Label x={296} y={96} anchor="end">Legitimate use — not this time</Label>
    </>
  ),

  // 04 — a bounded purpose; a reach past its edge is stopped, not bent.
  frame: () => (
    <>
      <Purpose x={60} y={12} w={180} h={80} />
      <Route d={`M142 ${MID}H240`} state="travelled" />
      <Route d={`M246 ${MID}H300`} state="faint" />
      <Stop x={240} y={MID} />
      <Datum x={128} y={MID} />
      <Label x={68} y={26} anchor="start" tone="strong">Purpose</Label>
      <Label x={300} y={MID - 12} anchor="end">refused</Label>
    </>
  ),

  // 05 — a surface opens and is read item by item.
  unfold: () => {
    const items = ['The data', 'The purpose', 'How to withdraw', 'Your rights', 'How to complain', 'Who to contact']
    return (
      <>
        <Link d={`M62 ${MID}H112`} dashed />
        <Datum x={48} y={MID} />
        <rect className="mk-sheet" x={112} y={6} width={192} height={92} rx={2} />
        {items.map((item, i) => (
          <g key={item}>
            <Label x={124} y={22 + i * 14} anchor="start">{`0${i + 1}`}</Label>
            <Label x={142} y={22 + i * 14} anchor="start" tone="strong">{item}</Label>
          </g>
        ))}
      </>
    )
  },

  // 06 — the object does not move; it changes state, and the route firms up.
  affirm: () => (
    <>
      <Route d={`M24 ${MID}H94`} state="faint" />
      <Route d={`M128 ${MID}H296`} state="consented" />
      <Datum x={111} y={MID} r={15} state="consented" />
      <Label x={111} y={MID + 32} tone="strong">Consented</Label>
      <Label x={296} y={MID - 12} anchor="end">permitted</Label>
    </>
  ),

  // 07 — one route becomes several; a declined one stays open.
  split: () => (
    <>
      <Route d={`M60 ${MID}H112`} state="consented" />
      <Route d={`M112 ${MID}C150 ${MID} 150 22 188 22H296`} state="consented" />
      <Route d={`M112 ${MID}H296`} state="consented" />
      <Route d={`M112 ${MID}C150 ${MID} 150 82 188 82H296`} state="declined" />
      <Datum x={46} y={MID} state="consented" />
      <Label x={296} y={14} anchor="end">agreed</Label>
      <Label x={296} y={MID - 8} anchor="end">agreed</Label>
      <Label x={296} y={98} anchor="end" tone="strong">declined — still a valid answer</Label>
    </>
  ),

  // 08 — a marker set down beside the route, which stays.
  ledger: () => (
    <>
      <Route d={`M24 66H296`} state="consented" />
      <Link d="M76 44V66" />
      <Record x={76} y={30} />
      <Datum x={216} y={66} state="consented" />
      <Label x={92} y={28} anchor="start" tone="strong">Record</Label>
      <Label x={92} y={41} anchor="start">request · notice version · choice · time</Label>
    </>
  ),

  // 09 — stations inside the purpose; some admit, the rest refuse.
  gate: () => {
    const stations: { x: number; pass: boolean }[] = [
      { x: 104, pass: true },
      { x: 160, pass: false },
      { x: 216, pass: true },
      { x: 272, pass: false },
    ]
    return (
      <>
        <Purpose x={14} y={8} w={292} h={88} />
        <Route d="M50 74H272" state="consented" />
        {stations.map(({ x, pass }) =>
          pass ? (
            <g key={x}>
              <Route d={`M${x} 74V36`} state="consented" />
              <Station x={x} y={30} state="pass" />
            </g>
          ) : (
            <g key={x}>
              <Route d={`M${x} 74V54`} state="consented" />
              <Stop x={x} y={54} vertical={false} />
              <Station x={x} y={30} state="refuse" />
            </g>
          ),
        )}
        <Datum x={44} y={74} state="consented" />
        <Label x={104} y={17}>allowed</Label>
        <Label x={160} y={17}>refused</Label>
      </>
    )
  },

  // 10 — consent drains; what comes next stops, in order.
  reverse: () => (
    <>
      <Route d={`M24 ${MID}H140`} state="travelled" />
      <Route d={`M164 ${MID}H292`} state="faint" />
      {[196, 240, 284].map((x, i) => (
        <g key={x} style={{ opacity: 1 - i * 0.28 }}>
          <Link d={`M${x} ${MID}V30`} dashed />
          <Station x={x} y={24} state="dark" />
          <Label x={x} y={MID + 18}>{i + 1}</Label>
        </g>
      ))}
      <Datum x={152} y={MID} state="withdrawn" />
      <Label x={24} y={MID + 22} anchor="start">already done — stays lawful</Label>
      <Label x={152} y={MID - 22} tone="strong">Withdrawn</Label>
    </>
  ),

  // 11 — lines outward from you, through the data, to everywhere it went.
  radial: () => {
    const ends: [number, number][] = [
      [236, 14],
      [262, 40],
      [262, 66],
      [236, 92],
    ]
    return (
      <>
        <Link d={`M58 ${MID}H126`} />
        {ends.map(([x, y]) => (
          <Link key={`${x}-${y}`} d={`M150 ${MID}L${x} ${y}`} />
        ))}
        <Principal x={46} y={MID} />
        <Datum x={138} y={MID} />
        {ends.map(([x, y], i) => (
          <Org key={`o${x}-${y}`} x={x + 12} y={y} kind={i % 2 ? 'processor' : 'fiduciary'} s={11} />
        ))}
        {ends.map(([x, y]) => (
          <Endpoint key={`e${x}-${y}`} x={x} y={y} />
        ))}
        <Label x={46} y={MID + 28}>You</Label>
        <Label x={176} y={100}>where it went</Label>
      </>
    )
  },

  // 12 — the same lines from the far end; some duties answer no one.
  counterpart: () => (
    <>
      <Link d={`M64 26L212 ${MID}`} />
      <Link d={`M64 ${MID}H212`} />
      <Link d={`M64 78L212 ${MID}`} />
      <Link d="M232 46L270 18" dashed />
      <Link d={`M236 ${MID}H270`} dashed />
      <Link d="M232 58L270 86" dashed />
      <Endpoint x={60} y={26} />
      <Endpoint x={60} y={MID} />
      <Endpoint x={60} y={78} />
      <Org x={222} y={MID} kind="fiduciary" s={20} />
      <Label x={48} y={MID + 3} anchor="end">rights</Label>
      <Label x={222} y={MID + 28} tone="strong">the duty</Label>
      <Label x={276} y={21} anchor="start">security</Label>
      <Label x={276} y={MID + 3} anchor="start">retention</Label>
      <Label x={276} y={89} anchor="start">contracts</Label>
    </>
  ),

  // 13 — a stricter boundary inside the purpose; most routes cannot cross.
  threshold: () => (
    <>
      <Purpose x={10} y={4} w={300} h={96} />
      {/* Closed, and drawn twice: a purpose is open brackets, this one shuts. */}
      <rect className="mk-strict" x={176} y={16} width={120} height={72} />
      <rect className="mk-strict mk-strict--inner" x={180} y={20} width={112} height={64} />
      <Route d="M62 52C110 52 116 30 168 30" state="faint" />
      <Route d="M62 52H168" state="faint" />
      <Route d="M62 52C110 52 120 74 176 74" state="declined" />
      <Stop x={168} y={30} />
      <Stop x={168} y={52} />
      <Station x={176} y={74} state="held" />
      <Datum x={48} y={52} />
      <Label x={160} y={20} anchor="end">cannot cross</Label>
      <Label x={168} y={92} anchor="end" tone="strong">held for a guardian</Label>
    </>
  ),

  // 14 — two holders, one record each; they face different ways.
  custody: () => (
    <>
      <Link d={`M36 ${MID}H76`} />
      <Link d={`M244 ${MID}H284`} />
      <path className="mk-holder" d={`M76 ${MID}L86 24H150V80H86Z`} />
      <path className="mk-holder" d={`M244 ${MID}L234 24H170V80H234Z`} />
      <Record x={118} y={MID} />
      <Record x={202} y={MID} />
      <Principal x={24} y={MID} />
      <Org x={296} y={MID} kind="fiduciary" />
      <Label x={118} y={98} tone="strong">Consent Manager</Label>
      <Label x={202} y={98}>Platform</Label>
      <Label x={24} y={MID - 16}>You</Label>
    </>
  ),

  // 15 — the seven steps resolved into one still diagram, inside its duties.
  assembly: () => {
    const xs = [32, 72, 112, 152, 192, 232, 272]
    return (
      <>
        <rect className="mk-duties" x={6} y={10} width={308} height={84} rx={2} />
        <Route d={`M32 ${MID}H272`} state="travelled" />
        {xs.map((x, i) => (
          <g key={x}>
            <circle className="mk-node" cx={x} cy={MID} r={3} />
            <Label x={x} y={MID + 18}>{`0${i + 1}`}</Label>
          </g>
        ))}
        <Datum x={292} y={MID} r={10} />
        <Label x={14} y={24} anchor="start">duties outside the banner</Label>
        <Label x={32} y={MID - 12} anchor="start" tone="strong">notice → updated</Label>
      </>
    )
  },
}

export function Plate({ treatment }: { treatment: Treatment }) {
  return (
    <svg
      className="plate"
      viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
      aria-hidden="true"
      focusable="false"
      data-treatment={treatment}
    >
      {plates[treatment]()}
    </svg>
  )
}
