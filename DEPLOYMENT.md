# CardiCare Deployment Guide
## Beat by Beat Heart Health Application

This guide explains how to deploy the CardiCare application to the domain `cardicare.daivanlabs.site`.

## Deployment Steps

### 1. Deploy the Cloudflare Worker

The drug interaction checker uses a Cloudflare Worker to avoid CORS issues.

```bash
# Navigate to the drug interaction worker directory
cd drug-interaction-worker

# Deploy the worker to Cloudflare
npx wrangler publish
```

Make note of the worker URL after deployment.

### 2. Configure DNS Records

In your domain registrar or DNS provider, set up the following records:

- **A Record**: `cardicare.daivanlabs.site` → Your hosting server IP
- **CNAME Record**: `drug-interaction-worker.cardicare.daivanlabs.site` → `<your-worker-name>.workers.dev`

### 3. Build the React Application

```bash
# Navigate to the main application directory (if you're not already there)
cd ..

# Build the React application for production
npm run build
```

The built files will be in the `dist` directory.

### 4. Upload to Web Hosting

Upload the contents of the `dist` directory to your web hosting provider.

### 5. Verify Deployment

1. Visit `https://cardicare.daivanlabs.site` to ensure the main application is working
2. Test the drug interaction checker to verify CORS is properly configured

## Troubleshooting CORS Issues

If you encounter CORS errors:

1. Check the worker's CORS headers:
   - The worker should be configured to allow requests from `https://cardicare.daivanlabs.site`
   - Verify the protocols match (https vs http)

2. Test the worker directly:
   - Visit `https://drug-interaction-worker.cardicare.daivanlabs.site` in your browser
   - You should see a response (likely an error about invalid request method, which is fine)

3. Check browser console for detailed CORS error messages

4. If needed, you can modify the CORS settings in `super-simple-interaction-worker.js`

## Using the Automated Deployment Script

For convenience, you can use the included PowerShell script to deploy both the worker and build the application:

```bash
# Run from the root directory of the project
./deploy.ps1
```

Follow the instructions displayed by the script to complete the deployment process.
