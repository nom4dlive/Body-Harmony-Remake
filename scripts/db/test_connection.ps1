
try {
    Write-Host "Loading MySql.Data.dll..."
    Add-Type -Path "f:\Body-Harmony-Remake\infrastructure\MySql.Data.dll"
    # Dynamic load of .env configuration to avoid hardcoding
    $envPaths = @(
        "$PSScriptRoot\..\..\apps\web-app\src\backend\.env",
        "$PSScriptRoot\..\..\.env",
        "$PSScriptRoot\..\..\apps\web-app\.env",
        "F:\Body-Harmony-Remake\apps\web-app\src\backend\.env"
    )
    $envPath = $null
    foreach ($path in $envPaths) {
        if (Test-Path $path) {
            $envPath = $path
            break
        }
    }

    $server = "localhost"
    $database = "u388974772_bodyharmony_db"
    $user = "u388974772_body_db"
    $pass = ""

    if ($envPath) {
        Get-Content $envPath | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
                $parts = $line.Split('=', 2)
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1, $value.Length - 2) }
                elseif ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1, $value.Length - 2) }
                
                if ($key -eq "DB_HOST") { $server = $value }
                elseif ($key -eq "DB_NAME") { $database = $value }
                elseif ($key -eq "DB_USER") { $user = $value }
                elseif ($key -eq "DB_PASS") { $pass = $value }
            }
        }
        Write-Host "Loaded config dynamically from: $envPath"
    } else {
        Write-Host "⚠️ Warning: .env file not found. Using defaults."
    }

    $connStr = "Server=$server;Port=3306;Database=$database;Uid=$user;Pwd=$pass;"
    $conn = New-Object MySql.Data.MySqlClient.MySqlConnection($connStr)
    $conn.Open()
    Write-Host "✅ Connection Successful!"
    $conn.Close()
} catch {
    Write-Host "❌ Connection Failed: $_"
}
