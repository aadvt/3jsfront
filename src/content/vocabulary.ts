import type { Mark } from './types'

/**
 * The key to the shapes. Every illustration on the site — the 3D stage and the
 * static plates alike — is built from these and nothing else, so a reader who
 * learns them once can read every chapter.
 *
 * `standsFor` describes this site's illustration, in the same register as a
 * chapter's `visual` field. The definitions it echoes come from the chapter
 * `terms`, which carry the source attribution.
 */
export const vocabulary: Mark[] = [
  {
    id: 'principal',
    name: 'You',
    standsFor: 'The person the data is about — the Data Principal.',
  },
  {
    id: 'data',
    name: 'Your data',
    standsFor: 'One piece of your personal data. The only thing you follow.',
  },
  {
    id: 'fiduciary',
    name: 'Fiduciary',
    standsFor: 'The organisation that decides why and how your data is processed.',
  },
  {
    id: 'processor',
    name: 'Processor',
    standsFor: 'A vendor that processes on the fiduciary’s behalf.',
  },
  {
    id: 'purpose',
    name: 'Purpose',
    standsFor: 'The stated reason. Its edges are the limit of what may happen.',
  },
  {
    id: 'consent',
    name: 'Consent',
    standsFor: 'The same data, changed in place once you agree.',
  },
  {
    id: 'record',
    name: 'Record',
    standsFor: 'Evidence of the choice, kept after the moment has passed.',
  },
  {
    id: 'right',
    name: 'Right',
    standsFor: 'A line from you to a place your data reached.',
  },
]
