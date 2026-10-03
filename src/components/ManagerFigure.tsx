import { Datum, Org, Principal, Stop } from './marks'

/**
 * Chapter 14 drawn flat: two identical holders above the data, separated by a
 * divider — one on your side, registered with the Board and reaching across
 * to several organisations; one inside the organisation's boundary, its line
 * toward the Board stopped. A stand-in for the stage when WebGL is unavailable.
 */
export function ManagerFigure({ step }: { step: string }) {
  const order = ['alike', 'manager', 'reach', 'platform', 'qualification']
  const k = step === 'all' ? order.length : order.indexOf(step) + 1
  const apart = k >= 2
  const reach = k >= 3
  const platform = k >= 4
  const qualified = k >= 5
  const lx = apart ? 36 : 52
  const rx = apart ? 96 : 80

  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      {apart ? <path className="mk-duties" d="M66 20V120" /> : null}
      {[lx, rx].map((x) => (
        <g key={x}>
          <rect className="mk-sheet" x={x - 11} y={84} width={22} height={28} style={{ stroke: 'var(--ink-soft)' }} />
          <path className="mk-link mk-link--dashed" d={`M${x} 112L66 150`} />
        </g>
      ))}
      {apart ? (
        <g>
          <Principal x={12} y={98} />
          <path className="mk-link" d={`M20 98H${lx - 11}`} />
          <rect className="mk-endpoint" x={lx - 7} y={34} width={14} height={14} />
          <rect className="mk-endpoint" x={lx - 10} y={31} width={20} height={20} />
          <path className="mk-link" d={`M${lx} 84V51`} />
        </g>
      ) : null}
      {reach ? <path className="mk-route mk-route--declined" d={`M${lx + 11} 100L116 98M${lx + 11} 104L84 172M${lx + 11} 104L112 170`} style={{ stroke: 'var(--c-grant)' }} /> : null}
      {reach ? (
        <g>
          <Org x={120} y={98} kind="fiduciary" s={10} />
          <Org x={84} y={176} kind="fiduciary" s={8} />
          <Org x={112} y={174} kind="fiduciary" s={8} />
        </g>
      ) : null}
      {platform ? <rect className="mk-duties" x={80} y={76} width={48} height={44} style={{ stroke: 'var(--ink)' }} /> : null}
      {qualified ? (
        <g>
          <path className="mk-link mk-link--dashed" d={`M${rx} 84L62 56`} />
          <Stop x={70} y={62} />
        </g>
      ) : null}
      <Datum x={66} y={160} r={11} state="withdrawn" />
    </svg>
  )
}
