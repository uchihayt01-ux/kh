import { Link } from 'react-router-dom';
import { site, categories } from '../config.js';
import { Logo } from './Nav.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Motion graphics and video editing for brands that want to be understood — and remembered.</p>
          </div>
          <div>
            <h4>Work</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/work?category=${c.id}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Studio</h4>
            <ul>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Follow</h4>
            <ul>
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span>{site.location}</span>
        </div>
        <div className="footer__big" aria-hidden="true">{site.name.toLowerCase()}</div>
      </div>
    </footer>
  );
}
