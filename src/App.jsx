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

export default function App() {
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
