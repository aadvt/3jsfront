import { useEffect } from 'react'
import { CanvasNotice } from './components/CanvasNotice'
import { DetailSheet } from './components/DetailSheet'
import { SiteHeader } from './components/SiteHeader'
import { StationNav } from './components/StationNav'
import { stations } from './content/stations'
import { useJourneyScroll } from './hooks/useJourneyScroll'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import { Colophon } from './sections/Colophon'
import { Hero } from './sections/Hero'
import { StationSection } from './sections/StationSection'
import { LazyStage } from './three/LazyStage'

export default function App() {
  const webgl = useWebGLSupport()
  useJourneyScroll()

  // Exposed to CSS so the flat figures stand in exactly when the stage cannot.
  useEffect(() => {
    document.documentElement.dataset.stage = webgl
  }, [webgl])

  return (
    <>
      <a className="skip-link" href="#people">
        Skip to the guide
      </a>

      {webgl === 'available' ? <LazyStage /> : null}
      {/* The part of the screen the stage frames its subject in. CSS places it
          per layout; the camera fits each model to it. */}
      <div className="stage-window" aria-hidden="true" />

      <SiteHeader />
      <StationNav />

      <main id="story">
        <Hero />
        {webgl === 'unavailable' ? <CanvasNotice /> : null}
        {stations.map((station, index) => (
          <StationSection key={station.id} station={station} index={index} />
        ))}
      </main>

      <Colophon />
      <DetailSheet />
    </>
  )
}
