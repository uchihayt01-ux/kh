import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { services, site } from '../config.js';
import Reveal from '../components/Reveal.jsx';

const budgets = ['< £2k', '£2k – £5k', '£5k – £10k', '£10k+'];

export default function Contact() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState({ state: 'idle' });

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: 'sending' });
    try {
      await api.contact(data);
      form.reset();
      setStatus({ state: 'sent' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  return (
    <section className="page-head" style={{ paddingBottom: 'clamp(72px, 11vw, 140px)' }}>
      <div className="container contact">
        <Reveal className="contact__aside">
          <div className="eyebrow">Contact</div>
          <h1>
            Let’s <span className="serif">talk.</span>
          </h1>
          <p className="lead">Tell us a little about your project and we’ll get back to you within one working day.</p>
          <dl>
            <div>
              <dt>Email</dt>
              <dd><a className="link" href={`mailto:${site.email}`}>{site.email}</a></dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>{site.location}</dd>
            </div>
            <div>
              <dt>Social</dt>
              <dd style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={100}>
          {status.state === 'sent' ? (
            <div className="empty" style={{ color: 'var(--ink)' }}>
              <h2 style={{ fontSize: 32, marginBottom: 12 }}>Thank you!</h2>
              <p style={{ color: 'var(--muted)' }}>Your message is in. We’ll be in touch very soon.</p>
              <button className="btn btn--ghost btn--sm" style={{ marginTop: 24 }} onClick={() => setStatus({ state: 'idle' })}>
                Send another
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={submit}>
              <div className="field">
                <span>What do you need?</span>
                <div className="pills">
                  {services.map((s) => (
                    <span key={s.id}>
                      <input type="radio" name="service" id={`svc-${s.id}`} value={s.title} defaultChecked={params.get('service') === s.id} />
                      <label htmlFor={`svc-${s.id}`}>{s.title}</label>
                    </span>
                  ))}
                </div>
              </div>
              <div className="form__row">
                <div className="field">
                  <label htmlFor="name">Name *</label>
                  <input className="input" id="name" name="name" required autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="email">Email *</label>
                  <input className="input" id="email" name="email" type="email" required autoComplete="email" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="company">Company</label>
                <input className="input" id="company" name="company" autoComplete="organization" />
              </div>
              <div className="field">
                <span>Budget</span>
                <div className="pills">
                  {budgets.map((b, i) => (
                    <span key={b}>
                      <input type="radio" name="budget" id={`b-${i}`} value={b} />
                      <label htmlFor={`b-${i}`}>{b}</label>
                    </span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="message">Tell us about the project *</label>
                <textarea className="textarea" id="message" name="message" required placeholder="Goals, timeline, links to references…" />
              </div>
              {status.state === 'error' && <div className="notice notice--error">{status.message}</div>}
              <div>
                <button className="btn" disabled={status.state === 'sending'}>
                  {status.state === 'sending' ? 'Sending…' : 'Send message'} <span className="arrow">→</span>
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
