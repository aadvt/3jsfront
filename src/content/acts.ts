import type { Act } from './types'

/**
 * Seven acts over fifteen chapters. The acts exist for the reader, not the
 * lawyer: they answer "where am I and why are we here" at a glance, and they let
 * the rail show hierarchy instead of a flat list of fifteen.
 */
export const acts: Act[] = [
  {
    id: 'subject',
    numeral: 'I',
    title: 'What is in play',
    premise: 'One piece of personal data, and the three roles arranged around it.',
  },
  {
    id: 'basis',
    numeral: 'II',
    title: 'Why anything may happen at all',
    premise: 'Before consent there is a lawful ground, and before processing there is a purpose.',
  },
  {
    id: 'choice',
    numeral: 'III',
    title: 'The moment of choice',
    premise: 'What you are told, what counts as agreement, and why one switch is not enough.',
  },
  {
    id: 'consequence',
    numeral: 'IV',
    title: 'What the choice does',
    premise: 'A decision is only real if it is recorded, obeyed, and reversible.',
  },
  {
    id: 'obligation',
    numeral: 'V',
    title: 'Who owes what',
    premise: 'The same relationships, read first as your rights and then as their duties.',
  },
  {
    id: 'stricter',
    numeral: 'VI',
    title: 'Where the rules tighten',
    premise: 'Two places the ordinary answer is not the answer.',
  },
  {
    id: 'whole',
    numeral: 'VII',
    title: 'The whole system',
    premise: 'Everything you walked through, and the honest limits of it.',
  },
]

export const actById = new Map(acts.map((act) => [act.id, act]))
