import { useEffect } from 'react'
import { storyStore } from '../state/storyStore'
import { clamp01 } from '../utils/math'

interface Track {
  index: number
  top: number
  height: number
  /** The chapter's declared track length, in viewports. */
  track: number
}

/**
 * The single source of scroll truth.
 *
 * Measures every `[data-chapter-index]` scroll track once per layout change and
 * then reads only `window.scrollY` per frame, so no layout is forced during
 * scrolling. Updates are coalesced into one rAF tick.
 */
export function useScrollDriver(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    let tracks: Track[] = []
    /** Document y at which the prologue has fully scrolled past. */
    let prologueEnd = 0
    let raf = 0
    let dirty = true

    const measure = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-chapter-index]')
      const scrollY = window.scrollY
      tracks = Array.from(nodes, (node) => {
        const rect = node.getBoundingClientRect()
        return {
          index: Number(node.dataset.chapterIndex),
          top: rect.top + scrollY,
          height: rect.height,
          track: Number(node.dataset.track) || 0,
        }
      }).sort((a, b) => a.top - b.top)
      const prologue = document.querySelector<HTMLElement>('[data-prologue]')
      prologueEnd = prologue ? prologue.getBoundingClientRect().bottom + scrollY : 0
      dirty = false
    }

    const update = () => {
      raf = 0
      if (dirty) measure()
      if (tracks.length === 0) return

      const scrollY = window.scrollY
      const viewportH = window.innerHeight
      const focus = scrollY + viewportH * 0.5

      const docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - viewportH,
      )
      const documentProgress = clamp01(scrollY / docHeight)

      let active = tracks[0]
      for (const track of tracks) {
        if (track.top <= focus) active = track
        else break
      }

      // Progress is measured against the chapter's declared track, not its
      // rendered height: (track − 1) viewports of scroll take it from 0 to 1.
      // Where the two agree (a pinned panel) nothing changes; where a phone
      // lets a chapter be only as tall as its content, the stage stays in step
      // with the words — step k is still in view at k viewports.
      const declared = active.track > 1 ? (active.track - 1) * viewportH : active.height - viewportH
      const trackLength = Math.max(1, declared)
      const chapterProgress = clamp01((scrollY - active.top) / trackLength)

      // The prologue runs from the top of the page until its last beat has
      // scrolled fully into view.
      const prologueProgress = clamp01(scrollY / Math.max(1, prologueEnd - viewportH))

      storyStore.setActiveIndex(active.index)
      storyStore.setProgress(chapterProgress, documentProgress, prologueProgress)
    }

    const schedule = () => {
      if (raf === 0) raf = requestAnimationFrame(update)
    }

    const invalidate = () => {
      dirty = true
      schedule()
    }

    const onPointer = (event: PointerEvent) => {
      storyStore.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      )
    }

    measure()
    schedule()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', invalidate)
    window.addEventListener('orientationchange', invalidate)
    window.addEventListener('pointermove', onPointer, { passive: true })

    const observer = new ResizeObserver(invalidate)
    observer.observe(document.documentElement)

    return () => {
      if (raf !== 0) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', invalidate)
      window.removeEventListener('orientationchange', invalidate)
      window.removeEventListener('pointermove', onPointer)
      observer.disconnect()
    }
  }, [enabled])
}
