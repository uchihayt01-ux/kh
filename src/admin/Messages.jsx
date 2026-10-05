import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAdmin } from './AdminLayout.jsx';

export default function Messages() {
  const { notify, refreshUnread } = useAdmin();
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    api.admin.messages().then(setMessages).catch((e) => notify(e.message));
  }, [notify]);

  async function mark(m, read) {
    const updated = await api.admin.markMessage(m.id, read);
    setMessages((ms) => ms.map((x) => (x.id === m.id ? updated : x)));
    refreshUnread();
  }

  async function remove(m) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    await api.admin.deleteMessage(m.id);
    setMessages((ms) => ms.filter((x) => x.id !== m.id));
    refreshUnread();
    notify('Message deleted');
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Messages</h1>
          <p>Project enquiries sent from the contact form.</p>
        </div>
      </div>
      <section className="panel" style={{ padding: '4px 24px' }}>
        {!messages && <p style={{ padding: '16px 0', color: 'var(--muted)' }}>Loading…</p>}
        {messages?.length === 0 && <p style={{ padding: '24px 0', color: 'var(--muted)' }}>No messages yet.</p>}
        {messages?.map((m) => (
          <article key={m.id} className={`msg ${m.read ? '' : 'msg--unread'}`}>
            <div className="msg__head">
              <div>
                <b>{m.name}</b>{' '}
                <a className="link" href={`mailto:${m.email}`} style={{ fontSize: 14, marginLeft: 6 }}>{m.email}</a>
              </div>
              <small style={{ color: 'var(--muted)' }}>{new Date(m.createdAt).toLocaleString()}</small>
            </div>
            <div className="row__meta">
              {m.company && <span className="badge">{m.company}</span>}
              {m.service && <span className="badge">{m.service}</span>}
              {m.budget && <span className="badge">{m.budget}</span>}
            </div>
            <p>{m.message}</p>
            <div className="msg__actions">
              <a className="btn btn--sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your project enquiry')}`} onClick={() => !m.read && mark(m, true)}>Reply</a>
              <button className="btn btn--ghost btn--sm" onClick={() => mark(m, !m.read)}>{m.read ? 'Mark unread' : 'Mark read'}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => remove(m)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
