import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Logo } from '../components/Nav.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.session().then((s) => s && navigate('/admin', { replace: true }));
  }, [navigate]);

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api.login(form.get('email'), form.get('password'));
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Wrong email or password' : err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card panel" onSubmit={submit}>
        <div>
          <Logo />
          <h1>Studio dashboard</h1>
          <p>Sign in to upload and manage your portfolio videos.</p>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required autoFocus autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <div className="notice notice--error">{error}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
