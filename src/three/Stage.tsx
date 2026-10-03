import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { StoryScene } from './StoryScene'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { storyStore } from '../state/storyStore'
import { markStageLost } from './stageStatus'

/**
 * How much resolution the stage can afford, decided once from what the device
 * says about itself. A phone's reported ratio is often 3; an abstract,
 * low-contrast scene gains nothing from it. A device that reports little
 * memory or few cores starts lower still. `Director` can step down further if
 * frames run slow.
 */
function resolution(): { dpr: [number, number]; frugal: boolean } {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const nav = navigator as Navigator & { deviceMemory?: number }
  const frugal = (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || navigator.hardwareConcurrency <= 4
  if (coarse) return { dpr: [1, frugal ? 1.25 : 1.5], frugal }
  return { dpr: [1, 2], frugal }
}

/**
 * The scene renders on demand: a frame is drawn only when something has
 * changed. This wakes it when the story position or the pointer moves; the
 * director keeps it awake while anything is still settling, and lets it sleep
 * otherwise. A phone resting on a chapter renders nothing.
 */
function Waker() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => storyStore.onChange(() => invalidate()), [invalidate])
  return null
}

/**
 * The one and only canvas. It is mounted once for the lifetime of the page and
 * sits behind the document as a decorative-by-ARIA, meaningful-by-design layer:
 * every claim it illustrates is also written in the HTML beside it.
 */
export function Stage() {
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const { dpr, frugal } = useMemo(() => resolution(), [])

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (lost) return null

  return (
    // Faded in once the first frame exists, so the stage arrives rather than
    // pops in after the lazy chunk loads.
    <div className="stage" aria-hidden="true" data-ready={ready || undefined}>
      <Canvas
        // Colours come from the CSS tokens and must render as those colours:
        // no tone mapping, which would darken and desaturate them.
        flat
        onCreated={({ gl }) => {
          // Development only: expose the renderer so the mobile audit can read draw calls.
          if (import.meta.env.DEV) (window as unknown as { __gl: unknown }).__gl = gl
          // If the browser takes the GPU context away mid-story (memory
          // pressure, a backgrounded tab on a phone), the flat figures take
          // over where the reader is, rather than leaving an empty stage.
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            markStageLost()
            setLost(true)
          })
          requestAnimationFrame(() => {
            setReady(true)
            // The hero's flat picture holds the place until now (see CSS).
            document.documentElement.dataset.stageReady = ''
          })
        }}
        frameloop={visible ? 'demand' : 'never'}
        dpr={dpr}
        gl={{
          // Multisampling only where there is fill-rate to spare.
          antialias: dpr[1] > 1.5,
          alpha: true,
          powerPreference: frugal ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 38, near: 0.1, far: 120, position: [0, -0.75, 4.6] }}
      >
        <Waker />
        <Suspense fallback={null}>
          <StoryScene reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  )
}
