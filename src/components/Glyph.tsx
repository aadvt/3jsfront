import type { ReactNode } from 'react'
import type { MarkId } from '../content/types'
import { Datum, Endpoint, Link, Org, Principal, Purpose, Record } from './marks'

/**
 * One mark of the vocabulary, alone, at icon size. Used by the legend and the
 * site mark. Drawn with the same primitives as the plates, so a glyph in the
 * key is exactly the shape the reader will meet in a chapter.
 */
const glyphs: Record<MarkId, ReactNode> = {
  principal: <Principal x={20} y={20} />,
  data: <Datum x={20} y={20} r={11} />,
  fiduciary: <Org x={20} y={20} kind="fiduciary" />,
  processor: <Org x={20} y={20} kind="processor" />,
  purpose: (
    <>
      <Purpose x={6} y={8} w={28} h={24} arm={7} />
      <Datum x={20} y={20} r={5} />
    </>
  ),
  consent: <Datum x={20} y={20} r={11} state="consented" />,
  record: <Record x={20} y={20} />,
  right: (
    <>
      <Link d="M9 20L31 9M9 20L31 31M9 20H31" />
      <circle className="mk-principal__core" cx={9} cy={20} r={3} />
      <Endpoint x={31} y={9} />
      <Endpoint x={31} y={20} />
      <Endpoint x={31} y={31} />
    </>
  ),
}

export function Glyph({ id, className = 'glyph' }: { id: MarkId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {glyphs[id]}
    </svg>
  )
}
