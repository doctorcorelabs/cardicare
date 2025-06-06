# CardiCare Deployment Script
Write-Host "Starting deployment of Beat by Beat Heart Health application (CardiCare)" -ForegroundColor Cyan

# Check for wrangler version and install latest if needed
Write-Host "Checking Wrangler version..." -ForegroundColor Yellow
npm install -g wrangler@latest
Write-Host "Wrangler updated to latest version!" -ForegroundColor Green

# 1. Deploy the drug interaction worker to Cloudflare
Write-Host "Deploying drug interaction worker to Cloudflare..." -ForegroundColor Yellow
Set-Location -Path .\drug-interaction-worker
npx wrangler deploy --minify
Set-Location -Path ..
Write-Host "Drug interaction worker deployed successfully!" -ForegroundColor Green

# 2. Deploy the main AI assistant worker to Cloudflare
Write-Host "Deploying main AI assistant worker to Cloudflare..." -ForegroundColor Yellow
Set-Location -Path .\cloudflare-worker
npx wrangler deploy --minify
Set-Location -Path ..
Write-Host "Main AI assistant worker deployed successfully!" -ForegroundColor Green

# 3. Build the main React application
Write-Host "Building the main React application..." -ForegroundColor Yellow
npm run build
Write-Host "Main application built successfully!" -ForegroundColor Green

# 4. Instructions for setting up DNS and deploying the frontend
Write-Host @"

====== Deployment Instructions ======

1. Upload the contents of the 'dist' folder to your web hosting for cardicare.daivanlabs.site

2. Configure these DNS records for your domain:
   - A Record: cardicare.daivanlabs.site → Your hosting server IP
   - CNAME Record: drug-interaction-worker.cardicare.daivanlabs.site → workers.dev
   - CNAME Record: api.cardicare.daivanlabs.site → workers.dev

3. After uploading, verify the application works by visiting:
   https://cardicare.daivanlabs.site

====== Troubleshooting ======

If you encounter CORS issues:
1. Check that the domain in the worker's corsHeaders matches 'https://cardicare.daivanlabs.site' exactly
2. Verify the worker is accessible at 'https://drug-interaction-worker.cardicare.daivanlabs.site'
3. Ensure all URL protocols match (https:// for both the site and the worker)

"@ -ForegroundColor Cyan
