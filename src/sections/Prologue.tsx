import { PrologueFigure } from '../components/PrologueFigure'
import { beats } from '../content/prologue'

/**
 * The opening sequence: three beats that build one picture, top to bottom —
 * you, your data, the system. Each beat is a viewport tall so the stage can
 * linger on the part it names, and the whole section is measured by the scroll
 * driver (`data-prologue`) as the −1 → 0 stretch of the story timeline.
 *
 * Each card carries a flat version of the picture, shown only when the 3D
 * layer is unavailable (see `[data-stage]` in `app.css`).
 */
export function Prologue() {
  return (
    <section className="prologue" data-prologue aria-labelledby="prologue-title">
      <h2 className="visually-hidden" id="prologue-title">
        Before the first chapter
      </h2>
      {beats.map((beat, index) => (
        <div className="beat" key={beat.id} data-beat={beat.id}>
          <div className="beat__card">
            <PrologueFigure highlight={beat.id} />
            <div className="beat__words">
              <p className="beat__count">
                <span className="visually-hidden">Part </span>
                {index + 1}
                <span aria-hidden="true">/</span>
                <span className="visually-hidden"> of </span>
                {beats.length}
              </p>
              <h3 className="beat__title">{beat.title}</h3>
              <p className="beat__text">{beat.text}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
