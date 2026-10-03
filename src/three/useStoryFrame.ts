import { useFrame } from '@react-three/fiber'
import { storyStore, type StoryFrame } from '../state/storyStore'

/**
 * Per-frame access to scroll state without any React render.
 * `dt` is clamped by callers via `damp` so a backgrounded tab cannot jump.
 */
export function useStoryFrame(
  callback: (frame: StoryFrame, dt: number, elapsed: number) => void,
) {
  useFrame((state, dt) => {
    callback(storyStore.frame, dt, state.clock.elapsedTime)
  })
}
