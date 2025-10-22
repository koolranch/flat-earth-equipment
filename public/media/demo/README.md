# Demo Media Placeholders

## Required Assets

Replace these placeholder files with actual media:

### poster.jpg
- **Size:** 1200×800 pixels
- **Format:** JPEG
- **Max size:** <150 KB
- **Content:** Screenshot from forklift training showing a key feature or UI
- **Alt text:** "Forklift training demo (poster)"

### hero-demo.webm
- **Duration:** ~20 seconds
- **Format:** WebM (VP9 codec recommended)
- **Max size:** <1.5 MB
- **Resolution:** 1280×720 or 1920×1080
- **Content:** Quick overview of training platform features
- **Audio:** Optional (muted autoplay on desktop)

### hero-demo.mp4
- **Duration:** ~20 seconds
- **Format:** MP4 (H.264 codec for compatibility)
- **Max size:** <2 MB
- **Resolution:** 1280×720 or 1920×1080
- **Content:** Same as WebM (fallback for browsers without WebM support)
- **Audio:** Optional (muted autoplay on desktop)

## Encoding Tips

**For WebM:**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 200k -c:a libopus -b:a 64k -vf scale=1280:720 hero-demo.webm
```

**For MP4:**
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 28 -c:a aac -b:a 64k -vf scale=1280:720 hero-demo.mp4
```

## Usage

These files are referenced in:
- `components/DemoVideo.tsx`
- `components/HeroCTAs.tsx`
- `app/safety/page.tsx` (JSON-LD schema)

