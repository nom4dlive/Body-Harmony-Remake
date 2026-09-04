# Plan: Database Consolidation Review (V34)

**Objective:** Consolidate all database migrations, production dumps, and manual fixes into a single, authoritative SQL file (`FULL_DATABASE_RESET_v34.sql`) to serve as the definitive "Source of Truth" for the Body Harmony system.

## 🛑 User Review Required
> [!IMPORTANT]
> This operation will create a **RESET** script. Running this script in production will **WIPE** all existing data and re-seed it with the snapshot captured in this file. Ensure backups are secured before ever running this in a live environment. The primary use case is for Dev/Staging synchronization and Disaster Recovery.

## 🛠 Proposed Changes

### 1. Artifact Creation
- **Target:** `apps/web-app/src/infrastructure/database/FULL_DATABASE_RESET_v34.sql`
- **Content:**
    - `SET FOREIGN_KEY_CHECKS = 0;`
    - **Drop Section:** Explicit `DROP TABLE IF EXISTS` for all tables.
    - **Schema Section:** Consolidated `CREATE TABLE` statements for:
        - Core: `admin_users`, `admin_sessions`, `students`, `student_devices`, `auth_logs`
        - LMS: `lms_modules`, `lms_lessons`, `lms_resources`, `lms_progress`, `lms_quizzes`, `lms_quiz_questions`, `lms_quiz_attempts`, `lms_badges`, `lms_user_badges`, `lms_attachments`, `lms_lesson_attachments`, `lms_points_log`
        - Content: `gallery_images`, `testimonials`, `faq`, `system_broadcasts`, `results`
        - CRM: `leads`, `mentors`, `admin_nudges`
        - System: `site_config`, `audit_logs`
        - **NEW:** `nexus_security_rules` (from V33)
    - **Seed Section:**
        - **Admins:** Standard Superadmin & Admin.
        - **Config:** Latest `site_config` JSONs (including V34 AI Name update).
        - **Nexus Rules:** Initial security policy (V33).
        - **Students:** The 38 licensed professionals from the production dump.
        - **Content:** Initial Modules, Lessons, and Mentors.
    - `SET FOREIGN_KEY_CHECKS = 1;`

### 2. Documentation Updates
- **Update:** `CHANGELOG.md` with V34 Consolidation entry.
- **Create:** `apps/web-app/src/infrastructure/database/db_consolidation_report.md` summarizing the audit.

## 🔍 Verification Plan

### Automated Verification
- **Syntax Check:** Run the generated SQL file against a local MySQL test instance (or Docker container if active) to ensure no syntax errors.
    - *Command:* `mysql -u root -p test_db < apps/web-app/src/infrastructure/database/FULL_DATABASE_RESET_v34.sql` (Simulated)

### Manual Verification
- **Review:** Inspect the generated SQL file to ensure:
    - `nexus_security_rules` table exists.
    - `site_config` contains `ai_name = 'Doctor Harmony'`.
    - `students` insert statement includes 38 records.
    - `utf8mb4` collation is used consistently.
