import { Purpose } from './marks'

/**
 * Chapter 08 drawn flat: the record slip filling in field by field — the
 * notice snapshot linked to the version it was, the purposes as decided, a
 * mark on a time rail with an identifier — beside a shelf of notice versions
 * where the old one is kept when a new one arrives. A stand-in for the stage
 * when WebGL is unavailable.
 */
export function RecordFigure({ step }: { step: string }) {
  const order = ['press', 'seen', 'decided', 'when', 'version']
  const k = step === 'all' ? order.length : order.indexOf(step) + 1
  const seen = k >= 2
  const decided = k >= 3
  const when = k >= 4
  const changed = k >= 5

  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      <rect
        className={seen ? 'mk-sheet' : 'mk-duties'}
        x={8}
        y={30}
        width={84}
        height={120}
        rx={2}
        style={seen ? { stroke: 'var(--ink)', strokeWidth: 1.5 } : undefined}
      />
      {seen ? (
        <g>
          <rect className="mk-sheet" x={16} y={40} width={30} height={38} />
          <path className="mk-link mk-link--dashed" d={`M46 58L102 ${changed ? 110 : 58}`} />
        </g>
      ) : null}
      {decided ? (
        <g>
          {[46, 58, 70].map((y) => (
            <Purpose key={y} x={54} y={y - 4} w={8} h={8} arm={3} />
          ))}
          <path className="mk-route mk-route--consented" d="M66 46H84" />
          <path className="mk-route mk-route--travelled" d="M66 58H84" />
          <path className="mk-route mk-route--declined" d="M66 70H84" />
        </g>
      ) : null}
      {when ? (
        <g>
          <path className="mk-link" d="M16 110H84" />
          <path className="mk-stop" d="M60 102V118" style={{ stroke: 'var(--ink)' }} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} className="mk-node" x={16 + i * 7} y={128 + (i % 3) * 2} width={3} height={10 - (i % 3) * 2} />
          ))}
        </g>
      ) : null}
      {seen ? <rect className="mk-sheet" x={102} y={changed ? 92 : 40} width={24} height={30} style={{ opacity: changed ? 0.7 : 1 }} /> : null}
      {changed ? <rect className="mk-sheet" x={102} y={40} width={24} height={30} /> : null}
    </svg>
  )
}
