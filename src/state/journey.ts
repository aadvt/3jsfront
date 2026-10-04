import { create } from 'zustand'
import { stations, type StationId } from '../content/stations'

/**
 * Two kinds of state, kept apart on purpose.
 *
 * `journey` is continuous: where the reader is along the scroll, the pointer,
 * the rectangle the stage frames its subject in. It is a plain mutable object
 * written by the scroll driver and read inside `useFrame`, so scrolling never
 * re-renders React.
 *
 * `useChoices` is discrete: what the reader picked in each station's control
 * (or by clicking the model). React renders the card from it and the stage
 * reacts to it, so the HTML and the 3D can never disagree.
 */

export interface JourneyFrame {
  /**
   * Continuous position. −1 is the overview above the hero, 0…7 are the
   * stations. Between two stations the value travels only during the second
   * part of the scroll, so each station holds still while its card is read.
   */
  position: number
  /** 0 → 1 through the whole document. */
  progress: number
  /** Pointer in normalised device coordinates, −1 → 1. Mouse only. */
  pointerX: number
  pointerY: number
  /** Where the subject is framed, in CSS pixels of the viewport. */
  window: { x: number; y: number; width: number; height: number }
  /** Viewport size the window was measured against. */
  viewport: { width: number; height: number }
}

export const journey: JourneyFrame = {
  position: -1,
  progress: 0,
  pointerX: 0,
  pointerY: 0,
  window: { x: 0, y: 0, width: 1, height: 1 },
  viewport: { width: 1, height: 1 },
}

const wakers = new Set<() => void>()

/** The stage subscribes so an on-demand render loop knows when to draw. */
export function onJourneyChange(waker: () => void) {
  wakers.add(waker)
  return () => {
    wakers.delete(waker)
  }
}

export function wakeJourney() {
  for (const waker of wakers) waker()
}

type Selection = Record<StationId, string | null>

interface Choices {
  /** The station holding the viewport, −1 during the overview. */
  active: number
  selection: Selection
  /** Purpose toggles in station 04. Necessary cannot be switched off. */
  purposes: Record<string, boolean>
  /** Bumped on every choice, so the stage can replay an animation. */
  pulse: Record<StationId, number>
  /** The part of a model under the pointer, for its label. */
  hover: { station: StationId; part: string } | null
  /** Which station's detail sheet is open. */
  details: StationId | null
  setActive: (index: number) => void
  choose: (station: StationId, option: string) => void
  togglePurpose: (id: string) => void
  setHover: (hover: Choices['hover']) => void
  openDetails: (station: StationId | null) => void
}

const initialSelection: Selection = {
  people: 'principal',
  reason: 'consent',
  consent: null,
  purposes: null,
  withdrawal: 'given',
  rights: 'rights',
  stricter: 'children',
  system: 'notice',
}

function togglePurposes(state: Choices, id: string): Partial<Choices> {
  if (id === 'necessary') return {}
  return {
    purposes: { ...state.purposes, [id]: !state.purposes[id] },
    pulse: { ...state.pulse, purposes: state.pulse.purposes + 1 },
  }
}

const zeroPulse = Object.fromEntries(stations.map((s) => [s.id, 0])) as Record<StationId, number>

export const useChoices = create<Choices>((set) => ({
  active: -1,
  selection: initialSelection,
  // As in the source's illustration: analytics allowed, advertising declined.
  purposes: { necessary: true, analytics: true, advertising: false },
  pulse: zeroPulse,
  hover: null,
  details: null,
  setActive: (active) => set({ active }),
  // In station 04 a choice is a toggle: each purpose is answered on its own.
  choose: (station, option) =>
    set((state) => station === 'purposes' ? togglePurposes(state, option) : ({
      selection: { ...state.selection, [station]: option },
      pulse: { ...state.pulse, [station]: state.pulse[station] + 1 },
    })),
  togglePurpose: (id) => set((state) => togglePurposes(state, id)),
  setHover: (hover) => set({ hover }),
  openDetails: (details) => set({ details }),
}))

// Every discrete change may need a frame from an on-demand stage.
useChoices.subscribe(wakeJourney)

/**
 * The state of your data as the story has left it: consented once a clear
 * yes has passed the checks (or the reader has moved past station 03 without
 * trying), drained once withdrawn.
 */
export function dataState(state: Choices, position: number): 'raw' | 'consented' | 'withdrawn' {
  if (state.selection.withdrawal === 'withdrawn' && position > 3.5) return 'withdrawn'
  const tried = state.selection.consent
  if (tried === 'given') return 'consented'
  if (tried === null && position > 2.55) return 'consented'
  return 'raw'
}
