import { Datum, Link, Purpose, Route, Stop } from './marks'

/**
 * Chapter 04 drawn flat and upright: the data, a loose frame that closes in to
 * fit it, and a reach past the frame's edge refused. A stand-in for the stage
 * when WebGL is unavailable; `step` is the moment being shown.
 */
export function PurposeFigure({ step }: { step: string }) {
  const loose = step === 'purpose'
  const reach = step === 'reuse' || step === 'all'
  const frame = loose ? { x: 14, y: 50, w: 104, h: 104 } : { x: 36, y: 72, w: 60, h: 60 }

  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      <Route d="M66 14V78" state="travelled" />
      <Route d="M66 126V186" state="faint" />
      <Purpose {...frame} arm={loose ? 14 : 10} />
      <Datum x={66} y={102} r={13} />
      {reach ? (
        <g>
          <Route d="M80 102H96" state="travelled" />
          <Stop x={96} y={102} />
          <Link d="M100 102H126" dashed />
        </g>
      ) : null}
    </svg>
  )
}
