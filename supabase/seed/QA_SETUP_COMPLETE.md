# Phase-2 QA Setup Complete ✅

## What's Been Seeded

### 1. Course ✅
- **Title**: Forklift Operator Certification (BETA)
- **Slug**: `forklift`
- **Price**: $59.00
- **Stripe Price ID**: `price_1RSHWVHJI548rO8Jf9CJer6y`
- **Description**: Placeholder course used for UX, QA, and SEO prototyping

### 2. Modules ✅
5 modules with:
- **Video**: Public Mux demo video (`https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8`)
- **Quizzes**: 2 questions per module
- **Titles**: Sample Module 1-5

### 3. Test User & Enrollment ✅
- **Email**: `flatearthequip@gmail.com`
- **User ID**: `3ee07adb-4a22-444b-8484-c4d747560824`
- **Order ID**: `517aed1d-34b9-42d9-bcc7-270e5e31e989`
- **Progress**: 0% (ready to start)

### 4. Evaluation PDF ✅
- **URL**: `/evaluation.pdf`
- **Content**: 10-point practical evaluation checklist

## How to Test

### 1. Login to Dashboard
1. Go to https://www.flatearthequipment.com/login
2. Use credentials for `flatearthequip@gmail.com`
3. Navigate to `/dashboard`

### 2. Test Learning Flow
1. Watch demo videos for each module
2. Take the 2-question quizzes
3. Progress bar should update after each module
4. Complete all 5 modules to reach 100%

### 3. Certificate Generation
- Upon 100% completion, a PDF certificate will be generated
- Certificate includes QR code for verification
- Valid for 3 years from completion date

### 4. Verification
- Certificate QR codes link to `/verify/[certId]`
- Shows certificate validity and holder information

## Stripe Test Mode
- Product ID: `prod_SN1ZkgXgXGdfLs`
- Price ID: `price_1RSHWVHJI548rO8Jf9CJer6y`
- Use Stripe test cards for checkout testing

## Database State
All data is in Supabase:
- `courses` table: 1 forklift course
- `modules` table: 5 modules with quizzes
- `orders` table: 1 test order
- `enrollments` table: 1 test enrollment (0% progress)

---

Last seeded: May 24, 2025
Scripts used:
- `seedStubModules.ts`
- `seedStripeCourse.ts`
- `createTestEnrollment.ts` 