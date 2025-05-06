-- Seed data for parts table
INSERT INTO parts (slug, name, description, price, category, brand) VALUES
  ('test-part-001', 'Test Part 001', 'A sample test part', 9.99, 'controllers', 'Curtis'),
  ('test-part-002', 'Test Part 002', 'Another sample part', 19.95, 'controllers', 'Bobcat');

-- Verify insertion
SELECT count(*) AS total FROM parts; 