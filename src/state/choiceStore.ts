/**
 * The visitor's own choices — so far, one: withdrawing consent in chapter 10.
 *
 * Kept apart from the scroll store because it is not a function of scroll
 * position: it is something the visitor did. It is discrete, so React can
 * render the control's pressed state, and the stage reads `withdrawnAt`
 * directly each frame to play out what follows.
 */
type Listener = () => void

let withdrawnAt: number | null = null
const listeners = new Set<Listener>()

export const choiceStore = {
  /** `performance.now()` at the moment of withdrawal, or null. */
  get withdrawnAt() {
    return withdrawnAt
  },

  withdraw() {
    if (withdrawnAt !== null) return
    withdrawnAt = performance.now()
    for (const listener of listeners) listener()
  },

  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  isWithdrawn() {
    return withdrawnAt !== null
  },
}
