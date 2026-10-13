@echo off
cd /d "%~dp0.."
echo Starting sovgatop.uz (server + Cloudflare tunnel)...
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0..\start-public-site.ps1"
echo Done. The site will be live in about 20 seconds. You can close this window.
timeout /t 8 >nul
