import { BUCKET, SUPABASE_URL, anonKey, supabase } from './supabase.js';

// ---- Mapping between database rows and the shape the UI uses -------------

const fromRow = (r) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  client: r.client || '',
  year: r.year || '',
  category: r.category,
  role: r.role || '',
  duration: r.duration || '',
  aspect: r.aspect || '16:9',
  description: r.description || '',
  tags: r.tags || [],
  videoUrl: r.video_url || undefined,
  thumbnailUrl: r.thumbnail_url || undefined,
  externalUrl: r.external_url || undefined,
  featured: r.featured,
  published: r.published,
  order: r.sort_order,
  views: r.views || 0,
  createdAt: r.created_at,
});

const toRow = (f) => {
  const row = {};
  const map = {
    title: 'title', client: 'client', year: 'year', category: 'category', role: 'role',
    duration: 'duration', aspect: 'aspect', description: 'description', featured: 'featured',
    published: 'published', externalUrl: 'external_url',
  };
  for (const [key, col] of Object.entries(map)) {
    if (f[key] === undefined) continue;
    row[col] = typeof f[key] === 'string' ? f[key].trim() : f[key];
  }
  if (row.external_url === '') row.external_url = null;
  if (f.tags !== undefined) {
    row.tags = (Array.isArray(f.tags) ? f.tags : String(f.tags).split(','))
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return row;
};

const check = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'video';

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title);
  const rows = check(await supabase.from('videos').select('id, slug').like('slug', `${base}%`));
  const taken = new Set(rows.filter((r) => r.id !== ignoreId).map((r) => r.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// ---- Storage --------------------------------------------------------------

const publicUrl = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

const pathFromUrl = (url) => url?.split(`/object/public/${BUCKET}/`)[1];

async function removeFiles(...urls) {
  const paths = urls.map(pathFromUrl).filter(Boolean);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

// Direct upload to Supabase Storage with progress (supabase-js can't report it).
async function uploadFile(file, folder, onProgress) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Your session expired — please log in again.');

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status < 300) return resolve();
      let msg = `Upload failed (${xhr.status})`;
      try {
        msg = JSON.parse(xhr.responseText).message || msg;
      } catch {}
      if (/exceeded|too large|payload/i.test(msg)) msg = 'This file is too big for the free plan (max 50 MB). Upload it to YouTube or Vimeo and paste the link instead.';
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });

  return publicUrl(path);
}

// ---- Public API -----------------------------------------------------------

