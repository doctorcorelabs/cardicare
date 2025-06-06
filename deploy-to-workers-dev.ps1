# Deploy script khusus untuk Cloudflare Workers.dev
# Script ini tidak memerlukan domain kustom

Write-Host "Starting deployment to workers.dev..." -ForegroundColor Green

# 1. Deploy main Cloudflare Worker (chat API)
Write-Host "Deploying Chat API Worker to workers.dev..." -ForegroundColor Cyan
Set-Location -Path ".\cloudflare-worker"
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error deploying Chat API Worker! Check errors above." -ForegroundColor Red
    exit 1
}
Set-Location -Path ".."

# 2. Deploy Drug Interaction Worker (jika ada)
if (Test-Path -Path ".\drug-interaction-worker") {
    Write-Host "Deploying Drug Interaction Worker to workers.dev..." -ForegroundColor Cyan
    Set-Location -Path ".\drug-interaction-worker"
    npm run deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error deploying Drug Interaction Worker! Check errors above." -ForegroundColor Red
        exit 1
    }
    Set-Location -Path ".."
}

# 3. Build frontend dengan konfigurasi API workers.dev
Write-Host "Building frontend application with workers.dev configuration..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building frontend! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "-----------------------------------------------" -ForegroundColor White
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your worker should be available at URLs like:" -ForegroundColor Yellow
Write-Host "- https://heart-health-ai-assistant.<your-account>.workers.dev" -ForegroundColor Yellow
Write-Host "- https://drug-interaction-worker.<your-account>.workers.dev" -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor White

Write-Host "Testing API health..." -ForegroundColor Cyan
try {
    # Ganti nama worker sesuai dengan yang terlihat di dashboard Cloudflare 
    $workerUrl = Read-Host -Prompt "Enter your worker URL (e.g., https://heart-health-ai-assistant.daivanlabs.workers.dev)"
    
    $response = Invoke-WebRequest -Uri "$workerUrl/ping" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API is online at $workerUrl!" -ForegroundColor Green
        Write-Host "API response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "✗ API returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Could not connect to API at $workerUrl" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host "-----------------------------------------------" -ForegroundColor White
Write-Host "Deployment verification complete" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy the dist folder contents to your web hosting" -ForegroundColor White
Write-Host "2. Update your frontend environment with the correct API URLs" -ForegroundColor White
Write-Host "3. Test the application in your browser" -ForegroundColor White
