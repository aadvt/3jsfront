/**
 * A tiny mutable store that bridges native scrolling and the persistent 3D stage.
 *
 * Scroll updates land on `frame`, a plain mutable object read inside
 * requestAnimationFrame / useFrame. React is only notified when a *discrete*
 * value changes (which chapter is active), so scrolling never triggers a render.
 */

export interface StoryFrame {
  /** Index of the chapter currently holding the viewport. */
  activeIndex: number
  /** 0 → 1 progress through the active chapter's scroll track. */
  chapterProgress: number
  /** 0 → 1 progress through the whole document. */
  documentProgress: number
  /** 0 → 1 progress through the prologue: the hero and the opening beats. */
  prologueProgress: number
  /**
   * Continuous position along the story. Chapters occupy 0 → chapterCount:
   * activeIndex + chapterProgress. The prologue occupies −1 → 0, so the stage
   * can tell the opening without a second timeline.
   */
  storyPosition: number
  /** Pointer position in normalised device coordinates, -1 → 1. */
  pointerX: number
  pointerY: number
  /** True once the user has begun scrolling at all. */
  engaged: boolean
}

type DiscreteListener = (activeIndex: number) => void

const frame: StoryFrame = {
  activeIndex: 0,
  chapterProgress: 0,
  documentProgress: 0,
  prologueProgress: 0,
  storyPosition: -1,
  pointerX: 0,
  pointerY: 0,
  engaged: false,
}

const listeners = new Set<DiscreteListener>()
/**
 * Woken whenever the story position or the pointer actually changes. The
 * stage renders on demand, so this is what tells it a new frame is needed —
 * and silence is what lets it sleep.
 */
const wakers = new Set<() => void>()
const wake = () => {
  for (const waker of wakers) waker()
}

export const storyStore = {
  frame,

  subscribe(listener: DiscreteListener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getActiveIndex() {
    return frame.activeIndex
  },

  /** True until the first chapter begins: the hero and the prologue. */
  inPrologue() {
    return frame.storyPosition < 0
  },

  onChange(waker: () => void) {
    wakers.add(waker)
    return () => {
      wakers.delete(waker)
    }
  },

  setActiveIndex(next: number) {
    if (next === frame.activeIndex) return
    frame.activeIndex = next
    for (const listener of listeners) listener(next)
  },

  setProgress(chapterProgress: number, documentProgress: number, prologueProgress: number) {
    const before = frame.storyPosition
    frame.chapterProgress = chapterProgress
    frame.documentProgress = documentProgress
    frame.prologueProgress = prologueProgress
    // Until the first chapter's track starts, the story is still in its
    // prologue; after that, the prologue is complete and stays at 0.
    frame.storyPosition =
      frame.activeIndex === 0 && chapterProgress === 0
        ? prologueProgress - 1
        : frame.activeIndex + chapterProgress
    // Crossing into or out of the prologue is a discrete change React shows
    // (the counter and the rail have no chapter to mark before chapter 01).
    if (before < 0 !== frame.storyPosition < 0) {
      for (const listener of listeners) listener(frame.activeIndex)
    }
    // Scrolling through sections where the story does not move (the legend,
    // the closing sections) wakes nothing.
    if (Math.abs(frame.storyPosition - before) > 1e-5) wake()
    if (!frame.engaged && documentProgress > 0.002) frame.engaged = true
  },

  setPointer(x: number, y: number) {
    frame.pointerX = x
    frame.pointerY = y
    wake()
  },
}
