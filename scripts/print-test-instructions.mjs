// scripts/print-test-instructions.mjs
const base = process.env.BASE_URL || 'http://localhost:3000';
console.log(`
✅ The tests are now ready! When you want to run them:

1) Start your dev server:
   npm run dev

2) Run the tests (set BASE_URL if needed):
   BASE_URL=${base} npm test

The tests will validate that your analytics events are firing correctly across all major interactive components! 🎯
`);
