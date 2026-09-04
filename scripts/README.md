# Body Harmony - Deployment Scripts

**Version:** 2.0 (Consolidated)  
**Last Updated:** 2026-02-17

---

## 🚀 Quick Start

### Full Deployment
```powershell
.\scripts\deploy.ps1
```
Builds frontend, packages backend, uploads to production.

### Backend Hotfix
```powershell
.\scripts\deploy.ps1 -BackendOnly
```
Uploads only PHP files (no frontend rebuild).

### ENV Update
```powershell
.\scripts\deploy.ps1 -EnvOnly
```
Uploads only .env file to production.

### Build Without Upload
```powershell
.\scripts\deploy.ps1 -BuildOnly
```
Builds locally for review before deployment.

---

## 📋 Main Script: `deploy.ps1`

**Purpose:** Unified deployment script (replaces 5 separate scripts)

**All Parameters:**
```powershell
.\scripts\deploy.ps1 `
    [-Version "v3.5.0"] `
    [-BuildOnly] `
    [-BackendOnly] `
    [-EnvOnly] `
    [-SkipValidation] `
    [-SkipBuild] `
    [-DryRun] `
    [-Force] `
    [-Verbose]
```

| Parameter | Description |
|:----------|:------------|
| `-Version` | Version tag (e.g., "v3.5.0") |
| `-BuildOnly` | Build but don't upload |
| `-BackendOnly` | Upload backend PHP only |
| `-EnvOnly` | Upload .env only |
| `-SkipValidation` | Skip ENV validation (not recommended) |
| `-SkipBuild` | Use existing build/ |
| `-DryRun` | Simulate without changes |
| `-Force` | Skip confirmations |
| `-Verbose` | Detailed logging |

---

## 🔍 Utility Scripts

### `validate-env.ps1`
Validates .env completeness against .env.example

```powershell
.\scripts\validate-env.ps1 [-Verbose]
```

**Exit Codes:**
- `0`: Validation passed
- `1`: Missing variables or placeholders

### `generate-handoff-prompt.ps1`
Generates handoff prompt for next session

```powershell
.\scripts\generate-handoff-prompt.ps1
```

**Output:** `HANDOFF_PROMPT.md` in project root

---

## 📂 Directory Structure

```
scripts/
├── deploy.ps1                  # 🆕 Unified deployment script
├── validate-env.ps1            # ENV validation
├── generate-handoff-prompt.ps1 # Session handoff
├── README.md                   # This file
├── db/                         # Database scripts
├── devops/                     # Build tools
└── legacy/                     # Old scripts (archived)
    ├── auto-deploy.ps1
    ├── deploy-release.ps1
    ├── upload-to-hostinger.ps1
    ├── upload-backend-only.ps1
    └── upload-env-to-production.ps1
```

---

## 🎯 Common Workflows

### 1. Full Production Deploy
```powershell
# Validate ENV
.\scripts\validate-env.ps1

# Deploy everything
.\scripts\deploy.ps1 -Version "v3.5.0"

# Test
# Visit: https://bodyharmony.com.br/portal-gestor
```

### 2. Quick Backend Fix
```powershell
# Fix PHP code
# ...

# Deploy backend only
.\scripts\deploy.ps1 -BackendOnly

# Test immediately
```

### 3. ENV Configuration Update
```powershell
# Update .env file
# ...

# Validate
.\scripts\validate-env.ps1

# Deploy
.\scripts\deploy.ps1 -EnvOnly
```

### 4. Test Build Locally
```powershell
# Build without uploading
.\scripts\deploy.ps1 -BuildOnly

# Review build/public_html/
# ...

# Upload when ready
.\scripts\deploy.ps1 -SkipBuild
```

---

## 🔐 Security Notes

1. **FTP Credentials** - Hardcoded in `deploy.ps1` (lines 30-35)
   - Main FTP: `45.152.44.244`
   - ENV FTP: `ftp.bodyharmony.com.br`

2. **ENV Protection** - `.env` protected by `.gitignore`

3. **Validation Required** - Always run `validate-env.ps1` before deploy

---

## 🚨 Troubleshooting

### "ENV validation failed"
```powershell
.\scripts\validate-env.ps1 -Verbose
# Shows which variables are missing
```

### "WinSCP not found"
Install WinSCP or update path in `deploy.ps1` line 232

### "Build output not found"
```powershell
# Run build first
cd apps/web-app
npm run build:hostinger
```

### "Upload failed"
Check FTP credentials in `deploy.ps1` lines 30-35

---

## 📊 What Changed (v2.0)

**Consolidated Scripts:**
- ❌ `auto-deploy.ps1` → `deploy.ps1`
- ❌ `deploy-release.ps1` → `deploy.ps1`
- ❌ `upload-to-hostinger.ps1` → `deploy.ps1`
- ❌ `upload-backend-only.ps1` → `deploy.ps1 -BackendOnly`
- ❌ `upload-env-to-production.ps1` → `deploy.ps1 -EnvOnly`

**Benefits:**
- ✅ Single script for all deployment scenarios
- ✅ Consistent parameter naming
- ✅ Better error handling
- ✅ Dry-run support
- ✅ Cleaner scripts folder (9 files → 4 files)

---

## 🔄 Migration Guide

### Old Way → New Way

```powershell
# Old: Full deploy
.\scripts\auto-deploy.ps1 -Version "v3.5.0"
# New: Same result
.\scripts\deploy.ps1 -Version "v3.5.0"

# Old: Backend only
.\scripts\upload-backend-only.ps1
# New: Same result
.\scripts\deploy.ps1 -BackendOnly

# Old: ENV only
.\scripts\upload-env-to-production.ps1
# New: Same result
.\scripts\deploy.ps1 -EnvOnly
```

---

**Maintainer:** Antigravity Agent  
**Support:** See debug_report.md for troubleshooting
