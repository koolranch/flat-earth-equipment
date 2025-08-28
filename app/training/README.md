# Training Hub v2

Mobile-first training hub with sticky progress, 2-tap resume, and remaining steps checklist.

## Features

### 📱 Mobile-First Design
- Optimized for 320px+ width screens
- Sticky progress header with backdrop blur
- Touch-friendly buttons and navigation

### 🎯 2-Tap Resume Flow
1. User visits `/training?courseId=123`
2. User taps "Resume training" button
3. User is taken to their next module

### 📊 Progress Tracking
- Real-time progress percentage display
- Visual progress bar with brand colors
- Resume state management via `enrollments.resume_state`

### ✅ Remaining Steps Checklist
- "What's left" section shows incomplete modules
- Direct links to each remaining step
- Clear labeling for each module

## Usage

```tsx
// Access the training hub
/training?courseId=<course-uuid>

// Example
/training?courseId=550e8400-e29b-41d4-a716-446655440000
```

## API Integration

The page uses server-side data fetching:

```typescript
import { getCourseProgress } from '@/lib/learner/progress.server';

const progress = await getCourseProgress(courseId);
// Returns: { pct: number, stepsLeft: Array, next: NextStep | null }
```

## Styling

- Uses Tailwind CSS with custom brand colors
- Primary orange: `#F76511`
- Dark text: `#0F172A`
- Responsive design with mobile-first approach

## Testing

- `test-mobile.html` - Visual mobile responsiveness test
- `test-training-hub.ts` - Functional testing script

## File Structure

```
app/training/
├── page.tsx              # Main training hub component
├── test-mobile.html      # Mobile responsiveness test
├── test-training-hub.ts  # Functional tests
└── README.md            # This file
```
