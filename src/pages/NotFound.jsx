import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-head" style={{ minHeight: '70vh' }}>
      <div className="container">
        <div className="eyebrow">404</div>
        <h1>
          Lost in the <span className="serif">edit.</span>
        </h1>
        <p className="lead">The page you’re looking for doesn’t exist or was moved.</p>
        <Link to="/" className="btn" style={{ marginTop: 32 }}>Back home</Link>
      </div>
    </section>
  );
}
