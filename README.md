# Kinetik — Motion & Video Studio

A clean, minimal portfolio site for a motion-graphics / video studio, with a private dashboard to upload and manage the videos shown on it.

**100% free stack:** React + Vite (site) · **Supabase** free plan (database, video storage, login) · **Netlify** or Vercel free plan (hosting).

## Features

### Public website
- **Home**: hero, showreel (auto-plays your first featured uploaded video), client marquee, selected work, testimonial, services, process, about and stats, pricing, testimonials, FAQ, call-to-action
- **Work**: portfolio grid filterable by service (SaaS videos, Reels & social, Cinematic, Events, Video editing), with hover previews
- **Project page**: video player (uploaded file, YouTube, Vimeo or MP4 link), description, credits, related work
- **Services** and **Contact** (enquiries land in the dashboard)
- Responsive, animated, respects `prefers-reduced-motion`

### Dashboard (`/admin`)
- Email + password login (Supabase Auth). Only admins can get in.
- Overview: videos, plays, unread messages, videos per service, most played
- Upload a video file (with progress bar) or paste a YouTube / Vimeo / MP4 link, add a cover image and all project details
- Edit, delete, publish/unpublish, feature on homepage, reorder
- Read, reply to and manage contact-form messages

---

## Go live for free (about 15 minutes)

### Step 1: Supabase (database + video storage)

1. Go to **https://supabase.com** → **Start your project** → sign up (free, no card needed).
2. Click **New project**. Choose a name (e.g. `kinetik`), set a database password (save it somewhere) and pick the region closest to you. Click **Create new project** and wait ~2 minutes.
3. In the left menu open **SQL Editor** → **New query**. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, copy **all** of it, paste it in, and click **Run**. You should see *“Success. No rows returned”*.
   This creates the tables, the `media` storage bucket, the security rules and 6 sample projects.
4. Create your dashboard login: left menu **Authentication** → **Users** → **Add user** → **Create new user**. Enter your email and a password, tick **Auto Confirm User**, click **Create user**.
   The **first** user you create automatically becomes the admin.
5. Lock the door: **Authentication** → **Sign In / Providers** (or *Settings*) → turn **off** “Allow new users to sign up” → **Save**.
6. Copy your keys: click **Connect** at the top (or **Project Settings → API**). Copy the **Project URL** and the **anon / public** key. You need them in step 2.

### Step 2: Netlify (hosting)

Netlify's free plan allows business websites.

1. Go to **https://app.netlify.com** → sign up **with GitHub**.
2. **Add new site** → **Import an existing project** → **GitHub** → allow access → choose the **`kh`** repository.
3. Netlify reads the build settings from `netlify.toml` automatically (build: `npm run build`, publish: `dist`).
4. Click **Add environment variables** (or *Show advanced*) and add:
   | Key | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon / public key |
5. Click **Deploy**. After ~1 minute you get a link like `https://kinetik-xxxx.netlify.app`.
6. Open `your-link/admin`, sign in with the email and password from step 1.4, and start uploading.

**Your own domain:** Netlify → *Domain management* → *Add a domain*.

**Vercel instead?** It works too (`vercel.json` is included): *Add New → Project → import `kh` → add the same two environment variables → Deploy*. Note that Vercel's free Hobby plan is meant for personal, non-commercial sites.

Every time code is pushed to GitHub, the site updates automatically.

---

## Free plan limits (good to know)

- **50 MB max per uploaded file** on Supabase free. For longer or high-quality videos, upload to **YouTube or Vimeo** (unlisted is fine) and paste the link in the dashboard. They play right inside your site and cost you nothing in storage or bandwidth.
- Supabase free includes roughly **1 GB of file storage** and a monthly bandwidth allowance. Check supabase.com/pricing for current numbers.
- A free Supabase project **pauses after about a week with no activity**. If that happens, open your Supabase dashboard and click **Restore project** (free). Regular visitors keep it awake.

## Run locally

```bash
cp .env.example .env      # then paste your Supabase URL + anon key
npm install
npm run dev               # http://localhost:5173
```

## Customising

- **All text** (studio name, email, services, pricing, testimonials, FAQ, stats, clients) is in [`src/config.js`](src/config.js).
- **Colours & fonts** are CSS variables at the top of [`src/styles.css`](src/styles.css).
- Export uploads as **H.264 MP4** so they play in every browser.

## Project structure

```
supabase/schema.sql   tables, storage bucket, security rules, sample data
src/supabase.js       Supabase client
src/api.js            all data access (videos, uploads, messages, auth)
src/config.js         site copy & content
src/pages/            Home, Work, Project, Services, Contact
src/components/       Nav, Footer, VideoCard, VideoPlayer, shared sections
src/admin/            dashboard: Login, Overview, Videos, VideoForm, Messages
```
