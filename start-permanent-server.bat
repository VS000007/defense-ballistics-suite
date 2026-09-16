@echo off
title AEGIS Defense Ballistics Suite - Persistent Server & Tunnel
echo ===================================================
echo [AEGIS] Starting Defense Ballistics Suite Server...
echo ===================================================

cd /d "%~dp0"

:: Start Vite dev server in background if not already running
start /B "" npm run dev

echo [AEGIS] Waiting for Vite server to initialize...
timeout /t 3 /nobreak >nul

echo [AEGIS] Starting Cloudflare Tunnel...
echo Keep this window open to keep the tunnel alive for the next few days.
echo.

:loop
.\cloudflared.exe tunnel --url http://localhost:5173
echo [AEGIS] Tunnel disconnected or interrupted. Reconnecting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
