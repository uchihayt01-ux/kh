import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { categories } from '../config.js';
import { Thumb } from './Videos.jsx';

export default function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p style={{ color: 'var(--muted)' }}>Loading…</p>;
  const max = Math.max(1, ...Object.values(stats.byCategory));

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Overview</h1>
          <p>Everything happening on your portfolio at a glance.</p>
        </div>
        <Link to="/admin/videos/new" className="btn btn--sm">+ Upload video</Link>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Total videos</span><b>{stats.videos}</b></div>
        <div className="kpi"><span>Published</span><b>{stats.published}</b></div>
        <div className="kpi"><span>Total plays</span><b>{stats.views.toLocaleString()}</b></div>
        <div className="kpi"><span>Unread messages</span><b>{stats.unread}</b></div>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Videos by service</h2>
          <div className="bars">
            {categories.map((c) => (
              <div className="bar" key={c.id}>
                <span>{c.label}</span>
                <div className="bar__track">
                  <div className="bar__fill" style={{ width: `${(stats.byCategory[c.id] / max) * 100}%` }} />
                </div>
                <b>{stats.byCategory[c.id]}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Most played</h2>
          <div className="rows">
            {stats.topVideos.map((v) => (
              <Link to={`/admin/videos/${v.id}`} key={v.id} className="row row--simple">
                <Thumb video={v} />
                <span className="row__title">{v.title}</span>
                <span className="badge">{v.views || 0} plays</span>
              </Link>
            ))}
            {stats.topVideos.length === 0 && <p style={{ color: 'var(--muted)' }}>No videos yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
