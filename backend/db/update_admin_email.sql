-- Update admin email to admin@shopstack.com
-- Run this against the shopstack PostgreSQL database as a privileged user.

BEGIN;

-- Optional: inspect current admin users
SELECT id, username, email, role FROM users WHERE role = 'ADMIN';

-- Update all users with role ADMIN to the new email (if you expect a single admin, this changes all ADMIN accounts)
UPDATE users
SET email = 'admin@shopstack.com'
WHERE role = 'ADMIN';

-- If you only want to update a single admin by id or by a previous email, replace the WHERE clause accordingly.

COMMIT;
