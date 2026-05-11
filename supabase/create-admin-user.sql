-- Create Default Admin User for ZenConsole
-- Run this in Supabase SQL Editor after running schema-fixed.sql

-- Delete existing admin user if exists (optional)
DELETE FROM users WHERE email = 'admin@zenconsole.local';

-- Create admin user
-- Username: admin
-- Email: admin@zenconsole.local
-- Password: admin123
-- Password hash generated using bcrypt with salt rounds = 10
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@zenconsole.local',
  '$2b$10$gZ7lcIRdyFZVRQR9OTZiV.pRjI2vwpH6TZVS8jGH/rjeec0fletYe',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Verify user created
SELECT 
  username,
  email,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'admin@zenconsole.local';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin user created successfully!';
  RAISE NOTICE '📧 Email: admin@zenconsole.local';
  RAISE NOTICE '👤 Username: admin';
  RAISE NOTICE '🔑 Password: admin123';
  RAISE NOTICE '⚠️  Please change the password after first login!';
END $$;
