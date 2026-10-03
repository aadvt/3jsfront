import { Datum, Purpose, Route, Station, Stop } from './marks'

/**
 * Chapter 09 drawn flat and upright: the data passing a line of stations
 * inside its purpose — the ones its record covers let it through, the rest
 * refuse. A stand-in for the stage when WebGL is unavailable.
 */
const STATIONS = [
  { y: 70, side: 1, pass: true },
  { y: 96, side: -1, pass: false },
  { y: 122, side: 1, pass: true },
  { y: 148, side: -1, pass: false },
]

export function GateFigure({ step }: { step: string }) {
  const told = step !== 'reach'
  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      <Purpose x={14} y={44} w={104} h={128} arm={12} />
      <Route d="M66 20V176" state="consented" />
      {STATIONS.map(({ y, side, pass }) => {
        const x = 66 + side * 36
        return (
          <g key={y}>
            <Route d={`M66 ${y}H${pass || !told ? x : 66 + side * 18}`} state="consented" />
            {!pass && told ? <Stop x={66 + side * 18} y={y} /> : null}
            <Station x={x} y={y} state={told ? (pass ? 'pass' : 'refuse') : 'dark'} />
          </g>
        )
      })}
      <Datum x={66} y={28} r={11} state="consented" />
    </svg>
  )
}
