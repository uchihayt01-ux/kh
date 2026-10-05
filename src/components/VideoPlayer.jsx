import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { aspectRatio, gradientFor, posterFor, resolveSource } from '../media.js';

export default function VideoPlayer({ video, autoPlay = false }) {
  const source = resolveSource(video);
  const poster = posterFor(video);
  const [started, setStarted] = useState(autoPlay);
  const vertical = (() => {
    const [w, h] = String(video.aspect || '16:9').split(':').map(Number);
    return h > w;
  })();

  useEffect(() => setStarted(autoPlay), [video.id, autoPlay]);

  const begin = () => {
    setStarted(true);
    api.view(video.id);
  };

  return (
    <div className={`player ${vertical ? 'player--vertical' : ''}`} style={{ aspectRatio: aspectRatio(video.aspect) }}>
      {source?.type === 'file' && (
        <video src={source.src} poster={poster || undefined} controls playsInline autoPlay={autoPlay} onPlay={() => !started && begin()} />
      )}

      {source?.type === 'embed' &&
        (started ? (
          <iframe src={source.src} title={video.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <button className="player__placeholder" onClick={begin} style={{ background: poster ? `center/cover url(${poster})` : gradientFor(video.slug), border: 0 }} aria-label={`Play ${video.title}`}>
            <span className="play" />
          </button>
        ))}

      {source?.type === 'link' && (
        <a className="player__placeholder" href={source.src} target="_blank" rel="noreferrer" style={{ background: gradientFor(video.slug) }}>
          <span>Watch on external site ↗</span>
        </a>
      )}

      {!source && (
        <div className="player__placeholder" style={{ background: poster ? `center/cover url(${poster})` : gradientFor(video.slug) }}>
          <div>
            <span className="play" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <span style={{ fontSize: 14, opacity: 0.8 }}>Video coming soon — upload it from the dashboard.</span>
          </div>
        </div>
      )}
    </div>
  );
}
