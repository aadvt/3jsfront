import { Org } from './marks'

/**
 * Chapter 12 drawn flat: the fiduciary at the centre of its ring of seven
 * duties — consent handling just one of them — with a dashed bracket below
 * for the additional duties of designated Significant Data Fiduciaries. A
 * stand-in for the stage when WebGL is unavailable.
 */
const ORDER = ['banner', 'lawful', 'security', 'accuracy', 'rights', 'processors', 'retention']

export function DutiesFigure({ step }: { step: string }) {
  const significant = step === 'significant' || step === 'all'
  return (
    <svg className="stand-in" viewBox="0 0 132 196" aria-hidden="true" focusable="false">
      {ORDER.map((id, k) => {
        const on = step === 'all' || step === id
        const a = Math.PI / 2 + (k / ORDER.length) * Math.PI * 2
        const x = 66 + Math.cos(a) * 44
        const y = 78 - Math.sin(a) * 48
        return (
          <g key={id} className="stand-in__part" data-on={on || undefined}>
            <path className="mk-link" d={`M66 78L${x} ${y}`} />
            <rect
              className={id === 'banner' ? 'mk-station mk-station--pass' : 'mk-endpoint'}
              x={x - 7}
              y={y - 7}
              width={14}
              height={14}
            />
          </g>
        )
      })}
      <Org x={66} y={78} kind="fiduciary" s={18} />
      <g className="stand-in__part" data-on={significant || undefined}>
        <rect className="mk-duties" x={22} y={150} width={88} height={30} />
        {[44, 66, 88].map((x) => (
          <rect key={x} className="mk-endpoint" x={x - 6} y={159} width={12} height={12} />
        ))}
      </g>
    </svg>
  )
}
