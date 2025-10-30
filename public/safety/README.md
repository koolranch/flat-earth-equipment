# Safety Landing Page Screenshots

This directory contains product screenshots displayed on the `/safety` landing page.

## Required Images

Place the following three images in this directory:

1. **dashboard.jpg** (1200x900 pixels, ~120KB)
   - Shows the training dashboard with modules and progress
   - Alt text: "Training dashboard showing modules and progress"

2. **module.jpg** (1200x900 pixels, ~120KB)
   - Shows an interactive flashcard module with reveal answer and quiz buttons
   - Alt text: "Interactive flashcard module with reveal answer and quiz buttons"

3. **certificate.jpg** (1280x720 pixels, ~130KB)
   - Shows the exam passed screen with Download Certificate and Wallet Card buttons
   - Alt text: "Exam passed screen with Download Certificate and Wallet Card buttons"

## Image Specifications

- **Format**: JPEG (optimized for web)
- **Quality**: ~80% compression
- **Max file size**: <150KB each
- **Aspect ratios**: 
  - dashboard.jpg: 4:3
  - module.jpg: 4:3
  - certificate.jpg: 16:9

## Implementation Notes

- Images are loaded using Next.js Image component with automatic optimization
- Lazy loading is enabled (priority=false) to avoid blocking page load
- Responsive sizing: full width on mobile, 2-column grid on desktop
- Certificate image spans full width on desktop for better visibility
- All images include descriptive alt text for accessibility

## Rollback

To hide the screenshot section, set `showScreenshots = false` in `/app/safety/page.tsx` (line 75).

