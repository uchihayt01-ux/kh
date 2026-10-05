import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { categories } from '../config.js';
import Reveal from '../components/Reveal.jsx';
import VideoCard, { CardSkeletons } from '../components/VideoCard.jsx';
import { CTA } from '../components/Sections.jsx';

export default function Work() {
  const [videos, setVideos] = useState(null);
  const [params, setParams] = useSearchParams();
  const active = params.get('category') || 'all';

  useEffect(() => {
    api.videos().then(setVideos).catch(() => setVideos([]));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    videos?.forEach((v) => (c[v.category] = (c[v.category] || 0) + 1));
    return c;
  }, [videos]);

  const shown = videos?.filter((v) => active === 'all' || v.category === active);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">Portfolio</div>
            <h1>
              Our <span className="serif">work</span>
            </h1>
            <p className="lead">
              A selection of SaaS videos, reels, cinematic films and event edits made with teams around the world.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="filters" role="tablist" aria-label="Filter by category">
            <button role="tab" aria-selected={active === 'all'} className={`chip ${active === 'all' ? 'active' : ''}`} onClick={() => setParams({})}>
              All<sup>{videos?.length ?? ''}</sup>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={active === c.id}
                className={`chip ${active === c.id ? 'active' : ''}`}
                onClick={() => setParams({ category: c.id })}
              >
                {c.label}
                <sup>{counts[c.id] || 0}</sup>
              </button>
            ))}
          </div>
          <div className="grid grid--3">
            {!videos && <CardSkeletons count={6} />}
            {shown?.map((v) => (
              <Reveal key={v.id}>
                <VideoCard video={v} />
              </Reveal>
            ))}
          </div>
          {shown?.length === 0 && <div className="empty">No projects in this category yet.</div>}
        </div>
      </section>
      <CTA />
    </>
  );
}
