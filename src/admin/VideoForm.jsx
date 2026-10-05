import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { categories } from '../config.js';
import { useAdmin } from './AdminLayout.jsx';
import { resolveSource } from '../media.js';

const empty = {
  title: '',
  client: '',
  year: String(new Date().getFullYear()),
  category: 'saas',
  role: '',
  duration: '',
  aspect: '16:9',
  description: '',
  tags: '',
  externalUrl: '',
  published: true,
  featured: false,
};

function Dropzone({ accept, label, hint, onFile }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      className={`dropzone ${drag ? 'drag' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
    >
      <input type="file" accept={accept} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <strong>{label}</strong>
      {hint}
    </label>
  );
}

const fmtDuration = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function ratioOf(w, h) {
  const known = [
    ['16:9', 16 / 9],
    ['9:16', 9 / 16],
    ['1:1', 1],
    ['4:5', 4 / 5],
    ['21:9', 21 / 9],
    ['4:3', 4 / 3],
  ];
  const r = w / h;
  return known.reduce((best, k) => (Math.abs(k[1] - r) < Math.abs(best[1] - r) ? k : best))[0];
}

export default function VideoForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { notify } = useAdmin();

  const [form, setForm] = useState(empty);
  const [existing, setExisting] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [removeThumb, setRemoveThumb] = useState(false);
  const [mode, setMode] = useState('upload');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    api.admin.video(id).then((v) => {
      setExisting(v);
      setForm({ ...empty, ...v, tags: (v.tags || []).join(', ') });
      setMode(v.videoUrl || !v.externalUrl ? 'upload' : 'link');
    });
  }, [id, isNew]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const videoPreview = videoFile ? URL.createObjectURL(videoFile) : !removeVideo ? existing?.videoUrl : null;
  const thumbPreview = thumbFile ? URL.createObjectURL(thumbFile) : !removeThumb ? existing?.thumbnailUrl : null;
  useEffect(() => () => videoPreview?.startsWith('blob:') && URL.revokeObjectURL(videoPreview), [videoPreview]);
  useEffect(() => () => thumbPreview?.startsWith('blob:') && URL.revokeObjectURL(thumbPreview), [thumbPreview]);

  function onVideoMeta(e) {
    if (!videoFile) return;
    const v = e.currentTarget;
    setForm((f) => ({
      ...f,
      duration: f.duration || fmtDuration(v.duration),
      aspect: v.videoWidth ? ratioOf(v.videoWidth, v.videoHeight) : f.aspect,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    for (const [k, v] of Object.entries(form)) {
      if (k in empty) fd.append(k, typeof v === 'boolean' ? String(v) : v ?? '');
    }
    if (mode === 'upload') {
      fd.set('externalUrl', '');
      if (videoFile) fd.append('video', videoFile);
      else if (removeVideo) fd.append('removeVideo', 'true');
    } else if (existing?.videoUrl) {
      fd.append('removeVideo', 'true');
    }
    if (thumbFile) fd.append('thumbnail', thumbFile);
    else if (removeThumb) fd.append('removeThumbnail', 'true');

    setProgress(0);
    try {
      const saved = isNew ? await api.admin.create(fd, setProgress) : await api.admin.update(id, fd, setProgress);
      notify(isNew ? 'Video uploaded' : 'Changes saved');
      navigate(isNew ? `/admin/videos/${saved.id}` : '/admin/videos', { replace: isNew });
      if (isNew) setProgress(null);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
  }

  const busy = progress !== null;
  const linkSource = mode === 'link' && form.externalUrl ? resolveSource({ externalUrl: form.externalUrl }) : null;

  return (
    <form onSubmit={submit}>
      <div className="admin__head">
        <div>
          <h1>{isNew ? 'Upload video' : 'Edit video'}</h1>
          <p>{isNew ? 'Add a new project to your portfolio.' : existing?.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/admin/videos')}>Cancel</button>
          <button className="btn btn--sm" disabled={busy}>{busy ? `Uploading ${Math.round(progress * 100)}%` : isNew ? 'Publish video' : 'Save changes'}</button>
        </div>
      </div>

      {error && <div className="notice notice--error" style={{ marginBottom: 16 }}>{error}</div>}
      {busy && (
        <div className="progress" style={{ marginBottom: 16 }}>
          <div style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      <div className="editor">
        <div style={{ display: 'grid', gap: 16 }}>
          <section className="panel">
            <h2>Video</h2>
            <div className="tabs" role="tablist">
              <button type="button" className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>Upload file</button>
              <button type="button" className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}>YouTube / Vimeo / URL</button>
            </div>

            {mode === 'upload' ? (
              videoPreview ? (
                <>
                  <div className="preview">
                    <video src={videoPreview} controls playsInline onLoadedMetadata={onVideoMeta} />
                  </div>
                  <div className="preview-actions">
                    <span>{videoFile ? `${videoFile.name} · ${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : 'Current video'}</span>
                    <button type="button" className="text-btn" onClick={() => { setVideoFile(null); setRemoveVideo(true); }}>Replace / remove</button>
                  </div>
                </>
              ) : (
                <Dropzone accept="video/*" label="Drop a video file or click to browse" hint="MP4, MOV or WebM — H.264 MP4 plays everywhere" onFile={(f) => { setVideoFile(f); setRemoveVideo(false); }} />
              )
            ) : (
              <div className="field">
                <input className="input" type="url" placeholder="https://youtube.com/watch?v=…" value={form.externalUrl} onChange={set('externalUrl')} />
                <small>
                  {linkSource
                    ? linkSource.type === 'embed'
                      ? '✓ Will be embedded in the player'
                      : linkSource.type === 'file'
                        ? '✓ Direct video file'
                        : 'Will open as an external link'
                    : 'Paste a YouTube, Vimeo or direct .mp4 link.'}
                </small>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Details</h2>
            <div className="form">
              <div className="field">
                <label htmlFor="title">Title *</label>
                <input className="input" id="title" required value={form.title} onChange={set('title')} placeholder="Flowdesk — Product Launch" />
              </div>
              <div className="form__row">
                <div className="field">
                  <label htmlFor="client">Client</label>
                  <input className="input" id="client" value={form.client} onChange={set('client')} />
                </div>
                <div className="field">
                  <label htmlFor="category">Service</label>
                  <select className="select" id="category" value={form.category} onChange={set('category')}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea className="textarea" id="description" value={form.description} onChange={set('description')} placeholder="What was the brief and what did you make?" />
              </div>
              <div className="form__row">
                <div className="field">
                  <label htmlFor="role">Our role</label>
                  <input className="input" id="role" value={form.role} onChange={set('role')} placeholder="Script, animation, sound" />
                </div>
                <div className="field">
                  <label htmlFor="tags">Tags</label>
                  <input className="input" id="tags" value={form.tags} onChange={set('tags')} placeholder="Launch, 2D, UI" />
                  <small>Comma separated</small>
                </div>
              </div>
              <div className="form__row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input className="input" id="year" value={form.year} onChange={set('year')} />
                </div>
                <div className="field">
                  <label htmlFor="duration">Length</label>
                  <input className="input" id="duration" value={form.duration} onChange={set('duration')} placeholder="1:30" />
                </div>
                <div className="field">
                  <label htmlFor="aspect">Format</label>
                  <select className="select" id="aspect" value={form.aspect} onChange={set('aspect')}>
                    {['16:9', '9:16', '1:1', '4:5', '21:9', '4:3'].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <section className="panel">
            <h2>Visibility</h2>
            <label className="switch">
              <span>Published<small>Visible on the public site</small></span>
              <input type="checkbox" checked={form.published} onChange={set('published')} />
            </label>
            <label className="switch" style={{ borderBottom: 0 }}>
              <span>Featured<small>Shown in “Recent projects” on the homepage</small></span>
              <input type="checkbox" checked={form.featured} onChange={set('featured')} />
            </label>
          </section>

          <section className="panel">
            <h2>Thumbnail</h2>
            {thumbPreview ? (
              <>
                <div className="preview">
                  <img src={thumbPreview} alt="Thumbnail preview" style={{ objectFit: 'cover' }} />
                </div>
                <div className="preview-actions">
                  <span>{thumbFile ? thumbFile.name : 'Current thumbnail'}</span>
                  <button type="button" className="text-btn" onClick={() => { setThumbFile(null); setRemoveThumb(true); }}>Remove</button>
                </div>
              </>
            ) : (
              <Dropzone accept="image/*" label="Add a cover image" hint="JPG, PNG or WebP · 16:10 works best" onFile={(f) => { setThumbFile(f); setRemoveThumb(false); }} />
            )}
          </section>

          {!isNew && existing && (
            <section className="panel">
              <h2>Stats</h2>
              <dl className="facts">
                <div><dt>Plays</dt><dd>{existing.views || 0}</dd></div>
                <div><dt>Created</dt><dd>{new Date(existing.createdAt).toLocaleDateString()}</dd></div>
                <div><dt>URL</dt><dd><a className="link" href={`/work/${existing.slug}`} target="_blank" rel="noreferrer">/work/{existing.slug}</a></dd></div>
              </dl>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
