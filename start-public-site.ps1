$ErrorActionPreference = 'SilentlyContinue'
$ProjectRoot = $PSScriptRoot
$ConfigPath = Join-Path $ProjectRoot '.cloudflared-config.yml'
$NodePath = 'C:\Program Files\nodejs\node.exe'
$CloudflaredPath = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'

$siteReady = Test-NetConnection 127.0.0.1 -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $siteReady) {
    Start-Process -FilePath $NodePath -ArgumentList 'start.js' -WorkingDirectory $ProjectRoot -WindowStyle Hidden
}

if (-not (Get-Process cloudflared -ErrorAction SilentlyContinue) -and (Test-Path $ConfigPath) -and (Test-Path $CloudflaredPath)) {
    $arguments = "tunnel --config `"$ConfigPath`" run"
    Start-Process -FilePath $CloudflaredPath -ArgumentList $arguments -WorkingDirectory $ProjectRoot -WindowStyle Hidden
}
