import { Fragment, useEffect } from 'react'
import { CanvasNotice } from './components/CanvasNotice'
import { ProgressRail } from './components/ProgressRail'
import { SiteHeader } from './components/SiteHeader'
import { StageCounter } from './components/StageCounter'
import { acts } from './content/acts'
import { chapters } from './content/chapters'
import { ActBreak } from './sections/ActBreak'
import { ChapterSection } from './sections/ChapterSection'
import { Colophon } from './sections/Colophon'
import { Hero } from './sections/Hero'
import { Legend } from './sections/Legend'
import { Prologue } from './sections/Prologue'
import { StoryIndex } from './sections/StoryIndex'
import { useScrollDriver } from './hooks/useScrollDriver'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import { LazyStage } from './three/LazyStage'

/** Act breaks are interleaved before the first chapter of each act. */
const actOpeners = new Map(
  acts.map((act) => [chapters.find((c) => c.actId === act.id)?.id, act]),
)

export default function App() {
  const webgl = useWebGLSupport()
  useScrollDriver()

  // Exposed to CSS so the flat figures can stand in for the stage exactly
  // when the stage cannot exist.
  useEffect(() => {
    document.documentElement.dataset.stage = webgl
  }, [webgl])

  return (
    <>
      <a className="skip-link" href="#story">
        Skip to the story
      </a>

      {webgl === 'available' ? <LazyStage /> : null}

      <SiteHeader />
      <ProgressRail />
      <StageCounter />

      <main id="story">
        <Hero />
        {webgl === 'unavailable' ? <CanvasNotice /> : null}
        <Prologue />
        <Legend />

        {chapters.map((chapter, index) => {
          const opening = actOpeners.get(chapter.id)
          return (
            <Fragment key={chapter.id}>
              {opening ? <ActBreak act={opening} /> : null}
              <ChapterSection chapter={chapter} index={index} />
            </Fragment>
          )
        })}

        <StoryIndex />
      </main>

      <Colophon />
    </>
  )
}
