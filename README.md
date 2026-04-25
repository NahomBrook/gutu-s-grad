# 🎓 Dr. Gutu Amanuel — Graduation Celebration Website

A premium, dark-gold themed graduation celebration website with photo gallery,
guestbook, upload, slideshow, and more.

---

## Folder Structure

```
graduation-website/
├── public/
│   ├── images/          ← Add real photos here
│   └── audio/
│       └── background.mp3  ← Optional background music
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Gallery.jsx
│   │   ├── Upload.jsx
│   │   ├── Guestbook.jsx
│   │   ├── Highlights.jsx
│   │   ├── Slideshow.jsx
│   │   ├── Share.jsx
│   │   ├── Footer.jsx
│   │   ├── MusicToggle.jsx
│   │   └── Toast.jsx
│   ├── App.jsx          ← Root component
│   ├── data.js          ← Edit gallery images, timeline, etc.
│   ├── index.css        ← All styles
│   └── main.jsx
├── index.html
└── package.json
```

---

## Step-by-Step Setup (Beginner Friendly)

### Step 1 — Install Node.js

If you don't have Node.js:
1. Go to https://nodejs.org
2. Download the **LTS** version and install it
3. Verify: open a terminal and type `node --version` (should show a number)

### Step 2 — Open a Terminal in the Project Folder

- **Mac**: Right-click the `graduation-website` folder → "Open Terminal Here"
  (or open Terminal, then type `cd ~/Desktop/graduation-website`)
- **Windows**: Right-click inside the folder → "Open in Terminal"

### Step 3 — Install Dependencies (one time only)

```bash
npm install
```

Wait for it to finish (may take 1–2 minutes).

### Step 4 — Start the Website

```bash
npm run dev
```

You'll see something like:
```
VITE ready in 1.2s
➜ Local: http://localhost:5173/
```

Open that URL in your browser. The website is live!

---

## Adding Real Photos

1. Copy your graduation photos into the `public/images/` folder
2. Open `src/data.js`
3. Find the `GALLERY_IMAGES` array near the top
4. For each image, change `realSrc: null` to the file path:

```js
// Before:
{ id: 1, category: 'ceremony', label: 'The Big Moment', realSrc: null, ... }

// After (if you added ceremony1.jpg to public/images/):
{ id: 1, category: 'ceremony', label: 'The Big Moment', realSrc: '/images/ceremony1.jpg', ... }
```

5. Save the file — the browser updates automatically!

**Tip**: You can add as many images as you want. Just add more entries to the array.

---

## Adding Background Music

1. Get an MP3 file (any instrumental music)
2. Rename it to `background.mp3`
3. Place it in `public/audio/`
4. Click the 🎵 music button on the website

---

## Customising the Content

All customisable content lives in these files:

| What to change           | File to edit               |
|--------------------------|----------------------------|
| Name, date, tagline      | `src/components/Hero.jsx`  |
| Gallery photos & labels  | `src/data.js`              |
| Timeline events & years  | `src/data.js` → `TIMELINE` |
| Slideshow slides         | `src/data.js` → `SLIDES`   |
| Stats numbers (6yrs etc) | `src/components/Highlights.jsx` → `STATS` |
| Footer text              | `src/components/Footer.jsx`|
| Colours & fonts          | `src/index.css` → `:root`  |

---

## Publishing Online (Free, No Code Needed)

### Option A — Netlify (Easiest)

1. Build the site: `npm run build` (creates a `dist/` folder)
2. Go to https://netlify.com and sign up (free)
3. Drag and drop the entire `dist/` folder onto Netlify
4. Get a free link like `gutu-graduation.netlify.app`
5. Share the link with family!

### Option B — GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages → Deploy from `dist/` branch
3. Get a free URL

---

## Photo Upload Feature

- The **Upload** section lets visitors drag-and-drop their own photos
- Uploaded photos appear in the **Community Gallery** instantly
- Photos are stored in the browser session (visible to that visitor)
- For photos to be saved permanently for ALL visitors, you need Firebase:
  - Create a free project at https://firebase.google.com
  - Enable Storage and Firestore
  - Replace `sessionStorage` calls in `Upload.jsx` with Firebase Storage

---

## Guestbook

Messages written in the Guestbook are saved in `localStorage` — they persist
across page refreshes for the same visitor. Three default messages are shown
when no messages have been added yet.

---

## Tech Stack

- **React 19** + **Vite** — fast, modern dev setup
- **Framer Motion** — smooth animations
- **Swiper** — touch-friendly slideshow
- **yet-another-react-lightbox** — full-screen photo viewer
- **react-dropzone** — drag-and-drop file uploads
- **canvas-confetti** — celebration confetti on first visit
- **lucide-react** — clean icons

---

Made with ❤️ for Gutu Amanuel — May 10, 2026
