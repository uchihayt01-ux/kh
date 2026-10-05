import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryLabel } from '../config.js';
import { gradientFor, posterFor, resolveSource } from '../media.js';

export default function VideoCard({ video }) {
  const poster = posterFor(video);
  const source = resolveSource(video);
  const previewRef = useRef(null);
  const [ready, setReady] = useState(false);
  const canPreview = source?.type === 'file';

  const start = () => {
    const v = previewRef.current;
    if (v) v.play().catch(() => {});
  };
  const stop = () => {
    const v = previewRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <Link to={`/work/${video.slug}`} className="card" onMouseEnter={start} onMouseLeave={stop}>
      <div className="card__media">
        {poster ? (
          <img src={poster} alt="" loading="lazy" />
        ) : (
          <div className="card__poster" style={{ background: gradientFor(video.slug) }}>
            {video.client || video.title}
          </div>
        )}
        {canPreview && (
          <video
            ref={previewRef}
            className={`card__preview ${ready ? 'ready' : ''}`}
            src={`${source.src}#t=0.1`}
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={() => setReady(true)}
          />
        )}
        <span className="card__badge">{categoryLabel(video.category)}</span>
        {video.duration && <span className="card__duration">{video.duration}</span>}
        <span className="card__play" aria-hidden="true">
          <span className="play" />
        </span>
      </div>
      <div className="card__meta">
        <h3 className="card__title">{video.title}</h3>
        <span className="card__sub">{video.year}</span>
      </div>
    </Link>
  );
}

export function CardSkeletons({ count = 4 }) {
  return Array.from({ length: count }, (_, i) => <div key={i} className="skeleton" />);
}
