import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { categoryLabel } from '../config.js';
import Reveal from '../components/Reveal.jsx';
import VideoCard from '../components/VideoCard.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { CTA } from '../components/Sections.jsx';
import NotFound from './NotFound.jsx';

export default function Project() {
  const { slug } = useParams();
  const [video, setVideo] = useState(undefined);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setVideo(undefined);
    api.video(slug).then(setVideo).catch(() => setVideo(null));
  }, [slug]);

  useEffect(() => {
    if (!video) return;
    document.title = `${video.title} — Kinetik`;
    api.videos().then((all) => {
      const same = all.filter((v) => v.id !== video.id && v.category === video.category);
      const rest = all.filter((v) => v.id !== video.id && v.category !== video.category);
      setRelated([...same, ...rest].slice(0, 3));
    });
  }, [video]);

  if (video === null) return <NotFound />;
  if (!video) return <section className="page-head"><div className="container"><div className="skeleton" style={{ aspectRatio: '16/9' }} /></div></section>;

  const facts = [
    ['Client', video.client],
    ['Service', categoryLabel(video.category)],
    ['Role', video.role],
    ['Year', video.year],
    ['Length', video.duration],
    ['Format', video.aspect],
  ].filter(([, v]) => v);

  return (
    <>
      <section className="page-head" style={{ paddingBottom: 40 }}>
        <div className="container">
          <Reveal>
            <Link to="/work" className="eyebrow" style={{ color: 'inherit' }}>← All work</Link>
            <h1>{video.title}</h1>
          </Reveal>
        </div>
      </section>
      <section style={{ paddingBottom: 'clamp(72px, 11vw, 140px)' }}>
        <div className="container">
          <Reveal>
            <VideoPlayer video={video} />
          </Reveal>
          <div className="project-info">
            <Reveal>
              <p>{video.description}</p>
              {video.tags?.length > 0 && (
                <div className="tags">
                  {video.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              )}
            </Reveal>
            <Reveal as="dl" className="facts" delay={100}>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="h2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', marginBottom: 32 }}>
              More <span className="serif">work</span>
            </h2>
            <div className="grid grid--3">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CTA />
    </>
  );
}
