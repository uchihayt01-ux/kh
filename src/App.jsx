import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Work from './pages/Work.jsx';
import Project from './pages/Project.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import { isConfigured } from './supabase.js';

const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const Login = lazy(() => import('./admin/Login.jsx'));
const Overview = lazy(() => import('./admin/Overview.jsx'));
const Videos = lazy(() => import('./admin/Videos.jsx'));
const VideoForm = lazy(() => import('./admin/VideoForm.jsx'));
const Messages = lazy(() => import('./admin/Messages.jsx'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/work/') || pathname.startsWith('/admin')) return;
    const page = { '/work': 'Work', '/services': 'Services', '/contact': 'Contact' }[pathname];
    document.title = page ? `${page} — Kinetik` : 'Kinetik — Motion & Video Studio';
  }, [pathname]);
  return null;
}

function SiteLayout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function SetupNotice() {
  return (
    <section className="page-head" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="eyebrow">Setup needed</div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>
          Connect <span className="serif">Supabase</span>
        </h1>
        <p className="lead">
          The site is running, but it doesn’t know your Supabase project yet. Add these two environment variables
          (in Vercel: Project → Settings → Environment Variables), then redeploy:
        </p>
        <pre className="panel" style={{ marginTop: 24, overflowX: 'auto', fontSize: 14, background: 'var(--surface)', padding: 20, borderRadius: 12, border: '1px solid var(--line)' }}>
          VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=your-anon-key
        </pre>
        <p className="lead" style={{ marginTop: 16, fontSize: 15 }}>Find both in Supabase → Project Settings → API. Full steps are in the README.</p>
      </div>
    </section>
  );
}

export default function App() {
  if (!isConfigured) return <SetupNotice />;
  return (
    <>
      <ScrollManager />
      <TitleManager />
      <Suspense fallback={null}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="work" element={<Work />} />
            <Route path="work/:slug" element={<Project />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/login" element={<Login />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="videos" element={<Videos />} />
            <Route path="videos/new" element={<VideoForm />} />
            <Route path="videos/:id" element={<VideoForm />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
