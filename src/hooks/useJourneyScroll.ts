import { useEffect } from 'react'
import Lenis from 'lenis'
import { journey, useChoices, wakeJourney } from '../state/journey'
import { clamp01 } from '../utils/math'

/**
 * When the camera travels between two stations, as a share of the scroll from
 * one station's top to the next. Before `HOLD` the station holds still for
 * reading; by `ARRIVE` the next one is framed.
 */
const HOLD = 0.32
const ARRIVE = 0.9

let lenis: Lenis | null = null

/** Scrolls to a station (or −1 for the top), smoothly unless motion is reduced. */
export function scrollToStation(index: number) {
  const target = index < 0 ? document.getElementById('top') : document.querySelectorAll<HTMLElement>('[data-station]')[index]
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis && !reduced) lenis.scrollTo(target, { duration: 1.4 })
  else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
}

/** While a modal is open the page behind it holds still. */
export function pauseScroll(paused: boolean) {
  if (paused) lenis?.stop()
  else lenis?.start()
}

/**
 * Native scrolling → the stage's position. Section tops are measured only
 * when layout changes; each scroll event does a short search and a few
 * arithmetic operations, and React hears only when the active station changes.
 *
 * On a desktop with a mouse, Lenis smooths the wheel. It moves the real
 * document scroll, so keyboard, scrollbar, find-in-page and anchors still
 * work; it is off for touch and for reduced motion.
 */
export function useJourneyScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (finePointer && !reduced) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 0.9 })
    }

    const meter = document.querySelector<HTMLElement>('[data-progress]')
    const frame = document.querySelector<HTMLElement>('.stage-window')
    let anchors: number[] = []
    let raf = 0

    const measure = () => {
      const hero = document.getElementById('top')
      const sections = document.querySelectorAll<HTMLElement>('[data-station]')
      anchors = [hero, ...Array.from(sections)].map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : 0))
      if (frame) {
        const r = frame.getBoundingClientRect()
        journey.window = { x: r.left, y: r.top, width: Math.max(1, r.width), height: Math.max(1, r.height) }
      }
      journey.viewport = { width: window.innerWidth, height: window.innerHeight }
      update()
    }

    const update = () => {
      raf = 0
      const y = window.scrollY
      let k = 0
      while (k < anchors.length - 1 && y >= anchors[k + 1]) k++
      let position = k - 1
      if (k < anchors.length - 1) {
        const f = (y - anchors[k]) / Math.max(1, anchors[k + 1] - anchors[k])
        const t = clamp01((f - HOLD) / (ARRIVE - HOLD))
        position += t * t * (3 - 2 * t)
      }
      journey.position = position
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      journey.progress = clamp01(y / total)
      if (meter) meter.style.transform = `scaleX(${journey.progress})`

      const active = Math.round(position)
      if (active !== useChoices.getState().active) useChoices.getState().setActive(active)
      wakeJourney()
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      journey.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      journey.pointerY = 1 - (event.clientY / window.innerHeight) * 2
      wakeJourney()
    }

    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', onPointer, { passive: true })
    measure()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onPointer)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
