# Demo Video Capture Pipeline

Automated browser recording system to generate demo videos and screenshots for the `/safety` page.

## Overview

This pipeline uses Playwright to record browser interactions with the training UI and FFmpeg to compress the output into web-optimized formats.

## Prerequisites

Dependencies are already installed:
- `@playwright/test` - Browser automation
- `ffmpeg-static` - Video encoding
- `execa` - Process execution
- `tsx` - TypeScript execution

## Usage

### 1. Start the dev server

```bash
npm run dev
```

### 2. Run the capture (in a new terminal)

```bash
npm run demo:capture
```

This will:
1. Launch Chromium browser (visible)
2. Navigate to Module 1 training
3. Add a "DEMO" watermark
4. Perform interactions:
   - Click through tabs (Video, Flash Cards, Practice)
   - Reveal flashcard answers
   - Scroll to show UI elements
5. Capture poster screenshot
6. Record ~20 seconds of video
7. Encode to WebM (VP9) and MP4 (H.264)

### Outputs

All files are saved to `public/media/demo/`:
- `poster.jpg` - Screenshot for mobile modal (~1200×800, <150 KB)
- `hero-demo.webm` - Primary video format (VP9, <1.5 MB)
- `hero-demo.mp4` - Fallback video format (H.264, <2 MB)

## Customization

### Different module or route

Set the `DEMO_ORIGIN` environment variable:

```bash
DEMO_ORIGIN="http://localhost:3000" npm run demo:capture
```

Edit `DEMO_URL` in `scripts/capture-demo.ts` to change the target route:

```typescript
const DEMO_URL = `${ORIGIN}/training/module-2?demo=1`;
```

### Interaction sequence

Modify the interaction selectors in `scripts/capture-demo.ts`:

```typescript
// Find different tabs
const customTab = page.getByRole("tab", { name: /Your Tab Name/i });

// Click different buttons
const customBtn = page.getByRole("button", { name: /Button Text/i });
```

### Video duration

Change the timeout value (in milliseconds):

```typescript
await page.waitForTimeout(30000); // 30 seconds instead of 20
```

### Compression settings

Adjust FFmpeg parameters in `scripts/capture-demo.ts`:

```typescript
// More aggressive compression (smaller file)
"-crf", "36"  // Higher CRF = more compression

// Less compression (better quality)
"-crf", "28"  // Lower CRF = less compression
```

## Troubleshooting

### Browser doesn't launch

```bash
npx playwright install chromium
```

### FFmpeg not found

The `ffmpeg-static` package should provide it automatically. If issues persist:

```bash
brew install ffmpeg  # macOS
```

### Module not loading

1. Ensure dev server is running on `localhost:3000`
2. Check that the training route is accessible
3. Verify authentication isn't required for `?demo=1` flag

### Video too large

Increase compression in the script:
- WebM: Increase `-crf` value (34 → 38)
- MP4: Increase `-crf` value (28 → 32)

### Poster image too large

Decrease quality in `page.screenshot()`:

```typescript
quality: 60  // Lower = more compression
```

## Technical Details

### Recording Format

Playwright records in Chromium's native VP9/WebM format at the specified viewport size (1280×720).

### Encoding Pipeline

1. **Raw capture** - Playwright → `.webm` (VP9)
2. **WebM optimization** - FFmpeg re-encodes with CRF 34 for size
3. **MP4 fallback** - FFmpeg transcodes to H.264 for browser compatibility

### Size Targets

- Poster: <150 KB (JPEG quality 70)
- WebM: <1.5 MB (VP9 CRF 34)
- MP4: <2 MB (H.264 CRF 28)

## Integration

These files are used by:
- `components/DemoVideo.tsx` - Video player component
- `components/HeroCTAs.tsx` - Hero section CTAs
- `app/safety/page.tsx` - JSON-LD schema

After generating new assets, commit and push to deploy:

```bash
git add public/media/demo/
git commit -m "Update demo video assets"
git push origin main
```

