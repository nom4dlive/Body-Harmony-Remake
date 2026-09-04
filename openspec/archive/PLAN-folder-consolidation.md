# Plan: Database Folder Consolidation

**Objective:** Consolidate scattered database files into a single, authoritative directory (`apps/web-app/src/infrastructure/database`) and archive legacy/redundant files to clean up the project structure.

## 🛑 User Review Required
> [!NOTE]
> This action will move files and delete empty directories. It simplifies the project structure but might affect scripts relying on hardcoded paths to `infrastructure/database` (though `apps/web-app/src/...` is the standard app path).

## 📂 Audit & Strategy

| Current Location | Content | Action |
| :--- | :--- | :--- |
| `apps/web-app/src/frontend/database` | `V18_Full.sql`, `archive/`, `migrations/` | **Move to Archive**: This is a misplaced directory. Merge into `archive/legacy_v18`. |
| `infrastructure/database` | `database_master_v2.sql`, `v33` files, `migrations/` | **Move to Archive**: Previous infrastructure root. Merge into `archive/v33_infra`. |
| **Target:** `apps/web-app/src/infrastructure/database` | `FULL_DATABASE_RESET_v34.sql`, `V34` migration | **Keep & Expand**: This becomes the single Source of Truth. |

## 🛠 Proposed Changes

### 1. Structure Creation
- Create `apps/web-app/src/infrastructure/database/archive/`
- Create `apps/web-app/src/infrastructure/database/archive/legacy_frontend/`
- Create `apps/web-app/src/infrastructure/database/archive/previous_infra/`

### 2. Migration Steps
1.  **Frontend DB:** Move `apps/web-app/src/frontend/database/*` -> `apps/web-app/src/infrastructure/database/archive/legacy_frontend/`.
2.  **Infra DB:** Move `infrastructure/database/*` -> `apps/web-app/src/infrastructure/database/archive/previous_infra/`.
3.  **Cleanup:** Delete `apps/web-app/src/frontend/database` and `infrastructure/database` (if empty).

### 3. Verification
- Verify `FULL_DATABASE_RESET_v34.sql` remains in the root of the target.
- Verify old files are accessible in `archive/`.
- Verify no files are lost.

## 🔍 Verification Plan
- **File Check:** List the new directory structure to confirm organization.
- **Project Scan:** Ensure no build scripts were relying on the deleted folders (User mentioned `@/diagnose` checks this, but I'll update it if needed).
