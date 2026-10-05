// Resolve a video record into something playable.
export function resolveSource(video) {
  if (video?.videoUrl) return { type: 'file', src: video.videoUrl };
  const url = video?.externalUrl;
  if (!url) return null;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return {
      type: 'embed',
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`,
      poster: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1` };
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { type: 'file', src: url };
  return { type: 'link', src: url };
}

export const posterFor = (video) => video?.thumbnailUrl || resolveSource(video)?.poster || null;

// Deterministic gradient so videos without a thumbnail still look intentional.
const palettes = [
  ['#1a1a1a', '#ff5a1f'],
  ['#0f172a', '#6366f1'],
  ['#111827', '#10b981'],
  ['#1c1917', '#eab308'],
  ['#18181b', '#ec4899'],
  ['#0c0a09', '#06b6d4'],
];

export function gradientFor(key = '') {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = palettes[h % palettes.length];
  return `radial-gradient(120% 120% at 100% 0%, ${b} 0%, ${a} 60%)`;
}

export const aspectRatio = (aspect) => {
  const [w, h] = String(aspect || '16:9').split(':').map(Number);
  return w && h ? `${w} / ${h}` : '16 / 9';
};
