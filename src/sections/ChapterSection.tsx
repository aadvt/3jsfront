import type { CSSProperties, ReactNode } from 'react'
import { Glyph } from '../components/Glyph'
import { AssemblyFigure } from '../components/AssemblyFigure'
import { ChildrenFigure } from '../components/ChildrenFigure'
import { ConsentFigure } from '../components/ConsentFigure'
import { DutiesFigure } from '../components/DutiesFigure'
import { GateFigure } from '../components/GateFigure'
import { GroundsFigure } from '../components/GroundsFigure'
import { ManagerFigure } from '../components/ManagerFigure'
import { NoticeFigure } from '../components/NoticeFigure'
import { Plate } from '../components/Plate'
import { WithdrawControl } from '../components/WithdrawControl'
import { WithdrawalFigure } from '../components/WithdrawalFigure'
import { PrologueFigure } from '../components/PrologueFigure'
import { PurposeFigure } from '../components/PurposeFigure'
import { RecordFigure } from '../components/RecordFigure'
import { RightsFigure } from '../components/RightsFigure'
import { RolesFigure } from '../components/RolesFigure'
import { SplitFigure } from '../components/SplitFigure'
import { actById } from '../content/acts'
import type { Chapter, Treatment } from '../content/types'

interface Props {
  chapter: Chapter
  index: number
}

/**
 * One chapter of the story.
 *
 * The scroll track is a tall section; the panel inside it is `position: sticky`,
 * which is what holds the text still while the 3D layer behind it advances.
 *
 * The panel opens on the chapter's plate — the still drawing of its visual
 * event — so the picture lands before the words that name it.
 *
 * Reading order is an editorial hierarchy, not a data dump: the title says what
 * this is, the kicker frames it, the takeaway is the one thing to walk away
 * with, and the brief explains it. Everything further — deeper detail, the key to
 * the visual — is progressively disclosed, so a phone shows a short, complete
 * chapter and a reader who wants more can open it.
 *
 * A chapter with `moments` is told in steps instead. An opener carries the
 * title; then each defined term gets a viewport-tall moment of its own, timed
 * to the stage showing the thing it names; then the panel summarises, without
 * repeating the header or the definitions already given. The moments are in
 * normal flow before the sticky panel, so the same markup works at every width.
 */

/**
 * Flat stand-ins for the stage, per treatment, for chapters told in moments.
 * Each takes a moment's `id`, or 'all' for the opener.
 */
