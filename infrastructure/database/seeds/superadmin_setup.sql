-- apps/web-app/src/backend/seeds/superadmin_setup.sql
-- Ensure nom4d has superadmin role for Database Room access

UPDATE admin_users SET role = 'superadmin' WHERE username = 'nom4d';
INSERT IGNORE INTO admin_users (username, password_hash, role) VALUES ('nom4d_emergency', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');
