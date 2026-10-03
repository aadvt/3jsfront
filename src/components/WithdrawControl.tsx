import { useSyncExternalStore } from 'react'
import type { MomentAction } from '../content/types'
import { choiceStore } from '../state/choiceStore'

/**
 * The one real control in the story: withdrawing consent, in chapter 10.
 *
 * It is optional by design. Pressing it plays out what withdrawal changes on
 * the stage; scrolling on without pressing it plays out the same thing. The
 * story never waits on it — but a reader who presses it feels how little it
 * takes, which is the point.
 */
export function WithdrawControl({ action }: { action: MomentAction }) {
  const withdrawn = useSyncExternalStore(choiceStore.subscribe, choiceStore.isWithdrawn, () => false)

  return (
    <div className="action">
      <button
        type="button"
        className="action__button"
        onClick={() => choiceStore.withdraw()}
        disabled={withdrawn}
        aria-describedby="withdraw-status"
      >
        {withdrawn ? action.doneLabel : action.label}
      </button>
      <p className="action__hint" id="withdraw-status" role="status">
        {withdrawn ? action.doneHint : action.hint}
      </p>
    </div>
  )
}
