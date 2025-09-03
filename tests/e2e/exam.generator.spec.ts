import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function gen(request) { 
  return await request.post(`${BASE}/api/exam/generate`, { 
    data: { locale: 'en', count: 20 } 
  }); 
}

test('exam generator responds with items+tags or 401', async ({ request }) => {
  const r = await gen(request);
  if (r.status() === 401) { 
    test.skip(true, 'unauthenticated in CI'); 
    return; 
  }
  expect(r.status()).toBe(200);
  const j = await r.json();
  expect(j.items?.length).toBeGreaterThan(0);
  expect(j.items[0]).toHaveProperty('tags');
});

test('exam generator variety - multiple calls produce different orders', async ({ request }) => {
  const r1 = await gen(request);
  if (r1.status() === 401) { 
    test.skip(true, 'unauthenticated in CI'); 
    return; 
  }
  
  const r2 = await gen(request);
  const r3 = await gen(request);
  
  expect(r1.status()).toBe(200);
  expect(r2.status()).toBe(200);
  expect(r3.status()).toBe(200);
  
  const j1 = await r1.json();
  const j2 = await r2.json();
  const j3 = await r3.json();
  
  // Basic structure checks
  expect(j1.items?.length).toBeGreaterThan(0);
  expect(j2.items?.length).toBeGreaterThan(0);
  expect(j3.items?.length).toBeGreaterThan(0);
  
  // Verify session_id and metadata exist
  expect(j1.session_id).toBeDefined();
  expect(j1.pass_score).toBeDefined();
  expect(j1.time_limit_sec).toBeDefined();
  
  // Verify items have required fields including tags
  expect(j1.items[0]).toHaveProperty('question');
  expect(j1.items[0]).toHaveProperty('choices');
  expect(j1.items[0]).toHaveProperty('tags');
  expect(Array.isArray(j1.items[0].tags)).toBe(true);
  
  // Check for variety (different question orders across calls)
  const firstQuestions = [j1.items[0].question, j2.items[0].question, j3.items[0].question];
  const uniqueFirstQuestions = new Set(firstQuestions);
  
  // At least some variety in first questions (not all identical)
  expect(uniqueFirstQuestions.size).toBeGreaterThan(1);
});

test('exam generator payload completeness', async ({ request }) => {
  const r = await gen(request);
  if (r.status() === 401) { 
    test.skip(true, 'unauthenticated in CI'); 
    return; 
  }
  
  expect(r.status()).toBe(200);
  const j = await r.json();
  
  // Top-level response structure
  expect(j).toHaveProperty('session_id');
  expect(j).toHaveProperty('pass_score');
  expect(j).toHaveProperty('time_limit_sec');
  expect(j).toHaveProperty('items');
  expect(j).toHaveProperty('meta');
  
  // Items array validation
  expect(Array.isArray(j.items)).toBe(true);
  expect(j.items.length).toBeGreaterThan(0);
  
  // Each item should have required fields
  j.items.forEach((item, index) => {
    expect(item).toHaveProperty('question');
    expect(item).toHaveProperty('choices');
    expect(item).toHaveProperty('tags');
    expect(item).toHaveProperty('difficulty');
    
    expect(typeof item.question).toBe('string');
    expect(Array.isArray(item.choices)).toBe(true);
    expect(Array.isArray(item.tags)).toBe(true);
    expect(typeof item.difficulty).toBe('number');
    
    expect(item.choices.length).toBeGreaterThan(0);
    expect(item.tags.length).toBeGreaterThan(0);
    
    // Difficulty should be reasonable range
    expect(item.difficulty).toBeGreaterThanOrEqual(1);
    expect(item.difficulty).toBeLessThanOrEqual(5);
  });
  
  // Meta should contain count
  expect(j.meta).toHaveProperty('count');
  expect(j.meta.count).toBe(j.items.length);
});
