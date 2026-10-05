import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import { faqs, site } from '../config.js';

export const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

export function SectionHead({ eyebrow, title, children, action }) {
  return (
    <Reveal className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="h2">{title}</h2>
        {children && <p className="lead" style={{ marginTop: 20 }}>{children}</p>}
      </div>
      {action}
    </Reveal>
  );
}

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container faq">
        <Reveal>
          <div className="eyebrow">FAQ</div>
          <h2 className="h2">
            Questions, <span className="serif">answered.</span>
          </h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Can’t find what you’re looking for? <a className="link" href={`mailto:${site.email}`}>Email us</a>
          </p>
        </Reveal>
        <Reveal className="faq__list" delay={100}>
          {faqs.map((f, i) => (
            <div key={f.q} className={`faq__item ${open === i ? 'open' : ''}`}>
              <button className="faq__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}
                <span className="faq__icon" aria-hidden="true" />
              </button>
              <div className="faq__a">
                <div>
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="section--tight">
      <div className="container">
        <Reveal className="cta">
          <div className="eyebrow" style={{ color: '#a3a3a3' }}>Let’s work together</div>
          <h2>
            Have a story to <span className="serif">tell?</span>
          </h2>
          <p>Tell us about your product, event or footage. We’ll reply within one working day with ideas and a quote.</p>
          <Link to={site.bookingUrl} className="btn btn--light">
            Book a free call <span className="arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
