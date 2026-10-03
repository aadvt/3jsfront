import { Glyph } from './Glyph'

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__mark" href="#top">
        {/* The site's mark is the data mark: the one thing you follow. */}
        <Glyph id="data" className="site-header__glyph" />
        <span className="site-header__text">
          <span className="site-header__title">Follow Your Data</span>
          <span className="site-header__sub">India&rsquo;s DPDP Act, step by step</span>
        </span>
      </a>
    </header>
  )
}
