import type { ReactNode } from 'react'
import { PresentationControls } from '@react-three/drei'
import { useChoices } from '../../state/journey'
import { Plate, StationContext } from '../kit'
import { placements } from '../layout'

/**
 * Places a station on the helix, gives its parts their station, and stands it
 * on its plate. With a mouse, the active station can be turned by dragging;
 * it springs back when let go, so the framing is never lost.
 */
export function StationGroup({ index, children, drag }: { index: number; children: ReactNode; drag: boolean }) {
  const p = placements[index]
  const active = useChoices((s) => s.active === index)
  return (
    <StationContext.Provider value={{ index, id: p.id }}>
      <group position={p.position} rotation={[0, p.angle, 0]}>
        <PresentationControls
          enabled={drag && active}
          global={false}
          cursor={drag && active}
          snap
          speed={1.4}
          polar={[-0.12, 0.2]}
          azimuth={[-0.55, 0.55]}
        >
          <Plate y={p.floor} />
          {children}
        </PresentationControls>
      </group>
    </StationContext.Provider>
  )
}
