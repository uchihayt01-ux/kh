import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Reveal from '../components/Reveal.jsx';
import VideoCard, { CardSkeletons } from '../components/VideoCard.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { CTA, FAQ, SectionHead, initials } from '../components/Sections.jsx';
import { clients, pricing, process, services, site, stats, testimonials, tools } from '../config.js';

const avatarColors = ['#ff5a1f', '#111', '#6366f1', '#10b981'];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    api.videos({ featured: 1 }).then(setFeatured).catch(() => setFeatured([]));
  }, []);

  const reel = featured?.find((v) => v.videoUrl) || featured?.[0];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <Reveal>
            <div className="eyebrow">{site.tagline}</div>
            <h1 className="hero__title">
              Motion that makes <span className="serif">people</span> stop &amp; watch.
            </h1>
          </Reveal>
          <Reveal className="hero__row" delay={120}>
            <p className="lead">
              We craft SaaS explainers, social reels, cinematic brand films and event videos — designed to explain
              clearly and look beautiful doing it.
            </p>
            <div className="hero__actions">
              <Link to={site.bookingUrl} className="btn">
                Book a call <span className="arrow">→</span>
              </Link>
              <Link to="/work" className="btn btn--ghost">
                View our work
              </Link>
            </div>
          </Reveal>
          <Reveal className="hero__proof" delay={200} style={{ marginTop: 28 }}>
            <div className="avatars" aria-hidden="true">
              {testimonials.map((t, i) => (
                <span key={t.name} style={{ background: avatarColors[i % avatarColors.length] }}>
                  {initials(t.name)}
                </span>
              ))}
            </div>
            Trusted by 60+ startups, brands &amp; event teams
          </Reveal>

          <Reveal className="showreel" delay={260}>
            {reel?.videoUrl ? (
              <video src={reel.videoUrl} poster={reel.thumbnailUrl} autoPlay muted loop playsInline />
            ) : (
              <div className="showreel__bg showreel__shapes" aria-hidden="true">
                <span style={{ width: '45%', aspectRatio: 1, background: '#ff5a1f', left: '8%', top: '10%' }} />
                <span style={{ width: '35%', aspectRatio: 1, background: '#6366f1', right: '10%', bottom: '5%', animationDelay: '-5s' }} />
                <span style={{ width: '25%', aspectRatio: 1, background: '#f6f5f2', left: '45%', top: '35%', opacity: 0.25, animationDelay: '-9s' }} />
              </div>
            )}
            <div className="showreel__label">
              {reel && <button className="play" aria-label="Play showreel" onClick={() => setReelOpen(true)} />}
              <span>
                Showreel {new Date().getFullYear()}
                <br />
                <small style={{ opacity: 0.7 }}>{reel ? reel.title : 'Upload work from the dashboard'}</small>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {reelOpen && reel && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setReelOpen(false)}>
          <button className="modal__close" aria-label="Close">×</button>
          <div className="modal__inner" onClick={(e) => e.stopPropagation()}>
            <VideoPlayer video={reel} autoPlay />
          </div>
        </div>
      )}

      {/* Clients */}
      <div className="marquee" aria-label="Clients">
        <div className="marquee__track">
          {[...clients, ...clients].map((c, i) => (
            <span key={i} aria-hidden={i >= clients.length}>{c}</span>
          ))}
        </div>
      </div>

      {/* Selected work */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Selected work"
            title={<>Recent <span className="serif">projects</span></>}
            action={<Link to="/work" className="btn btn--ghost">All work <span className="arrow">→</span></Link>}
          />
          <div className="grid">
            {!featured && <CardSkeletons />}
            {featured?.slice(0, 4).map((v, i) => (
              <Reveal key={v.id} delay={(i % 2) * 120}>
                <VideoCard video={v} />
              </Reveal>
            ))}
          </div>
          {featured?.length === 0 && <div className="empty">No featured projects yet — mark some as “Featured” in the dashboard.</div>}
        </div>
      </section>

      {/* Quote */}
      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <p className="quote">
              “{testimonials[0].quote}”
            </p>
            <div className="quote__author">
              <span className="initials">{initials(testimonials[0].name)}</span>
              <span>
                {testimonials[0].name}
                <small>{testimonials[0].role}</small>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="section" id="services">
        <div className="container">
          <SectionHead
            eyebrow="Services"
            title={<>What we <span className="serif">do</span></>}
            action={<Link to="/services" className="btn btn--ghost">Explore services <span className="arrow">→</span></Link>}
          >
            One studio for every kind of video your brand needs — from a 15-second reel to a two-minute launch film.
          </SectionHead>
          <div className="services">
            {services.map((s, i) => (
              <Reveal key={s.id} className="service">
                <span className="service__num">0{i + 1}</span>
                <div>
                  <h3 className="service__title">{s.title}</h3>
                  <p className="service__summary">{s.summary}</p>
                </div>
                <ul className="service__points">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="tools">
            {tools.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="section section--dark">
        <div className="container">
          <SectionHead eyebrow="Process" title={<>Simple, <span className="serif">transparent</span> process</>} />
          <div className="process">
            {process.map((p, i) => (
              <Reveal key={p.step} className="process__item" delay={i * 80}>
                <b>{p.step}</b>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About + stats */}
      <section className="section">
        <div className="container">
          <div className="about">
            <Reveal>
              <div className="eyebrow">About the studio</div>
            </Reveal>
            <Reveal className="about__text" delay={100}>
              <p>
                We’re a small team of motion designers and editors who believe the best videos are the ones people{' '}
                <span className="serif">actually understand.</span>
              </p>
              <p>
                Every project starts with the message, not the effects. We dig into your product, your audience and
                your goals, then design motion that carries the story — whether it’s a feature launch, a vertical reel
                or a conference recap.
              </p>
            </Reveal>
          </div>
          <div className="stats" style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
            {stats.map((s, i) => (
              <Reveal key={s.label} className="stat" delay={i * 80}>
                <div className="stat__value">{s.value}</div>
                <div className="stat__label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead eyebrow="Pricing" title={<>Clear <span className="serif">pricing</span></>}>
            Pick a single project or keep a motion team on call. Every quote is fixed — no surprises.
          </SectionHead>
          <div className="pricing">
            {pricing.map((p, i) => (
              <Reveal key={p.name} className={`plan ${p.highlighted ? 'plan--highlight' : ''}`} delay={i * 80}>
                <div className="plan__head">
                  <span className="plan__name">{p.name}</span>
                  {p.highlighted && <span className="plan__tag">Most popular</span>}
                </div>
                <div className="plan__price">{p.price}</div>
                <div className="plan__note">{p.note}</div>
                <p className="plan__desc">{p.description}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link to={site.bookingUrl} className={`btn ${p.highlighted ? '' : 'btn--ghost'}`}>
                  {p.cta}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead eyebrow="Testimonials" title={<>Kind <span className="serif">words</span></>} />
          <div className="testimonials">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} as="figure" className="testimonial" delay={i * 80} style={{ margin: 0 }}>
                <p>“{t.quote}”</p>
                <footer>
                  <span className="initials" style={{ background: avatarColors[i % avatarColors.length] }}>
                    {initials(t.name)}
                  </span>
                  <span>
                    {t.name}
                    <small>{t.role}</small>
                  </span>
                </footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
      <CTA />
    </>
  );
}
