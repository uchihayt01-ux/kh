import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '../config.js';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${site.name} home`}>
      <span className="logo__mark" aria-hidden="true" />
      {site.name}
    </Link>
  );
}

const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#faq', label: 'FAQ' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname, hash]);

  return (
    <header className={`nav ${scrolled || open ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="container nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Main">
          {links.map((l) =>
            l.to.includes('#') ? (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ) : (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ),
          )}
          <Link to={site.bookingUrl} className="btn btn--sm">
            Book a call <span className="arrow">→</span>
          </Link>
        </nav>
        <button
          className="nav__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
