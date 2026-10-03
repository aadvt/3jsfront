import { chaptersByAct } from '../content/chapters'
import type { Act } from '../content/types'

/**
 * A pause between acts. Fifteen chapters in a row is a list; seven acts with a
 * stated premise is a story with a shape. The break is deliberately short and
 * deliberately not a sticky panel — it reads as a held breath, and it lets the
 * 3D layer rest on the state the previous chapter left it in.
 *
 * It also says what is coming: the act's chapters, by number and name, so the
 * reader always knows how long this stretch is.
 */
export function ActBreak({ act }: { act: Act }) {
  const titleId = `act-${act.id}-title`
  const ahead = chaptersByAct[act.id] ?? []

  return (
    <section className="act-break" aria-labelledby={titleId} data-act={act.id}>
      <div className="act-break__inner">
        <p className="act-break__numeral" aria-hidden="true">
          <span className="act-break__word">Act</span>
          {act.numeral}
        </p>
        <h2 className="act-break__title" id={titleId}>
          <span className="visually-hidden">{`Act ${act.numeral}: `}</span>
          {act.title}
        </h2>
        <p className="act-break__premise">{act.premise}</p>
        <ol className="act-break__ahead" aria-label="Chapters in this act">
          {ahead.map((chapter) => (
            <li key={chapter.id}>
              <span className="act-break__label">{chapter.label}</span>
              {chapter.stage}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
