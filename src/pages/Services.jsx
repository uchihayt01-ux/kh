import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { process, services, site } from '../config.js';
import Reveal from '../components/Reveal.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { CTA, FAQ } from '../components/Sections.jsx';

export default function Services() {
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    api.videos().then(setVideos).catch(() => {});
  }, []);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">Services</div>
            <h1>
              Video for every <span className="serif">moment</span>
            </h1>
            <p className="lead">From product launches to wedding films — strategy, animation, editing, colour and sound under one roof.</p>
          </Reveal>
        </div>
      </section>

      {services.map((s, i) => {
        const example = videos.find((v) => v.category === s.id);
        return (
          <section key={s.id} className="section--tight" id={s.id} style={{ borderTop: '1px solid var(--line)' }}>
            <div className="container about" style={{ alignItems: 'center' }}>
              <Reveal>
                <div className="eyebrow">0{i + 1}</div>
                <h2 className="h2" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>{s.title}</h2>
                <p className="lead" style={{ margin: '18px 0 28px' }}>{s.summary}</p>
                <ul className="service__points" style={{ marginBottom: 32 }}>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to={`${site.bookingUrl}?service=${s.id}`} className="btn btn--sm">Get a quote</Link>
                  <Link to={`/work?category=${s.id}`} className="btn btn--ghost btn--sm">See examples</Link>
                </div>
              </Reveal>
              <Reveal delay={100}>{example ? <VideoCard video={example} /> : <div className="skeleton" style={{ animation: 'none' }} />}</Reveal>
            </div>
          </section>
        );
      })}

      <section className="section section--dark">
        <div className="container">
          <div className="eyebrow">How we work</div>
          <div className="process" style={{ marginTop: 24 }}>
            {process.map((p) => (
              <div key={p.step} className="process__item">
                <b>{p.step}</b>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
