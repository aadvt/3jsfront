import { actById } from '../content/acts'
import { chapters } from '../content/chapters'
import { useActiveChapter, useInPrologue } from '../hooks/useActiveChapter'

/** The mobile counterpart of the rail: a compact, honest position indicator. */
export function StageCounter() {
  const active = useActiveChapter()
  const prologue = useInPrologue()
  const chapter = chapters[active]
  const act = actById.get(chapter.actId)

  return (
    // Nothing to count before the story starts.
    <div className="counter" role="status" aria-live="polite" hidden={prologue}>
      <span className="counter__index">
        <span aria-hidden="true">
          {chapter.label}/{chapters.length}
        </span>
        <span className="visually-hidden">
          Chapter {chapter.label} of {chapters.length}
          {act ? `, act ${act.numeral}` : ''}
        </span>
      </span>
      <span className="counter__stage">{chapter.stage}</span>
    </div>
  )
}
