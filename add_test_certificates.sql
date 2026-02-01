-- Add test certificates for enterprise users to verify score display
-- Safe: Only adds certificate records, doesn't modify enrollments

-- Step 1: See which enterprise users have completed training (passed = true)
SELECT 
  e.user_id,
  p.email,
  e.progress_pct,
  e.passed,
  e.course_id,
  c.title as course_title
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
JOIN courses c ON e.course_id = c.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
  AND e.passed = true;

-- Step 2: Check if certificates already exist for these users
SELECT 
  cert.learner_id,
  p.email,
  cert.score,
  cert.issue_date,
  cert.verifier_code
FROM certificates cert
JOIN profiles p ON cert.learner_id = p.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com';

-- Step 3: Add test certificates for completed users (if they don't have one)
-- enterprise-admin: 92% score
-- enterprise-owner: 88% score

INSERT INTO certificates (learner_id, course_id, score, verifier_code, issue_date)
SELECT 
  e.user_id,
  e.course_id,
  CASE 
    WHEN p.email = 'enterprise-admin@flatearthequipment.com' THEN 92
    WHEN p.email = 'enterprise-owner@flatearthequipment.com' THEN 88
    ELSE 85
  END as score,
  'TEST-' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 8)) as verifier_code,
  CURRENT_DATE as issue_date
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
WHERE p.email IN ('enterprise-admin@flatearthequipment.com', 'enterprise-owner@flatearthequipment.com')
  AND e.passed = true
  AND NOT EXISTS (
    SELECT 1 FROM certificates c 
    WHERE c.learner_id = e.user_id 
    AND c.course_id = e.course_id
  );

-- Step 4: Verify the certificates were created
SELECT 
  cert.learner_id,
  p.email,
  cert.score,
  cert.issue_date,
  cert.verifier_code
FROM certificates cert
JOIN profiles p ON cert.learner_id = p.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ORDER BY cert.score DESC;
