import type { Beat } from './types'

/**
 * The opening sequence. Three beats, top to bottom, in the order the picture
 * is built: a person, something about them, and the system it is going into.
 *
 * Nothing here states a rule. Each line paraphrases framing the chapters make
 * properly later — chapter 01 for personal data, chapter 02 for the roles.
 */
export const beats: Beat[] = [
  {
    id: 'you',
    title: 'You',
    text: 'Every story about data protection starts with a person. In this one, the person is you.',
  },
  {
    id: 'data',
    title: 'Your personal data',
    text: 'This is one piece of information about you. It is ordinary — and it points back at you. The thread is that link, and it goes wherever the data goes.',
  },
  {
    id: 'system',
    title: 'The system',
    text: 'Below is where it is headed: an organisation that decides what happens to it, and a vendor that does some of the work. The rest of this page follows it through.',
  },
]
