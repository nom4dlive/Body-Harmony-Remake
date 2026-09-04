-- Protocol V41 Phase 2.2: admin_nudges fixes
ALTER TABLE admin_nudges
    RENAME COLUMN student_id TO licenciada_id;
-- Add admin_username if it doesn't exist (based on nudge.php usage)
-- and remove message/is_read if they are unused by the current logic
-- OR just leave them. Let's add admin_username.
ALTER TABLE admin_nudges
ADD COLUMN admin_username VARCHAR(100)
AFTER licenciada_id;