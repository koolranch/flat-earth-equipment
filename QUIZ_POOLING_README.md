# Quiz Pooling System

This document describes the quiz pooling system that provides API routes for starting/finishing quiz attempts and enables retry functionality for incorrect answers.

## Overview

The quiz pooling system consists of:

1. **Database Layer**: `quiz_attempts` table with RLS policies
2. **Server Helpers**: Functions for starting/finishing attempts with pool sampling
3. **API Routes**: REST endpoints for quiz attempt management
4. **UI Components**: Updated Quiz component with retry functionality

## API Routes

### Start Quiz Attempt

**POST** `/api/quiz/attempts/start`

Starts a new quiz attempt with question pooling and sampling.

```typescript
// Request Body
{
  courseId?: string;     // Optional course UUID
  moduleId?: string;     // Optional module UUID  
  poolIds: string[];     // Array of question IDs to sample from
  take: number;          // Number of questions to include
  mode?: 'full' | 'retry'; // Quiz mode (default: 'full')
  retryIds?: string[];   // Question IDs for retry mode
}

// Response
{
  attemptId: string;     // UUID of the created attempt
  order: string[];       // Sampled question IDs in random order
}
```

### Finish Quiz Attempt

**POST** `/api/quiz/attempts/finish`

Finishes a quiz attempt and calculates the score.

```typescript
// Request Body
{
  attemptId: string;     // UUID of the attempt to finish
  correctIds: string[];  // Array of question IDs answered correctly
}

// Response
{
  score: number;         // Final score (0-100)
  incorrect: string[];   // Array of incorrect question IDs
  passed: boolean;       // Whether the attempt passed (≥80%)
}
```

## Quiz Component Integration

The `QuizModal` component has been updated to integrate with the pooling system:

### Key Features

1. **Automatic Pooling**: Questions are automatically sampled when the quiz starts
2. **Retry Functionality**: Failed quizzes offer "Review Incorrect" option
3. **Loading States**: Proper loading indicators during API calls
4. **Error Handling**: Graceful fallback to original behavior

### Usage Flow

```typescript
// 1. Quiz initializes and calls start attempt API
const { attemptId, order } = await fetch('/api/quiz/attempts/start', {
  method: 'POST',
  body: JSON.stringify({ moduleId, poolIds, take, mode: 'full' })
});

// 2. Questions are reordered according to sampled order
const orderedQuestions = order.map(id => questionById[id]);

// 3. User completes quiz, finish attempt API is called
const result = await fetch('/api/quiz/attempts/finish', {
  method: 'POST', 
  body: JSON.stringify({ attemptId, correctIds })
});

// 4. If failed, user can retry with only incorrect questions
if (result.incorrect?.length) {
  // Show "Review Incorrect" button that starts retry mode
}
```

## Database Schema

The quiz attempts are stored in the `quiz_attempts` table:

```sql
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  course_id uuid references courses(id),
  module_id uuid references modules(id),
  mode text check (mode in ('full','retry')) default 'full',
  seed text not null,
  question_ids jsonb not null default '[]'::jsonb,
  incorrect_ids jsonb not null default '[]'::jsonb,
  correct_count int not null default 0,
  total_count int not null default 0,
  score numeric not null default 0,
  passed boolean,
  created_at timestamptz not null default now()
);
```

## Server Helpers

### `startAttempt(input)`

- Generates random seed for reproducible shuffling
- Samples questions from pool (full mode) or uses retry IDs (retry mode)
- Creates database record with attempt details
- Returns attempt ID and question order

### `finishAttempt(attemptId, correctIds)`

- Calculates score based on correct answers
- Determines pass/fail status (80% threshold)
- Updates database with final results
- Returns score, incorrect IDs, and pass status

## Testing

Run the test suite to verify functionality:

```bash
# Start development server
npm run dev

# Run quiz pooling tests
tsx test-quiz-pooling.ts
```

## Error Handling

The system includes comprehensive error handling:

- **API Validation**: Zod schemas validate request bodies
- **Database Errors**: Proper error messages for DB failures  
- **Network Issues**: Graceful fallback in UI components
- **Authentication**: RLS policies ensure user-scoped access

## Security

- **Row Level Security**: Users can only access their own attempts
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Parameterized queries only
- **CSRF Protection**: Next.js built-in CSRF protection

## Performance

- **Efficient Sampling**: O(n) shuffling algorithm
- **Minimal DB Queries**: Single insert/update per attempt
- **Client-side Caching**: Questions cached during quiz session
- **Optimistic Updates**: UI updates immediately with server sync
