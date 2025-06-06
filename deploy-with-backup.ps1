# Deploy script for updating Cloudflare Workers
# This will deploy both the frontend and backend components

Write-Host "Starting deployment process..." -ForegroundColor Green

# 1. Deploy main Cloudflare Worker (chat API)
Write-Host "Deploying Chat API Worker..." -ForegroundColor Cyan
Set-Location -Path ".\cloudflare-worker"
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error deploying Chat API Worker! Check errors above." -ForegroundColor Red
    exit 1
}
Set-Location -Path ".."

# 2. Deploy Drug Interaction Worker (if it exists)
if (Test-Path -Path ".\drug-interaction-worker") {
    Write-Host "Deploying Drug Interaction Worker..." -ForegroundColor Cyan
    Set-Location -Path ".\drug-interaction-worker"
    npm run deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error deploying Drug Interaction Worker! Check errors above." -ForegroundColor Red
        exit 1
    }
    Set-Location -Path ".."
}

# 3. Build the frontend
Write-Host "Building frontend application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building frontend! Check errors above." -ForegroundColor Red
    exit 1
}

# 4. Deploy the frontend (assuming using GitHub Pages or similar)
# Uncomment and modify as needed for your deployment platform
# Write-Host "Deploying frontend to hosting platform..." -ForegroundColor Cyan
# npm run deploy:frontend

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "API endpoints:" -ForegroundColor Yellow
Write-Host "- Main API: https://heart-health-ai-assistant.daivanlabs.workers.dev" -ForegroundColor Yellow
Write-Host "- API should be accessible at: https://<your-worker-name>.<your-account>.workers.dev" -ForegroundColor Yellow

# Perform a quick health check of APIs
Write-Host "Performing API health check..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "https://heart-health-ai-assistant.daivanlabs.workers.dev/ping" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API is online at workers.dev!" -ForegroundColor Green
    } else {
        Write-Host "✗ API returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Could not connect to API. Error: $_" -ForegroundColor Red
}

Write-Host "Deployment verification complete" -ForegroundColor Green