export const api = {
  async videos({ category, featured } = {}) {
    let q = supabase.from('videos').select('*').eq('published', true).order('sort_order');
    if (category) q = q.eq('category', category);
    if (featured) q = q.eq('featured', true);
    return check(await q).map(fromRow);
  },

  async video(slug) {
    const row = check(await supabase.from('videos').select('*').eq('slug', slug).eq('published', true).maybeSingle());
    if (!row) throw new Error('Not found');
    return fromRow(row);
  },

  view: (id) => supabase.rpc('increment_view', { video_id: id }).then(() => {}, () => {}),

  async contact(body) {
    const clip = (s, n) => String(s || '').trim().slice(0, n);
    const msg = {
      name: clip(body.name, 120),
      email: clip(body.email, 200),
      company: clip(body.company, 120),
      service: clip(body.service, 60),
      budget: clip(body.budget, 60),
      message: clip(body.message, 5000),
    };
    if (!msg.name || !/^\S+@\S+\.\S+$/.test(msg.email) || !msg.message) {
      throw new Error('Please add your name, a valid email and a short message.');
    }
    check(await supabase.from('messages').insert(msg));
    return { ok: true };
  },

  // ---- Auth ----
  async session() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    const isAdmin = (await supabase.rpc('is_admin')).data === true;
    return isAdmin ? data.session : null;
  },

  async login(email, password) {
    check(await supabase.auth.signInWithPassword({ email, password }));
    const isAdmin = (await supabase.rpc('is_admin')).data === true;
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error('This account is not an admin of the portfolio.');
    }
  },

  logout: () => supabase.auth.signOut(),

  // ---- Admin ----
  admin: {
    async videos() {
      return check(await supabase.from('videos').select('*').order('sort_order')).map(fromRow);
    },

    async video(id) {
      return fromRow(check(await supabase.from('videos').select('*').eq('id', id).single()));
    },

    async stats() {
      const [videos, messages] = await Promise.all([api.admin.videos(), api.admin.messages()]);
      const byCategory = {};
      for (const c of ['saas', 'reels', 'cinematic', 'events', 'editing']) {
        byCategory[c] = videos.filter((v) => v.category === c).length;
      }
      return {
        videos: videos.length,
        published: videos.filter((v) => v.published).length,
        views: videos.reduce((s, v) => s + (v.views || 0), 0),
        unread: messages.filter((m) => !m.read).length,
        messages: messages.length,
        byCategory,
        topVideos: [...videos].sort((a, b) => b.views - a.views).slice(0, 5),
      };
    },

    async unread() {
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('read', false);
      return count || 0;
    },

    /**
     * Create or update a video.
     * files: { video?: File, thumbnail?: File, removeVideo?: bool, removeThumbnail?: bool }
     */
    async save(id, fields, files = {}, onProgress) {
      const existing = id ? await api.admin.video(id) : null;
      const row = toRow(fields);

      if (!existing || fields.title !== existing.title) row.slug = await uniqueSlug(fields.title, id);

      // Upload new files, reporting combined progress.
      const uploads = [files.video, files.thumbnail].filter(Boolean);
      const total = uploads.reduce((s, f) => s + f.size, 0) || 1;
      let done = 0;
      const track = (file) => (p) => onProgress?.((done + p * file.size) / total);
      onProgress?.(0);

      if (files.video) {
        row.video_url = await uploadFile(files.video, 'videos', track(files.video));
        done += files.video.size;
      } else if (files.removeVideo) {
        row.video_url = null;
      }
      if (files.thumbnail) {
        row.thumbnail_url = await uploadFile(files.thumbnail, 'thumbnails', track(files.thumbnail));
        done += files.thumbnail.size;
      } else if (files.removeThumbnail) {
        row.thumbnail_url = null;
      }

      if (!existing && !row.video_url && !row.external_url) {
        throw new Error('Upload a video file or paste a YouTube / Vimeo / MP4 link');
      }

      let saved;
      if (existing) {
        row.updated_at = new Date().toISOString();
        saved = check(await supabase.from('videos').update(row).eq('id', id).select().single());
        // Clean up files that were replaced or removed.
        const stale = [];
        if ('video_url' in row && existing.videoUrl !== row.video_url) stale.push(existing.videoUrl);
        if ('thumbnail_url' in row && existing.thumbnailUrl !== row.thumbnail_url) stale.push(existing.thumbnailUrl);
        await removeFiles(...stale);
      } else {
        const last = check(await supabase.from('videos').select('sort_order').order('sort_order', { ascending: false }).limit(1));
        row.sort_order = (last[0]?.sort_order ?? -1) + 1;
        saved = check(await supabase.from('videos').insert(row).select().single());
      }
      onProgress?.(1);
      return fromRow(saved);
    },

    async patch(id, fields) {
      return fromRow(check(await supabase.from('videos').update(toRow(fields)).eq('id', id).select().single()));
    },

    async remove(video) {
      check(await supabase.from('videos').delete().eq('id', video.id));
      await removeFiles(video.videoUrl, video.thumbnailUrl);
    },

    async reorder(ids) {
      await Promise.all(ids.map((id, i) => supabase.from('videos').update({ sort_order: i }).eq('id', id)));
    },

    async messages() {
      return check(await supabase.from('messages').select('*').order('created_at', { ascending: false })).map((m) => ({
        ...m,
        createdAt: m.created_at,
      }));
    },

    async markMessage(id, read) {
      const m = check(await supabase.from('messages').update({ read }).eq('id', id).select().single());
      return { ...m, createdAt: m.created_at };
    },

    async deleteMessage(id) {
      check(await supabase.from('messages').delete().eq('id', id));
    },
  },
};
