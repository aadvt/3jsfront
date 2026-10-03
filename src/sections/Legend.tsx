import { Glyph } from '../components/Glyph'
import { acts } from '../content/acts'
import { chapterCount } from '../content/chapters'
import { vocabulary } from '../content/vocabulary'

/**
 * The key to the shapes, given once before the story starts. Eight marks is
 * the whole visual vocabulary: every illustration that follows is built from
 * these, so learning them here is what lets the later chapters show rather
 * than explain.
 */
export function Legend() {
  return (
    <section className="legend" aria-labelledby="legend-title">
      <div className="legend__inner">
        <h2 className="legend__title" id="legend-title">
          How to read the pictures
        </h2>
        <p className="legend__note">
          Eight shapes, used the same way in every chapter. Colour only ever
          belongs to your data.
        </p>
        <dl className="legend__list">
          {vocabulary.map((mark) => (
            <div className="legend__item" key={mark.id} data-mark={mark.id}>
              <dt>
                <Glyph id={mark.id} />
                <span>{mark.name}</span>
              </dt>
              <dd>{mark.standsFor}</dd>
            </div>
          ))}
        </dl>

        <dl className="legend__facts">
          <div>
            <dt>Chapters</dt>
            <dd>{chapterCount}</dd>
          </div>
          <div>
            <dt>Acts</dt>
            <dd>{acts.length}</dd>
          </div>
          <div>
            <dt>Written for</dt>
            <dd>First-time readers</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
