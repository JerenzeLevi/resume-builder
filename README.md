# Resume Creator

A clean, professional resume builder. Fill in your details on the left, watch a live preview on the right, and export straight to PDF — no account, no backend, your data stays in your browser (`localStorage`).

## Features

- Sections for personal info, summary, experience, education, skills, and projects
- Reorder / add / remove entries freely
- Six accent color themes
- One-click **Download PDF** (uses the browser's print-to-PDF, styled for a clean letter-size page)
- Autosaves to `localStorage` — refresh-safe, nothing leaves your machine
- "Load sample" to see a filled-out example, "Clear" to start fresh

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npm i -g vercel   # one-time install
vercel            # preview deploy
vercel --prod     # production deploy
```

Or import the repo at [vercel.com/new](https://vercel.com/new) — no environment variables or database required.
