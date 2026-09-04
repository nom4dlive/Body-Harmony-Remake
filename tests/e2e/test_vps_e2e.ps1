# test_vps_e2e.ps1
# Nexus Guard V3.1 - E2E VPS Connectivity & Security Validation Suite

$vpsIp = "2.25.156.25"
$domains = @("api.bodyharmony.com.br", "app.bodyharmony.com.br", "stream.bodyharmony.com.br")
$sshKeyPath = "$PSScriptRoot\..\..\openspec\tracker\Hostinger_VPS\id_ed25519"

# Resolve absolute path for SSH key
$absoluteSshKey = [System.IO.Path]::GetFullPath($sshKeyPath)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           NEXUS GUARD V3.1 - VPS END-TO-END VALIDATION SUITE         " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Target IP: $vpsIp"
Write-Host "SSH Key Path: $absoluteSshKey"
Write-Host "Timestamp: $(Get-Date)"
Write-Host "----------------------------------------------------------------------"

# -----------------------------------------------------------------------------
# 1. ICMP PING TEST
# -----------------------------------------------------------------------------
Write-Host "[TEST 1/4] Checking ICMP Connectivity (Ping)..." -ForegroundColor Yellow
$ping = Test-Connection -ComputerName $vpsIp -Count 2 -Quiet -ErrorAction SilentlyContinue
if ($ping) {
    Write-Host "  [OK] ICMP Ping: SUCCESS (Host is alive)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] ICMP Ping: NO RESPONSE (Likely blocked by VPS Firewall for security - Normal)" -ForegroundColor Yellow
}
Write-Host ""

# -----------------------------------------------------------------------------
# 2. PORT SCANNING & FIREWALL ISOLATION
# -----------------------------------------------------------------------------
Write-Host "[TEST 2/4] Scanning TCP Ports (Firewall Blindage Test)..." -ForegroundColor Yellow

$portsToVerify = @{
    22   = @{ Name = "SSH Access"; Expected = $true }
    80   = @{ Name = "HTTP Web (Redirect)"; Expected = $true }
    443  = @{ Name = "HTTPS Web (Traefik)"; Expected = $true }
    3306 = @{ Name = "MySQL Database (WAN Block)"; Expected = $false }
    9000 = @{ Name = "PHP-FPM FastCGI (WAN Block)"; Expected = $false }
    8080 = @{ Name = "Traefik Dashboard (WAN Block)"; Expected = $false }
}

function Test-Port {
    param (
        [string]$IP,
        [int]$Port,
        [int]$TimeoutMs = 1500
    )
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connection = $tcpClient.BeginConnect($IP, $Port, $null, $null)
    $success = $connection.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
    
    if ($success) {
        try {
            $tcpClient.EndConnect($connection)
            $tcpClient.Close()
            return $true
        } catch {
            return $false
        }
    } else {
        return $false
    }
}

$portScanResults = @{}
foreach ($port in $portsToVerify.Keys | Sort-Object) {
    $meta = $portsToVerify[$port]
    $isOpen = Test-Port -IP $vpsIp -Port $port
    $portScanResults[$port] = $isOpen
    
    $statusText = if ($isOpen) { "OPEN" } else { "CLOSED/FILTERED" }
    $color = if ($isOpen -eq $meta.Expected) { "Green" } else { "Red" }
    $checkIcon = if ($isOpen -eq $meta.Expected) { "[OK]" } else { "[FAIL] SECURITY ALERT!" }
    
    Write-Host "  $checkIcon Port $port ($($meta.Name)): Status = $statusText (Expected = $(if($meta.Expected){"OPEN"}else{"CLOSED"}))" -ForegroundColor $color
}
Write-Host ""

# -----------------------------------------------------------------------------
# 3. HTTPS WEB HANDSHAKE & SSL VALIDATION
# -----------------------------------------------------------------------------
Write-Host "[TEST 3/4] Validating SSL Certificates and Web Handshake..." -ForegroundColor Yellow

foreach ($domain in $domains) {
    $url = "https://$domain"
    Write-Host "  Connecting to $url..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        Write-Host "  [OK] SUCCESS (HTTP $statusCode)" -ForegroundColor Green
    } catch {
        $err = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "  [OK] CONNECTED (HTTP $statusCode - $err)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] FAILED ($err)" -ForegroundColor Red
        }
    }
}
Write-Host ""

# -----------------------------------------------------------------------------
# 4. SSH KEY AUTHENTICATION & TELEMETRY TEST
# -----------------------------------------------------------------------------
Write-Host "[TEST 4/4] Validating SSH Key Authentication and Telemetry..." -ForegroundColor Yellow

if (-not (Test-Path $absoluteSshKey)) {
    Write-Host "  [FAIL] SSH KEY NOT FOUND: $absoluteSshKey" -ForegroundColor Red
    Write-Host "  Abort SSH Test." -ForegroundColor Red
    exit 1
}

# Run SSH Command (Get kernel version, docker container status and disk space)
$sshCmd = "uname -a; echo '---'; docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'; echo '---'; df -h /"

Write-Host "  Attempting secure handshake via SSH key..."
$sshOutput = ssh -i $absoluteSshKey -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$vpsIp $sshCmd 2>$null

if ($sshOutput) {
    Write-Host "  [OK] SSH Connection: SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "--- VPS SYSTEM TELEMETRY ---" -ForegroundColor Cyan
    $sshOutput | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "  [FAIL] SSH Connection: FAILED. Check if SSH Port 22 is open, key permissions are restricted (chmod 600) or if the IP is blocked." -ForegroundColor Red
}

Write-Host "----------------------------------------------------------------------"
Write-Host "E2E VPS Validation Completed at $(Get-Date)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
