-- Update a single admin's email to admin@shopstack.com
-- Replace :ADMIN_ID with the actual admin id or replace the WHERE clause with the previous email.
-- Run this against the shopstack PostgreSQL database after taking a backup.

BEGIN;

-- Optional: inspect the target admin first
SELECT id, username, email, role FROM users WHERE id = :ADMIN_ID;

-- Update single admin by id
UPDATE users
SET email = 'admin@shopstack.com'
WHERE id = :ADMIN_ID AND role = 'ADMIN';

-- If you prefer to update by previous email, replace WHERE clause with:
-- WHERE email = 'oldadmin@example.com' AND role = 'ADMIN';

COMMIT;
