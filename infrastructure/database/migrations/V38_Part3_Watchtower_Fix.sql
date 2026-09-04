-- ==============================================================================
-- BODY HARMONY -- V38 PART 3: WATCHTOWER & STUDENTS FIX (2026-02-19)
-- STATUS: CRITICAL - Fixes 500 Errors in Watchtower & Students
-- OBJECTIVE: Add missing columns for Analytics and User Management.
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- ------------------------------------------------------------------------------
-- 1. WATCHTOWER FIX (lms_progress)
-- ------------------------------------------------------------------------------
-- Error: Unknown column 'is_completed' in 'WHERE'
-- Fix: Add is_completed column and sync it with valid 'completed_at' dates if possible.
ALTER TABLE `lms_progress`
ADD COLUMN IF NOT EXISTS `is_completed` tinyint(1) DEFAULT 0;
-- Optional: Auto-fill is_completed if we have a completed_at date
UPDATE `lms_progress`
SET `is_completed` = 1
WHERE `completed_at` IS NOT NULL
    AND `is_completed` = 0;
-- ------------------------------------------------------------------------------
-- 2. STUDENTS SCHEMA REINFORCEMENT
-- ------------------------------------------------------------------------------
-- Ensure all columns queried by StudentController exist, avoiding the "profile_photo" mismatch.
-- Rename 'profile_photo' to 'photo_url' if it exists (Generic SQL doesn't support IF EXISTS easily on RENAME, so we rely on ADD/UPDATE pattern or user's rescue kit)
-- Safe approach: Ensure 'photo_url' exists.
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `photo_url` varchar(255) DEFAULT NULL;
-- If 'profile_photo' has data and 'photo_url' is empty, migrate it.
-- UPDATE `students` SET `photo_url` = `profile_photo` WHERE `photo_url` IS NULL AND `profile_photo` IS NOT NULL;
-- (Commented out to avoid error if profile_photo doesn't exist. Rescue Kit PHP handles this better).
-- ------------------------------------------------------------------------------
-- 3. AUDIT
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_PATCH_V38_3',
        'INFO',
        'system',
        'Fixed Watchtower is_completed column'
    );