import { acts } from '../content/acts'
import { chaptersByAct } from '../content/chapters'

/**
 * The whole story on one screen, as takeaways. This is the page you send someone
 * who does not want to scroll, and it is the reason the experience is still
 * useful with no 3D at all: every chapter's single most important sentence is
 * here, in order, as plain HTML.
 */
export function StoryIndex() {
  return (
    <section className="index" aria-labelledby="index-title">
      <div className="index__inner">
        <p className="index__eyebrow">Everything, in one place</p>
        <h2 className="index__title" id="index-title">
          Fifteen things to walk away knowing
        </h2>

        <ol className="index__acts">
          {acts.map((act) => (
            <li className="index__act" key={act.id}>
              <h3 className="index__act-title">
                <span className="index__act-numeral" aria-hidden="true">
                  {act.numeral}
                </span>
                <span className="visually-hidden">{`Act ${act.numeral}: `}</span>
                {act.title}
              </h3>
              <ol className="index__chapters">
                {(chaptersByAct[act.id] ?? []).map((chapter) => (
                  <li key={chapter.id}>
                    <a className="index__link" href={`#${chapter.id}`}>
                      <span className="index__label">{chapter.label}</span>
                      <span className="index__text">
                        <span className="index__chapter-title">{chapter.title}</span>
                        <span className="index__takeaway">{chapter.takeaway}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
