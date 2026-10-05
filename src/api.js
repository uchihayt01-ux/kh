const TOKEN_KEY = 'kinetik_admin_token';

export const auth = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

async function request(path, { method = 'GET', body, admin = false } = {}) {
  const headers = {};
  if (admin) headers.Authorization = `Bearer ${auth.get()}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && admin) {
    auth.clear();
    window.location.assign('/admin/login');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Multipart upload with progress (fetch can't report upload progress).
function upload(path, method, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path);
    xhr.setRequestHeader('Authorization', `Bearer ${auth.get()}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 401) {
        auth.clear();
        window.location.assign('/admin/login');
      }
      xhr.status < 300 ? resolve(data) : reject(new Error(data.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export const api = {
  videos: (params = {}) => request(`/api/videos?${new URLSearchParams(params)}`),
  video: (slug) => request(`/api/videos/${encodeURIComponent(slug)}`),
  view: (id) => request(`/api/videos/${id}/view`, { method: 'POST' }).catch(() => {}),
  contact: (body) => request('/api/contact', { method: 'POST', body }),

  login: (password) => request('/api/admin/login', { method: 'POST', body: { password } }),
  admin: {
    stats: () => request('/api/admin/stats', { admin: true }),
    videos: () => request('/api/admin/videos', { admin: true }),
    video: (id) => request(`/api/admin/videos/${id}`, { admin: true }),
    create: (fd, onProgress) => upload('/api/admin/videos', 'POST', fd, onProgress),
    update: (id, fd, onProgress) => upload(`/api/admin/videos/${id}`, 'PUT', fd, onProgress),
    remove: (id) => request(`/api/admin/videos/${id}`, { method: 'DELETE', admin: true }),
    reorder: (ids) => request('/api/admin/videos/reorder', { method: 'POST', body: { ids }, admin: true }),
    messages: () => request('/api/admin/messages', { admin: true }),
    markMessage: (id, read) => request(`/api/admin/messages/${id}`, { method: 'PATCH', body: { read }, admin: true }),
    deleteMessage: (id) => request(`/api/admin/messages/${id}`, { method: 'DELETE', admin: true }),
  },
};
