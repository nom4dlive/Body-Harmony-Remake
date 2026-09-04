<#
.SYNOPSIS
    Force Deploy script to bypass WinSCP synchronize skipping.
#>

$WinSCP = "C:\Program Files (x86)\WinSCP\WinSCP.com"
$BuildDir = "F:\Body-Harmony-Remake\apps\web-app\build\public_html"
$Excludes = "| .git/; .env.deploy; node_modules/; *.log; *.map"

$WinSCPScript = @"
option batch continue
option confirm off
open ftp://u388974772.nom4dagent:Zuh#ZC8XI&Y|Oa~5@ftp.bodyharmony.com.br:21/
put -filemask="$Excludes" "$BuildDir" "/"
exit
"@

$ScriptFile = "f:\Body-Harmony-Remake\force_put.txt"
Set-Content -Path $ScriptFile -Value $WinSCPScript -Encoding UTF8

& $WinSCP /script="$ScriptFile"
Remove-Item $ScriptFile
