# Database Migration Scripts

This directory contains tools for managing database migrations between the local Docker environment and Hostinger production.

## Scripts

### 1. `export-sensitive.ps1`
Exports sensitive data (Users, Progress, Logs, Leads) from the running Docker database.
**Usage:**
```powershell
.\scripts\db\migration\export-sensitive.ps1
```
**Output:** `infrastructure/database/migrations/sensitive_data_[TIMESTAMP].sql`

### 2. `import-safety_wrapper.sql`
A template SQL file to safely import data into Hostinger.
**Usage:**
1. Open `import-safety_wrapper.sql`.
2. Paste the content of your exported SQL file into the designated section.
3. Run the complete script in Hostinger's phpMyAdmin.

### 3. `rollback.ps1`
Restores the local Docker database from a specific SQL file.
**Usage:**
```powershell
.\scripts\db\migration\rollback.ps1 -SnapshotFile "infrastructure/database/migrations/sensitive_data_20260207.sql"
```

## Workflow

1. **Develop Localy**: Make schema changes in `consolidated_init.sql`.
2. **Verify**: Run `cycle-governance.ps1`.
3. **Export Data**: Run `export-sensitive.ps1` to backup production data (if you have a local prod replica) or to prepare seed data.
4. **Deploy**:
   - Upload `consolidated_init.sql` to Hostinger for a full reset.
   - Or use `import-safety_wrapper.sql` with specific INSERT statements for data updates.
