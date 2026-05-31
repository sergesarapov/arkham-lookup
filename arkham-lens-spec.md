# ArkhamLens — Claude Code Spec

## What We're Building

**ArkhamLens** is a mobile-first PWA that uses the phone camera to read the collector number off a Spanish-edition Arkham Horror LCG card and displays the English card text fetched from ArkhamDB. The use case: sitting at the table with a Spanish campaign box, quickly looking up what a card actually does.

---

## Core User Flow

1. User opens the app on their phone
2. Selects the campaign/pack from a dropdown (e.g. "The Forgotten Age") — this sets the cycle prefix
3. Points camera at a card
4. App reads the short collector number (e.g. `36`)
5. App constructs the full ArkhamDB code: cycle prefix + zero-padded number (e.g. `04` + `036` = `04036`)
6. Fetches card data from ArkhamDB public API
7. Displays the English card name, traits, and rules text

---

## Tech Stack

- **React 18** with **TypeScript** — mandatory, all files `.tsx` / `.ts`, no `.js` or `.jsx`
- **Vite** — scaffolded with `npm create vite@latest arkham-lens -- --template react-ts`
- **Tesseract.js** — in-browser OCR, no API key needed
- **ArkhamDB public API** — free, no auth required
- **Tailwind CSS** — for styling
- No backend needed, fully client-side

### TypeScript requirements
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- No `any` types — model all ArkhamDB API responses with explicit interfaces (see `src/types/arkhamdb.ts`)
- All props typed with interfaces, not inline objects
- All hooks have explicit return types

---

## ArkhamDB API

Base URL: `https://arkhamdb.com/api/public`

### Fetch card by code
```
GET https://arkhamdb.com/api/public/card/{code}
```
Returns JSON with full card data.

### Card code format
5-digit string used internally by ArkhamDB:
- First 2 digits: cycle/pack code (zero-padded)
- Last 3 digits: card position within the pack (zero-padded)

**Physical cards only print the last 2-3 digits** (e.g. `36`) alongside a set symbol. The cycle prefix is NOT printed on the card — the user selects it via the pack dropdown.

Construct the full code in code:
```js
const fullCode = cyclePrefix + String(cardNumber).padStart(3, '0');
// e.g. "04" + "036" = "04036"
```

Examples:
- `04036` — The Forgotten Age, card 36
- `01001` — Core Set, card 1

### Key response fields to display
```json
{
  "code": "04023",
  "name": "The Untamed Wilds",
  "type_name": "Location",
  "traits": "Jungle.",
  "text": "Forced - After you fail a skill test while exploring...",
  "flavor": "...",
  "pack_name": "The Forgotten Age"
}
```

Full field reference: https://arkhamdb.com/api/public/card/01001

### TypeScript types (`src/types/arkhamdb.ts`)
```ts
export interface ArkhamCard {
  code: string;
  name: string;
  type_name: string;
  traits: string | null;
  text: string | null;
  flavor: string | null;
  pack_name: string;
  faction_name: string;
}

export interface ArkhamPack {
  code: string;
  name: string;
  cycle_code: string;
  position: number;
}
```

---

## Camera & OCR Implementation

### Camera
Use `getUserMedia` with rear camera preference:
```ts
const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
```

Display the live stream in a `<video>` element.

### Capture
Add a capture button. On press:
1. Draw current video frame to a `<canvas>`
2. Crop to the number region (see below)
3. Pass cropped image data to Tesseract

### Cropping strategy
The collector number on AHLCG cards is printed in the **bottom-right area** of the card. Crop roughly the bottom-right 20% of the captured frame for OCR — this reduces noise and improves accuracy significantly.

Consider adding a **card alignment overlay** on the viewfinder: a rectangle guide the user positions the card into, so the crop region is predictable.

### Tesseract.js config
```ts
import { createWorker, Worker } from 'tesseract.js';

const worker: Worker = await createWorker('eng');
await worker.setParameters({
  tessedit_char_whitelist: '0123456789', // digits only
});
const { data: { text } } = await worker.recognize(croppedCanvas);
const cardNumber = parseInt(text.trim().replace(/\D/g, ''), 10);
```

Whitelist digits only. The printed number is typically 2-3 digits (e.g. `36` or `136`).

### Code construction
```ts
const buildCardCode = (cyclePrefix: string, cardNumber: number): string =>
  cyclePrefix + String(cardNumber).padStart(3, '0');
```

