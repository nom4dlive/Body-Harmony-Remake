# scripts/setup_env.ps1 — PowerShell wrapper for automated environment setup
param (
    [string]$Mode = "audit",
    [switch]$Force
)

$forceFlag = if ($Force) { "--force" } else { "" }
python scripts/setup_env.py --mode $Mode $forceFlag