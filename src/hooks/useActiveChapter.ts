import { useSyncExternalStore } from 'react'
import { storyStore } from '../state/storyStore'

/** Re-renders only when the active chapter changes, never while scrolling. */
export function useActiveChapter(): number {
  return useSyncExternalStore(
    storyStore.subscribe,
    storyStore.getActiveIndex,
    () => 0,
  )
}

/** True while the reader is still before chapter 01. Discrete, like the above. */
export function useInPrologue(): boolean {
  return useSyncExternalStore(storyStore.subscribe, storyStore.inPrologue, () => true)
}
