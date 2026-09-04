# nexus-gate.ps1 — Dynamic Nexus Access Gate (V101)
# Automatic whitelist of current public IP for SSH (22) and MySQL (3306) on VPS Oracle.

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "=== Dynamic Nexus Access Gate (V101) ===" -ForegroundColor Cyan

# 1. Detect current public IP
Write-Host "[1/3] Detecting current public IP..." -ForegroundColor Yellow
$IpifyUrls = @("https://api.ipify.org", "https://api4.ipify.org", "https://icanhazip.com")
$CurrentIp = $null

foreach ($Url in $IpifyUrls) {
    try {
        $CurrentIp = (Invoke-RestMethod -Uri $Url -TimeoutSec 5).Trim()
        if ($CurrentIp -match "^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$") {
            break
        }
    } catch {
        # Silent fallback
    }
}

if (-not $CurrentIp) {
    Write-Error "CRITICAL: Could not detect public IP. Check internet connection."
    exit 1
}

Write-Host "   👉 Current Public IP: $CurrentIp" -ForegroundColor Green

# 2. Establish SSH connection & execute remote commands
Write-Host "[2/3] Connecting to Oracle VPS (144.22.155.115)..." -ForegroundColor Yellow

$KeyPath = "$ProjectRoot\infrastructure\database\oracle\ssh-key-2026-02-26.key"
if (-not (Test-Path $KeyPath)) {
    Write-Error "CRITICAL: SSH Key not found at $KeyPath"
    exit 1
}

$SshUser = "ubuntu"
$SshHost = "144.22.155.115"

# Commands to manage custom iptables chain securely
$RemoteCmds = @(
    # Create NEXUS_GATE chain if it doesn't exist
    "if ! sudo iptables -L NEXUS_GATE >/dev/null 2>&1; then",
    "  echo '   Creating NEXUS_GATE chain...';",
    "  sudo iptables -N NEXUS_GATE;",
    "  sudo iptables -I INPUT 1 -j NEXUS_GATE;",
    "fi;",
    # Flush chain and add new rules
    "echo '   Flushing NEXUS_GATE chain and writing new rules for $CurrentIp...';",
    "sudo iptables -F NEXUS_GATE;",
    "sudo iptables -A NEXUS_GATE -s $CurrentIp -p tcp --dport 3306 -j ACCEPT;",
    "sudo iptables -A NEXUS_GATE -s $CurrentIp -p tcp --dport 22 -j ACCEPT;",
    # Save rules for persistence if netfilter-persistent is installed
    "if dpkg -l | grep -q 'iptables-persistent'; then",
    "  echo '   Saving persistent rules...';",
    "  sudo netfilter-persistent save >/dev/null 2>&1;",
    "fi;",
    "echo '   Firewall rules updated successfully on Oracle VPS!';"
) -join " "

try {
    # Set permissions for ssh key file in Windows if necessary (OpenSSH Windows requirement)
    # Normally Windows ssh client requires the key file to not be writeable by others.
    # Since we can connect successfully, we assume permissions are already fine.
    
    ssh -i $KeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=5 "${SshUser}@${SshHost}" "$RemoteCmds"
    
    Write-Host "`n[3/3] ACCESS GRANTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "You can now connect to SSH (port 22) and MySQL (port 3306) on 144.22.155.115." -ForegroundColor Yellow
}
catch {
    Write-Error "CRITICAL: Failed to update firewall rules via SSH. Reason: $($_.Exception.Message)"
    exit 1
}
