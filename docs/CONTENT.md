# Content rules

This project explains a law. The cost of a confident, wrong sentence is high, so
content has its own rules, and they are stricter than the rest of the codebase.

## The canonical source

The supplied **ConsentGuru DPDP page** is the canonical source for:

- information architecture
- terminology
- every claim made about the Act

Preserve its distinctions and its framing. If it draws a line between two terms,
this site draws the same line with the same words.

## What must never be invented

Do not write — and do not infer, extrapolate, summarise into existence, or fill in
from general knowledge — any of the following unless it is supported by the
canonical source:

- legal requirements or obligations
- interpretations of the Act
- penalties, fines, or consequences
- compliance claims or checklists
- regulatory conclusions
- timelines, thresholds, or numbers

**If the source does not cover it, leave the field empty.** An empty `body` array
renders nothing and is a correct, honest state. A plausible-sounding paragraph is
a defect even if it is probably true.

## Current status

All fifteen chapters are written from the canonical source. Each carries a `source`
field naming the part of that page it derives from -- keep it accurate when editing,
because it is the only way a reviewer can check a claim without rereading
everything.

Nothing in `brief`, `takeaway`, `depth`, `terms` or `caution` goes beyond the
source. Where the source declines to be precise -- exemptions, territorial scope,
commencement dates -- this site declines too, and says so.

## What the foundation *does* say, and why that is safe

Three kinds of field carry text that is not a claim about the Act:

- **`stage` / `title` / `kicker`** -- plain-language framing of what the chapter is
  about ("The moment of choice", "Two paths, both real"). These name the subject;
  they do not state a rule.
- **`visual`** -- a description of what *this website's 3D stage does* in that
  chapter ("The single route separates into several"). This is a statement about our
  own illustration, never about the Act, and it is rendered under the heading "What
  you are looking at" so the distinction is visible to the reader.
- **Act titles and premises** -- narrative scaffolding for the reader.

Keep that separation when editing. The moment a `visual` string starts describing a
legal consequence rather than a shape on screen, it belongs in `brief` and needs a
source.

## Moments and the next question

- **`moments[].plain`** is held to the same rule as `brief`: it paraphrases the
  source or repeats it, and adds nothing. Chapters told in moments move their
  brief into the moments and leave `brief` empty rather than say it twice.
- **`moments[].title`** is framing, like a chapter title ("Holding it is not a
  reason"). It must not state a rule the `plain` line does not source.
- **`next`** is a question the chapter leaves the reader with. It is always a
  question, never an answer; the chapters that follow carry the answer.

## Wording supplied outside the repo

Chapter 08 mentions that a record, in practice, carries an identifier and the
locale the notice was shown in. That detail was supplied by the project owner as
part of the canonical source; it is not in the repo's own source text. It is
worded as operational practice, not as a requirement of the Act. Check it
against the source before treating it as settled.

## Tone

- Write for someone who has never read the Act and did not come here for law.
- Short sentences. Concrete nouns. Second person where it fits the story.
- Define a term the first time it appears.
- No legalese quoted without being explained in plain language straight after.
- The site states plainly that it is not legal advice (see `Colophon`). Do not
  write copy that would make that disclaimer false.
