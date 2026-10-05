# Kinetik — Motion & Video Studio

A clean, minimal portfolio site for a motion-graphics / video studio, plus a private dashboard to upload and manage the videos shown on it.

**Built with:** React 18 + Vite + React Router (frontend) · Node / Express + Multer (API and video hosting) · JSON file storage (no database to set up).

## Features

### Public website
- **Home** — hero, showreel (auto-plays your first featured upload), client marquee, selected work, testimonial, services, process, about + stats, pricing, testimonials, FAQ and a call-to-action
- **Work** — portfolio grid filterable by service (SaaS videos, Reels & social, Cinematic, Events, Video editing). Cards preview the video on hover.
- **Project page** — video player (uploaded file, YouTube, Vimeo or direct MP4 link), description, credits and related work
- **Services** — each service with a real example pulled from your portfolio
- **Contact** — enquiry form; messages land in the dashboard
- Fully responsive, scroll-reveal animations, respects `prefers-reduced-motion`

### Dashboard (`/admin`)
- Password login
- **Overview** — video count, total plays, unread messages, videos per service, most-played videos
- **Upload video** — drag & drop a video file (with progress bar) or paste a YouTube / Vimeo / MP4 link; add a cover image; title, client, service, description, role, tags, year, length and format (length and format are detected from the file)
- **Manage videos** — search, filter, edit, delete, publish/unpublish, feature on the homepage, reorder
- **Messages** — read, reply, mark read/unread and delete contact-form enquiries

## Getting started

```bash
npm install
npm run dev
```

- Website: http://localhost:5173
- Dashboard: http://localhost:5173/admin — default password **`admin123`**

The first run seeds six sample projects (without video files) so the layout isn't empty. Edit or delete them from the dashboard.

## Production

```bash
npm run build
ADMIN_PASSWORD="something-strong" npm start   # site + API on http://localhost:4000
```

Uploaded videos and data are written to `DATA_DIR` (default `server/data/`) — that folder **must live on a persistent disk**, otherwise uploads disappear on every redeploy.

### Deploy on Render (recommended, ~5 minutes)

1. Open **https://render.com/deploy?repo=https://github.com/uchihayt01-ux/kh** and sign in with GitHub.
2. Render reads `render.yaml` and sets up a web service with a 10 GB disk for your videos. Enter a strong **ADMIN_PASSWORD** when asked.
3. Click **Apply**. After the build you get a live `https://kinetik-studio-xxxx.onrender.com` URL; the dashboard is at `/admin`.
4. Optional: add your own domain under *Settings → Custom Domains*.

Persistent disks need Render's paid **Starter** instance (about $7/month + disk). The free tier would work for testing, but uploaded videos would be wiped on each restart.

### Deploy with Docker (Railway, Fly.io, a VPS…)

```bash
docker build -t kinetik .
docker run -p 4000:4000 -e ADMIN_PASSWORD=change-me -v kinetik-data:/data kinetik
```

On Railway/Fly, attach a volume mounted at `/data` and set `ADMIN_PASSWORD`.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `admin123` | Dashboard password — **change it** |
| `SESSION_SECRET` | derived from password | Secret used to sign login tokens |
| `PORT` | `4000` | Server port |
| `DATA_DIR` | `server/data` | Where `db.json` and uploads are stored |
| `UPLOAD_DIR` | `$DATA_DIR/uploads` | Where uploaded files are stored |
| `MAX_UPLOAD_MB` | `1024` | Max upload size per file |

## Customising

- **All text** (studio name, email, services, pricing, testimonials, FAQ, stats, clients) lives in [`src/config.js`](src/config.js).
- **Colours & fonts** are CSS variables at the top of [`src/styles.css`](src/styles.css) (`--accent`, `--bg`, `--ink`…).
- Export videos as **H.264 MP4** so they play in every browser. For many large videos, consider hosting on Vimeo/YouTube and pasting the link instead.

## Project structure

```
server/            Express API, auth, JSON storage, uploads
src/config.js      site copy & content
src/pages/         Home, Work, Project, Services, Contact
src/components/    Nav, Footer, VideoCard, VideoPlayer, shared sections
src/admin/         dashboard: Login, Overview, Videos, VideoForm, Messages
```
