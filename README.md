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

Deploy to any host that runs Node with a persistent disk (Render, Railway, Fly.io, a VPS…). Uploaded videos and data are written to `server/data/` — keep that folder on a persistent volume.

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
