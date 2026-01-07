# Player Service - Quick Setup Script (PowerShell)
# Este script instala dependencias y ejecuta tests

Write-Host "🎮 Player Service - Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Navigate to player-service directory
Set-Location backend\player-service

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm test

Write-Host ""
Write-Host "📊 Generating coverage report..." -ForegroundColor Yellow
npm run test:cov

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the service:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
