import { Datum, Link, Purpose } from './marks'

/**
 * Chapter 05 drawn flat and upright: the notice above your data — a wall of
 * lines, then separate items, the first two reaching down to the data and the
 * purpose around it. A stand-in for the stage when WebGL is unavailable.
 */
export function NoticeFigure({ step }: { step: string }) {
  const wall = step === 'wall'
  const linked = step === 'what-why' || step === 'all'
  const after = step === 'after' || step === 'all'

  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      <rect className="mk-sheet" x={40} y={10} width={80} height={90} rx={2} />
      {wall
        ? Array.from({ length: 13 }, (_, i) => (
            <path key={i} className="mk-link mk-link--dashed" d={`M48 ${18 + i * 6}H${i % 4 === 3 ? 96 : 112}`} />
          ))
        : Array.from({ length: 6 }, (_, i) => {
            const lit = i < 2 ? linked || after : after
            return (
              <rect
                key={i}
                className={lit ? 'mk-node' : 'mk-duties'}
                x={56}
                y={20 + i * 13}
                width={48 - (i % 3) * 10}
                height={4}
              />
            )
          })}
      <Purpose x={26} y={122} w={80} h={64} arm={10} />
      <Datum x={66} y={154} r={13} />
      {linked ? (
        <g>
          <Link d="M40 22L58 144" dashed />
          <Link d="M120 35L106 122" dashed />
        </g>
      ) : null}
    </svg>
  )
}
