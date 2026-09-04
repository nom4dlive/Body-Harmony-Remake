-- ==============================================================================
-- BODY HARMONY -- V43_LMS_Schema_Fix
-- STATUS: CRITICAL - Fix missing columns in LMS tables
-- OBJECTIVE: Add last_watched_at to lms_progress and last_modified_by/at to lms_modules/lms_lessons
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. lms_progress - Add missing last_watched_at column
ALTER TABLE `lms_progress`
ADD COLUMN IF NOT EXISTS `last_watched_at` timestamp NULL DEFAULT NULL;
-- 2. lms_modules - Add missing last_modified_by and last_modified_at
ALTER TABLE `lms_modules`
ADD COLUMN IF NOT EXISTS `last_modified_by` int(11) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `last_modified_at` timestamp NULL DEFAULT NULL;
-- 3. lms_lessons - Add missing last_modified_by and last_modified_at
ALTER TABLE `lms_lessons`
ADD COLUMN IF NOT EXISTS `last_modified_by` int(11) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `last_modified_at` timestamp NULL DEFAULT NULL;
-- 4. lms_lessons - Add video_ref and thumbnail_ref if not exist (alt names for video_url/thumbnail_url)
ALTER TABLE `lms_lessons`
ADD COLUMN IF NOT EXISTS `video_ref` varchar(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `thumbnail_ref` varchar(255) DEFAULT NULL;
-- 5. Audit
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'MIGRATION_V43_LMS_SCHEMA',
        'INFO',
        'system',
        'Added missing LMS columns: last_watched_at, last_modified_by, last_modified_at, video_ref, thumbnail_ref'
    );