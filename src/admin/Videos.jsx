import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { categories, categoryLabel } from '../config.js';
import { gradientFor, posterFor } from '../media.js';
import { useAdmin } from './AdminLayout.jsx';

export function Thumb({ video }) {
  const poster = posterFor(video);
  return (
    <span className="thumb" style={poster ? undefined : { background: gradientFor(video.slug) }}>
      {poster ? (
        <img src={poster} alt="" loading="lazy" />
      ) : video.videoUrl ? (
        <video src={`${video.videoUrl}#t=0.5`} muted preload="metadata" />
      ) : (
        video.client || video.title
      )}
    </span>
  );
}

export default function Videos() {
  const { notify } = useAdmin();
  const [videos, setVideos] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.admin.videos().then(setVideos).catch((e) => notify(e.message));
  }, [notify]);

  const filtering = Boolean(query || category);
  const shown = useMemo(
    () =>
      videos?.filter(
        (v) =>
          (!category || v.category === category) &&
          (!query || `${v.title} ${v.client}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [videos, query, category],
  );

  async function toggle(video, key) {
    const updated = await api.admin.patch(video.id, { [key]: !video[key] }).catch((e) => notify(e.message));
    if (!updated) return;
    setVideos((vs) => vs.map((v) => (v.id === video.id ? updated : v)));
    notify(key === 'published' ? (updated.published ? 'Published' : 'Moved to drafts') : updated.featured ? 'Featured on homepage' : 'Removed from homepage');
  }

  async function remove(video) {
    if (!window.confirm(`Delete “${video.title}”? The uploaded files will be removed too.`)) return;
    await api.admin.remove(video);
    setVideos((vs) => vs.filter((v) => v.id !== video.id));
    notify('Video deleted');
  }

  async function move(index, dir) {
    const next = [...videos];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    setVideos(next);
    await api.admin.reorder(next.map((v) => v.id));
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Videos</h1>
          <p>Upload, edit and order the work shown on your portfolio.</p>
        </div>
        <Link to="/admin/videos/new" className="btn btn--sm">+ Upload video</Link>
      </div>

      <div className="toolbar">
        <input className="input" placeholder="Search by title or client…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All services</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <section className="panel" style={{ padding: '8px 24px' }}>
        {!videos && <p style={{ padding: '16px 0', color: 'var(--muted)' }}>Loading…</p>}
        {shown?.length === 0 && (
          <p style={{ padding: '24px 0', color: 'var(--muted)' }}>
            {filtering ? 'No videos match your filters.' : 'No videos yet — upload your first one.'}
          </p>
        )}
        <div className="rows">
          {shown?.map((v) => {
            const index = videos.indexOf(v);
            return (
              <div className="row" key={v.id}>
                <div className="order-btns">
                  <button className="icon-btn icon-btn--sm" aria-label="Move up" disabled={filtering || index === 0} onClick={() => move(index, -1)}>▲</button>
                  <button className="icon-btn icon-btn--sm" aria-label="Move down" disabled={filtering || index === videos.length - 1} onClick={() => move(index, 1)}>▼</button>
                </div>
                <Link to={`/admin/videos/${v.id}`}><Thumb video={v} /></Link>
                <div style={{ minWidth: 0 }}>
                  <Link to={`/admin/videos/${v.id}`} className="row__title" style={{ display: 'block' }}>{v.title}</Link>
                  <div className="row__meta">
                    <span>{categoryLabel(v.category)}</span>·<span>{v.client || '—'}</span>·<span>{v.views || 0} plays</span>
                    <span className={`badge ${v.published ? 'badge--live' : ''}`}>{v.published ? 'Live' : 'Draft'}</span>
                    {v.featured && <span className="badge badge--star">Featured</span>}
                    {!v.videoUrl && !v.externalUrl && <span className="badge">No video</span>}
                  </div>
                </div>
                <div className="row__actions">
                  <button className="icon-btn" title={v.featured ? 'Unfeature' : 'Feature on homepage'} aria-label="Toggle featured" onClick={() => toggle(v, 'featured')}>
                    {v.featured ? '★' : '☆'}
                  </button>
                  <button className="icon-btn" title={v.published ? 'Unpublish' : 'Publish'} aria-label="Toggle published" onClick={() => toggle(v, 'published')}>
                    {v.published ? '◉' : '○'}
                  </button>
                  {v.published && (
                    <a className="icon-btn" href={`/work/${v.slug}`} target="_blank" rel="noreferrer" title="View on site" aria-label="View on site">↗</a>
                  )}
                  <Link className="icon-btn" to={`/admin/videos/${v.id}`} title="Edit" aria-label="Edit">✎</Link>
                  <button className="icon-btn icon-btn--danger" title="Delete" aria-label="Delete" onClick={() => remove(v)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
