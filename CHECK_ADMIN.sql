-- Check which users are admins
SELECT id, email, "firstName", "lastName", "isAdmin", "accountStatus", "kycStatus"
FROM users
ORDER BY "createdAt" ASC;

-- If you need to make a user an admin, run this (replace the email):
-- UPDATE users SET "isAdmin" = true WHERE email = 'your-admin-email@example.com';

-- Check if the admin user exists
SELECT COUNT(*) as admin_count FROM users WHERE "isAdmin" = true;
