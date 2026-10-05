import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, auth } from '../api.js';
import { Logo } from '../components/Nav.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth.get()) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api.login(new FormData(e.currentTarget).get('password'));
      auth.set(token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
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
          <label htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
        </div>
        {error && <div className="notice notice--error">{error}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
