# Yardvision

> Upload a photo of your yard. Pick a style. Get back an AI-redesigned landscape — house left untouched.

A full-stack web app that turns a single photo of an unloved yard into a portfolio-quality landscape redesign across five distinct styles (Modern, Japanese Zen, Tropical, Mediterranean, Xeriscape / Desert). Built as a personal project to explore image-to-image generative AI in a real product context — including the unglamorous parts: API cost control, abuse prevention, and prompt engineering that survives contact with real users.

<!-- TODO: add a before/after screenshot. Save as docs/before-after.png and uncomment the line below. -->
<!-- ![Yardvision before-and-after screenshot](docs/before-after.png) -->

## Live demo

**Try it:** <https://nivedita-yardvision.vercel.app>

## What it does

1. **Upload** a photo of your front or back yard (JPG / PNG / WebP, up to 5 MB).
2. **Pick a style** from five landscape archetypes and optionally add a free-text nudge (e.g., "include a fire pit").
3. **Get a redesign** rendered by FLUX.1 Kontext in roughly 15 seconds — the house, driveway, and property lines stay pixel-faithful to your photo; only the plants, hardscape, and landscape lighting change.

You can keep clicking "Try another style" to flip through redesigns on the same photo without re-uploading.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 14 (App Router + Pages Router hybrid) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Image model | FLUX.1 Kontext [pro] via [fal.ai](https://fal.ai) |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` (sliding window) |
| Bot protection | Cloudflare Turnstile |
| Hosting | Vercel |

## Architecture highlights

**Server-side API key isolation.** The fal.ai key never touches the browser. The original prototype exposed it as `NEXT_PUBLIC_FAL_KEY`; that was the first thing fixed when reviving the project. All generation calls go through `/api/generate`, which holds the credential and proxies fal.

**Layered abuse prevention.** A public demo with a paid AI backend is an open invoice waiting to be cashed. Three layers cap exposure:

- **Cloudflare Turnstile** blocks scripted clients before they can hit the model.
- **Per-IP rate limit** (5 generations / hour) protects against a single attacker grinding through credits.
- **Site-wide global limit** (100 generations / day) is the last line of defense against distributed botnets — it caps worst-case daily fal spend below $4 (100 × $0.04 per image).

Rate limiting auto-disables in development (`NODE_ENV !== "production"`) so local iteration isn't throttled.

**Prompt engineering for image-to-image fidelity.** FLUX.1 Kontext is powerful but happily redesigns the house along with the landscape if you ask it for "dramatic" changes. Each style prompt is structured as a **sandwich**: a strong architectural preservation clause (listing windows, siding, paint, roof, trim, doors, etc.) wraps both the opening *and* closing of the prompt, so the model gets the "don't touch the house" signal in both high-weight positions. The creative hero description — concrete species, lighting, and a photographic quality cue — lives in the middle and end.

**Honest UX over knobs.** An early version exposed a "How dramatic?" guidance slider. Testing showed users always pushed it to max, so the knob was removed and the backend now hardcodes guidance to the maximum value, leaning on prompt structure (not parameters) to keep the house in place.

## Local development

You'll need Node 20+ and a free fal.ai account.

```bash
git clone https://github.com/niveditapatil/yardvision.git
cd yardvision
npm install
cp .env.example .env.local
# Then edit .env.local and paste a FAL_KEY from https://fal.ai/dashboard/keys
npm run dev
```

Open <http://localhost:3000>.

In dev, Upstash and Turnstile are optional — leave their env vars blank and the app skips both. For production they're recommended (see `.env.example`).

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.example` to the Vercel project (`FAL_KEY` is required; the Upstash and Turnstile pairs are strongly recommended for prod).
4. Deploy. Add the production hostname to your Turnstile widget's allowlist on the Cloudflare dashboard.

## Roadmap

The current UI surfaces these as "coming soon" cards on the landing page:

- **User accounts** for saving and revisiting designs
- **HD render payments** for higher-resolution outputs
- **Contractor marketplace** to connect with local landscapers
- **Regional plant suggestions** that adapt species lists to a user's climate zone

## Project history

This repo started as a Cursor-built prototype in October 2024 and sat on localhost for over a year. It was revived and rebuilt in 2026 with focus on: production hardening, prompt-engineering quality, a streamlined three-step user flow (down from the original eight), and a public deployment story.

The `src/pages/api/get-signed-url.ts` route is archived from the original Theme Portfolio gallery (S3 + STS AssumeRole) and is no longer referenced by the UI; left in place in case the gallery is restored later.

## License

MIT — see [LICENSE](LICENSE) if you'd like to reuse this for your own portfolio project.
