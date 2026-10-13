# Restarts the sovgatop.uz server so it runs the newest code in dist\.
# Stops whatever is listening on port 3000 (the old server), starts start.js again and waits until it answers.
$ProjectRoot = $PSScriptRoot
$NodePath = 'C:\Program Files\nodejs\node.exe'
$ConfigPath = Join-Path $ProjectRoot '.cloudflared-config.yml'
$CloudflaredPath = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'

function PortBusy { [bool](Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) }

Write-Host ''
Write-Host '  Sovga: restarting the server...' -ForegroundColor Cyan

# 1. stop the old server
$pids = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*start.js*' -or $_.CommandLine -like '*dist\server\index.js*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

for ($i = 0; $i -lt 10 -and (PortBusy); $i++) { Start-Sleep -Milliseconds 500 }
if (PortBusy) {
  Write-Host '  The old server could not be stopped.' -ForegroundColor Red
  Write-Host '  Close this window, right-click RESTART-SOVGATOP.cmd and choose "Run as administrator".' -ForegroundColor Yellow
  Read-Host '  Press Enter to close'
  exit 1
}
Write-Host '  Old server stopped.'

# 2. start the new one
if (-not (Test-Path $NodePath)) { $NodePath = 'node' }
Start-Process -FilePath $NodePath -ArgumentList 'start.js' -WorkingDirectory $ProjectRoot -WindowStyle Hidden
Write-Host '  Starting new server' -NoNewline
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 2
  Write-Host '.' -NoNewline
  if (PortBusy) { $ok = $true; break }
}
Write-Host ''

# 3. make sure the Cloudflare tunnel is running
if (-not (Get-Process cloudflared -ErrorAction SilentlyContinue) -and (Test-Path $ConfigPath) -and (Test-Path $CloudflaredPath)) {
  Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --config `"$ConfigPath`" run" -WorkingDirectory $ProjectRoot -WindowStyle Hidden
  Write-Host '  Cloudflare tunnel started.'
}

if ($ok) {
  Write-Host '  Done! sovgatop.uz now runs the new version. Refresh the admin page with Ctrl+F5.' -ForegroundColor Green
} else {
  Write-Host '  The server did not start within 90 seconds.' -ForegroundColor Red
  Write-Host '  Run this to see the error:  node start.js   (in the project folder)' -ForegroundColor Yellow
}
Read-Host '  Press Enter to close'
