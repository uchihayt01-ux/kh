import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api, auth } from '../api.js';
import { Logo } from '../components/Nav.jsx';
import './admin.css';

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

export default function AdminLayout() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState('');

  const refreshUnread = useCallback(() => {
    api.admin.stats().then((s) => setUnread(s.unread)).catch(() => {});
  }, []);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(notify.t);
    notify.t = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    document.title = 'Dashboard — Kinetik';
    if (auth.get()) refreshUnread();
  }, [refreshUnread]);

  if (!auth.get()) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    auth.clear();
    navigate('/admin/login');
  };

  return (
    <AdminCtx.Provider value={{ notify, refreshUnread }}>
      <div className="admin">
        <aside className="admin__side">
          <Logo />
          <nav className="admin__nav">
            <NavLink to="/admin" end>Overview</NavLink>
            <NavLink to="/admin/videos">Videos</NavLink>
            <NavLink to="/admin/videos/new">Upload video</NavLink>
            <NavLink to="/admin/messages">
              Messages {unread > 0 && <span className="count">{unread}</span>}
            </NavLink>
          </nav>
          <div className="admin__nav admin__foot">
            <Link to="/" target="_blank">View site ↗</Link>
            <button onClick={logout}>Log out</button>
          </div>
        </aside>
        <main className="admin__main">
          <Outlet />
        </main>
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </AdminCtx.Provider>
  );
}
