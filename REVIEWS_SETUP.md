# Google Reviews (Real) — Setup

This patch adds:
- `src/pages/api/reviews.json.ts`  (server endpoint; cached 6h)
- `src/components/GoogleReviews.astro` (UI + schema markup)
- `.env.example`

## 1) Create `.env` in project root

Copy `.env.example` -> `.env` and set:

- GOOGLE_PLACES_API_KEY=...
- GOOGLE_PLACE_ID=ChIJ-QDOC_qpYw0Rs72D33b4PmA

## 2) Add Reviews section to your homepage

Edit: `src/pages/index.astro`

Add import (top):
```astro
import GoogleReviews from "../components/GoogleReviews.astro";
```

Place it between Services and Contact:
```astro
<GoogleReviews />
```

## 3) Restart dev server
Ctrl+C then:
```bash
npm run dev
```

Notes:
- Google Places returns rating + total + up to ~5 reviews (Google limitation).
- API key stays server-side (never exposed to the browser).
