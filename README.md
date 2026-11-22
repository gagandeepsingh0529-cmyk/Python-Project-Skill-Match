# SkillMatch — Netlify edition

A student career skill-gap demo built with a static HTML/CSS/JavaScript frontend, Netlify Functions, and Netlify Blobs for persistent profile and assessment storage.

## Features
- Student profile registration (no password; this is a classroom demo)
- Six predefined career paths
- Skill matching with matched and missing skills
- Dashboard with latest assessment
- Assessment history
- Persistent JSON profile records using a site-wide Netlify Blobs store in Singapore (`ap-southeast-1`)

## Deploy to your existing Netlify site

1. Replace the old project files with the contents of this folder. Keep the repository name and your existing Netlify site.
2. Commit and push the changes to the same GitHub `main` branch.
3. In Netlify, open **Project configuration → Build & deploy → Continuous deployment → Build settings** (labels may vary) and set:
   - Base directory: leave blank
   - Build command: leave blank
   - Publish directory: `public`
   - Functions directory: `netlify/functions` (usually read from `netlify.toml`)
4. Trigger a new deploy, or wait for the automatic deploy after the GitHub push.
5. Open the site URL. Register a profile, run an analysis, then refresh the page to confirm the profile and assessment still load.

`netlify.toml` already declares the publish and Functions directories. No `SECRET_KEY` or external database credentials are required for this version; Netlify Blobs credentials are supplied automatically inside Netlify Functions.

## Local development (optional)

Requires Node.js 18+.

```bash
npm install
npx netlify dev
```

Open the local URL printed by Netlify CLI. Local Blobs storage is sandboxed and separate from production data.

## Important demo limitations
- This is a learning/demo application, not a secure account system. There are no passwords or email verification. Do not enter sensitive personal information.
- Netlify Blobs is simple key-value JSON storage, not a relational database. It is suitable for this small demonstration; for high-concurrency or transactional production use, use a managed database.
- Skill requirements are illustrative project data, not professional career certification criteria.
