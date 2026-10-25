# Run in PowerShell from project root: powershell -NoProfile -ExecutionPolicy Bypass -File .\VERIFY-DEMO.ps1
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot
Write-Host "=== MyPortfolio Demo Readiness ===" -ForegroundColor Cyan
if (-not (Test-Path ".\package.json")) { Write-Host "FAIL: package.json missing" -ForegroundColor Red; exit 1 }
if (-not (Test-Path ".\backend\app.py")) { Write-Host "FAIL: backend app.py missing" -ForegroundColor Red; exit 1 }
if (-not (Test-Path ".\backend\finance.py")) { Write-Host "FAIL: backend finance.py missing" -ForegroundColor Red; exit 1 }
if (-not (Test-Path ".\backend\agent_service.py")) { Write-Host "FAIL: backend agent_service.py missing" -ForegroundColor Red; exit 1 }
if (-not (Test-Path ".\backend\.env")) { Write-Host "WARNING: backend\.env missing. Copy .env.example and set Ollama." -ForegroundColor Yellow }
try {
    $site = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 8
    Write-Host "PASS: Website HTTP $($site.StatusCode)" -ForegroundColor Green
} catch { Write-Host "FAIL: Website inaccessible at http://localhost:3000" -ForegroundColor Red }
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 8
    Write-Host "PASS: Backend $($health.status)" -ForegroundColor Green
    Write-Host "AI provider: $($health.agent.provider); configured: $($health.agent.ready)"
    if ($health.agent.provider -ne 'ollama') { Write-Host "WARNING: Check backend\.env; expected STRANDS_PROVIDER=ollama" -ForegroundColor Yellow }
    if (-not $health.agent.ready) { Write-Host "WARNING: AI not configured; health message: $($health.agent.message)" -ForegroundColor Yellow }
} catch { Write-Host "FAIL: Backend inaccessible at http://127.0.0.1:8000" -ForegroundColor Red }
try {
    $models = & ollama list 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PASS: Ollama command available" -ForegroundColor Green
        if (($models | Out-String) -notmatch 'qwen2\.5:3b') { Write-Host "WARNING: qwen2.5:3b not in Ollama list" -ForegroundColor Yellow }
    } else { Write-Host "WARNING: Ollama command failed" -ForegroundColor Yellow }
} catch { Write-Host "WARNING: Ollama command not found" -ForegroundColor Yellow }
Write-Host "If health is fine, test real Strands tool invocation in the browser before presenting."
