import { AnimatePresence, motion } from 'motion/react'
import { stations } from '../content/stations'
import { scrollToStation } from '../hooks/useJourneyScroll'
import { useChoices } from '../state/journey'
import { Glyph } from './Glyph'

export function SiteHeader() {
  const active = useChoices((s) => s.active)
  const station = active >= 0 ? stations[active] : null
  return (
    <header className="site-header">
      <a
        className="site-header__mark"
        href="#top"
        onClick={(e) => {
          e.preventDefault()
          scrollToStation(-1)
        }}
      >
        {/* The site's mark is the data mark: the one thing you follow. */}
        <Glyph id="data" className="site-header__glyph" />
        <span className="site-header__text">
          <span className="site-header__title">Follow Your Data</span>
          <span className="site-header__sub">India&rsquo;s DPDP Act</span>
        </span>
      </a>
      <div className="site-header__now" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {station ? (
            <motion.span
              key={station.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <span className="site-header__num">{station.number}</span> {station.label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <span className="site-header__progress" aria-hidden="true">
        <span data-progress />
      </span>
    </header>
  )
}