const momentFigures: Partial<Record<Treatment, (step: string) => ReactNode>> = {
  origin: () => <PrologueFigure highlight="data" />,
  cast: (step) => <RolesFigure highlight={step} />,
  grounds: (step) => <GroundsFigure step={step} />,
  frame: (step) => <PurposeFigure step={step} />,
  unfold: (step) => <NoticeFigure step={step} />,
  affirm: (step) => <ConsentFigure step={step} />,
  split: (step) => <SplitFigure step={step} />,
  ledger: (step) => <RecordFigure step={step} />,
  gate: (step) => <GateFigure step={step} />,
  reverse: (step) => <WithdrawalFigure step={step} />,
  radial: (step) => <RightsFigure step={step} />,
  counterpart: (step) => <DutiesFigure step={step} />,
  threshold: (step) => <ChildrenFigure step={step} />,
  custody: (step) => <ManagerFigure step={step} />,
  assembly: (step) => <AssemblyFigure step={step} />,
}
export function ChapterSection({ chapter, index }: Props) {
  const act = actById.get(chapter.actId)
  const titleId = `${chapter.id}-title`
  const moments = chapter.moments ?? []
  const told = new Set(moments.map((m) => m.term).filter(Boolean))
  const terms = (chapter.terms ?? []).filter((t) => !told.has(t.term))
  const figure = momentFigures[chapter.treatment]

  const eyebrow = (
    <p className="chapter__eyebrow">
      <span className="chapter__label">{chapter.label}</span>
      <span className="chapter__stage">{chapter.stage}</span>
      {act ? (
        <span className="chapter__act">
          <span className="visually-hidden">Act </span>
          {act.numeral}
        </span>
      ) : null}
    </p>
  )
  const header = (
    <>
      <h2 className="chapter__title" id={titleId}>
        {chapter.title}
      </h2>
      <p className="chapter__kicker">{chapter.kicker}</p>
    </>
  )

  return (
    <section
      id={chapter.id}
      className={moments.length ? 'chapter chapter--moments' : 'chapter'}
      data-chapter-index={index}
      data-track={chapter.track}
      data-treatment={chapter.treatment}
      data-act={chapter.actId}
      style={{ '--track': chapter.track } as CSSProperties}
      aria-labelledby={titleId}
    >
      {moments.length ? (
        <div className="chapter__moments">
          <div className="beat moment moment--opener">
            <div className="beat__card">
              {figure?.('all')}
              <div className="beat__words">
                {eyebrow}
                {header}
              </div>
            </div>
          </div>
          {moments.map((moment, i) => {
            const definition = moment.term
              ? chapter.terms?.find((t) => t.term === moment.term)?.definition
              : undefined
            return (
              <div className="beat moment" key={moment.id} data-moment={moment.id}>
                <div className="beat__card">
                  {figure?.(moment.id)}
                  <div className="beat__words">
                    <p className="beat__count">
                      {chapter.label} · {i + 1}
                      <span aria-hidden="true">/</span>
                      <span className="visually-hidden"> of </span>
                      {moments.length}
                    </p>
                    {moment.tag ? <p className="moment__tag">{moment.tag}</p> : null}
                    <h3 className="moment__term">
                      {moment.mark ? <Glyph id={moment.mark} className="moment__glyph" /> : null}
                      {moment.term ?? moment.title}
                    </h3>
                    {definition ? <p className="moment__definition">{definition}</p> : null}
                    <p className="moment__plain">{moment.plain}</p>
                    {moment.action?.kind === 'withdraw' ? <WithdrawControl action={moment.action} /> : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="chapter__sticky">
        <article className="chapter__panel">
          <div className="chapter__plate">
            <Plate treatment={chapter.treatment} />
          </div>

          {eyebrow}
          {moments.length ? null : header}

          <p className="chapter__takeaway">{chapter.takeaway}</p>

          <div className="chapter__brief">
            {chapter.brief.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          {terms.length ? (
            <dl className="chapter__terms">
              {terms.map((term) => (
                <div className="chapter__term" key={term.term}>
                  <dt>{term.term}</dt>
                  <dd>{term.definition}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {chapter.caution ? (
            <aside className="chapter__caution">
              <span className="chapter__caution-label">Worth noting</span>
              <p>{chapter.caution}</p>
            </aside>
          ) : null}

          {chapter.depth ? (
            <details className="chapter__depth">
              <summary>{chapter.depth.summary}</summary>
              <ul>
                {chapter.depth.points.map((point) => (
                  <li key={point.slice(0, 40)}>{point}</li>
                ))}
              </ul>
            </details>
          ) : null}

          <figure className="chapter__visual">
            <figcaption>
              <span className="chapter__fig">Fig. {chapter.label}</span>
              What you are looking at
            </figcaption>
            {moments.length ? null : <p className="chapter__visual-event">{chapter.visual.event}</p>}
            <details className="chapter__key">
              <summary>{moments.length ? 'What the picture showed' : 'Key to the visual'}</summary>
              {moments.length ? <p className="chapter__visual-event">{chapter.visual.event}</p> : null}
              <dl>
                {chapter.visual.elements.map((element) => (
                  <div key={element.name}>
                    <dt>{element.name}</dt>
                    <dd>{element.meaning}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </figure>

          {chapter.next ? (
            <aside className="chapter__next" aria-label="The next question">
              <span className="chapter__next-label">Which leaves one question</span>
              <p className="chapter__next-question">{chapter.next}</p>
            </aside>
          ) : null}
        </article>
      </div>
    </section>
  )
}