### Validation
Before fetching, validate:
```ts
const isValidNumber = (n: number): boolean => n > 0 && n <= 999;
```

If invalid, show a "Couldn't read number — try again" message.

---

## UI Structure

```
App
├── PackSelector        — dropdown to pick campaign/pack, sets cycle prefix
├── CameraView          — live video feed + alignment overlay
│   └── CaptureButton   — triggers OCR
├── ResultCard          — displays fetched card data
│   ├── CardName
│   ├── CardMeta        — type, traits, pack name
│   ├── CardText        — rules text (main thing we want)
│   └── FlavorText      — optional, italicised
└── StatusMessage       — loading / error / "try again" states
```

---

## States to Handle

| State | UI |
|---|---|
| No pack selected | Prompt to pick a pack, camera disabled |
| Idle | Camera live, capture button visible |
| Processing | Spinner overlay, "Reading card…" |
| Fetching | Spinner, "Looking up card…" |
| Success | Result card slides up over camera |
| OCR failed | Toast: "Couldn't read number — try again" |
| API 404 | Toast: "Card not found — check the number" |
| API error | Toast: "Network error — check connection" |

---

## PWA Setup

Add these to make it installable on Android/iOS:

### `public/manifest.json`
```json
{
  "name": "ArkhamLens",
  "short_name": "ArkhamLens",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### `index.html` additions
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1a1a2e" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

A basic service worker for offline shell caching is a nice-to-have but not required for MVP.

---

## Design Direction

Mobile-first, dark theme. Arkham Horror has a strong visual identity — think aged paper, deep blacks, muted greens and yellows. Keep it atmospheric but functional:

- Dark background (`#1a1a2e` or similar deep navy/black)
- Warm amber/sepia accent for card text display
- The camera viewfinder should feel like looking through an investigator's magnifying glass — maybe a subtle vignette around the edges
- Card results should feel like pulling out a dossier — slide-up panel, slightly textured background
- Typography: something with character for card names (a serif or slab), clean sans for rules text

Avoid generic "app" aesthetics. This is a tool for a horror card game — it should feel like it belongs in Arkham.

---

## File Structure Suggestion

```
src/
├── components/
│   ├── PackSelector.tsx   — dropdown fetching packs from ArkhamDB
│   ├── CameraView.tsx
│   ├── CaptureButton.tsx
│   ├── ResultCard.tsx
│   └── StatusMessage.tsx
├── hooks/
│   ├── useCamera.ts       — getUserMedia setup/teardown → { videoRef, error }
│   ├── useOCR.ts          — Tesseract worker lifecycle → { recognize, isReady }
│   ├── usePacks.ts        — fetch + cache pack list → { packs, isLoading, error }
│   └── useArkhamDB.ts     — fetch card by code → { card, isLoading, error, fetchCard }
├── types/
│   └── arkhamdb.ts        — ArkhamCard, ArkhamPack interfaces
├── App.tsx
└── main.tsx
```

---

## Notes & Gotchas

- **Tesseract.js worker init is slow** (~1-2s). Initialise it on app load, not on first capture.
- **Camera permissions**: handle the case where user denies camera — show a clear message.
- **CORS**: ArkhamDB allows cross-origin requests, no proxy needed.
- **iOS Safari**: `getUserMedia` works but requires `playsinline` attribute on the video element, otherwise it goes fullscreen.
- **Physical card numbers are short** (2-3 digits, e.g. `36`). OCR is very reliable for this. If you get noise, try preprocessing the canvas (increase contrast, convert to grayscale) before passing to Tesseract.
- **Pack list filtering**: `GET /api/public/packs/` returns all packs including player card packs. Filter to scenario/campaign packs only — you can do this by excluding packs whose `cycle_code` is `"core"` standalone or by showing all and letting the user find theirs. Consider grouping by cycle in the dropdown.
- **Persist selected pack** in localStorage — user shouldn't have to re-select every session.

---

## MVP Scope

Must have:
- [ ] Pack selector dropdown (fetched from ArkhamDB, persisted in localStorage)
- [ ] Live camera feed
- [ ] Capture → OCR → code construction → fetch → display flow
- [ ] English card name + rules text displayed
- [ ] Basic error handling

Nice to have:
- [ ] Card alignment overlay guide
- [ ] PWA manifest (installable)
- [ ] Result history (last 5 cards)
- [ ] Manual number entry fallback (type the number if OCR fails)