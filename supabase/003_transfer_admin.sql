-- ============================================================
-- Transfer ADMIN control to: hunaredofficial@gmail.com
-- Run in Supabase → SQL Editor → Run
-- ============================================================

-- 1) See current admins
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at;

-- 2) Demote ALL existing admins → personal (safe default)
UPDATE profiles
SET role = 'personal',
    updated_at = now()
WHERE role = 'admin';

-- 3) Promote the new official admin email
--    (account must already exist — sign up first with this email)
UPDATE profiles
SET role = 'admin',
    updated_at = now()
WHERE lower(trim(email)) = lower('hunaredofficial@gmail.com');

-- 4) Verify
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE lower(trim(email)) = lower('hunaredofficial@gmail.com')
   OR role = 'admin';

-- If step 4 shows 0 rows for hunaredofficial@gmail.com:
--   → that email has no profile yet.
--   Sign up at https://hunared.com/register with hunaredofficial@gmail.com
--   then run ONLY step 3 + 4 again.
