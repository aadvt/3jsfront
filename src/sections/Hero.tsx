import { PrologueFigure } from '../components/PrologueFigure'

/**
 * The title screen. On a phone the upper part of the screen is deliberately
 * left to the stage, where you and your data are already waiting; the words
 * sit beneath them.
 */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__inner">
        <PrologueFigure highlight="all" />
        <p className="hero__eyebrow">
          <span>Digital Personal Data Protection Act</span>
          <span className="hero__year">2023</span>
        </p>
        <h1 className="hero__title" id="hero-title">
          Follow <span className="hero__title-em">your&nbsp;data</span>
        </h1>
        <p className="hero__lead">
          India&rsquo;s data protection law, explained by following one piece of
          personal data from the moment it leaves a person to the moment they ask
          for it back.
        </p>
        <p className="hero__disclaimer">An explainer, not legal advice.</p>
        <p className="hero__hint">
          <span className="hero__hint-line" aria-hidden="true" />
          Scroll to begin
        </p>
      </div>
    </section>
  )
}
