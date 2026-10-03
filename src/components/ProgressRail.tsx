import { acts } from '../content/acts'
import { chapters, chaptersByAct } from '../content/chapters'
import { useActiveChapter, useInPrologue } from '../hooks/useActiveChapter'

/**
 * Where you are in the story, grouped by act so fifteen entries read as a
 * structure rather than a list. Real anchor links, so it works as navigation with
 * a keyboard and with a screen reader.
 */
export function ProgressRail() {
  const activeIndex = useActiveChapter()
  // Before chapter 01 no chapter is current.
  const activeId = useInPrologue() ? undefined : chapters[activeIndex]?.id

  return (
    <nav className="rail" aria-label="Story chapters">
      <ol className="rail__acts">
        {acts.map((act) => {
          const actChapters = chaptersByAct[act.id] ?? []
          const containsActive = actChapters.some((c) => c.id === activeId)

          return (
            <li className="rail__act" key={act.id} data-current={containsActive || undefined}>
              <p className="rail__act-title">
                <span className="rail__act-numeral">{act.numeral}</span>
                <span>{act.title}</span>
              </p>
              <ol className="rail__list">
                {actChapters.map((chapter) => {
                  const isActive = chapter.id === activeId
                  return (
                    <li key={chapter.id}>
                      <a
                        className="rail__link"
                        href={`#${chapter.id}`}
                        aria-current={isActive ? 'step' : undefined}
                        data-active={isActive || undefined}
                      >
                        <span className="rail__label">{chapter.label}</span>
                        <span className="rail__stage">{chapter.stage}</span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
