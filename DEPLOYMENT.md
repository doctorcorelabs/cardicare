# CardiCare Deployment Guide
## Beat by Beat Heart Health Application

This guide explains how to deploy the CardiCare application to the domain `cardicare.daivanlabs.site`.

## Deployment Steps

### 1. Deploy the Cloudflare Workers

CardiCare uses two Cloudflare Workers:
1. Drug interaction worker - for medication interaction checks
2. Main API worker - for AI assistant functionality

```bash
# Deploy the drug interaction worker
cd drug-interaction-worker
npx wrangler publish

# Navigate back to project root
cd ..

# Deploy the main AI assistant worker
cd cloudflare-worker
npx wrangler publish
```

Make note of the worker URLs after deployment.

### 2. Configure DNS Records

In your domain registrar or DNS provider, set up the following records:

- **A Record**: `cardicare.daivanlabs.site` → Your hosting server IP
- **CNAME Record**: `drug-interaction-worker.cardicare.daivanlabs.site` → `<your-drug-worker-name>.workers.dev`
- **CNAME Record**: `api.cardicare.daivanlabs.site` → `<your-ai-worker-name>.workers.dev`

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

1. Check the workers' CORS headers:
   - Both workers should be configured to allow requests from `https://cardicare.daivanlabs.site`
   - Verify the protocols match (https vs http)

2. Test the workers directly:
   - Visit `https://drug-interaction-worker.cardicare.daivanlabs.site` for the drug interaction worker
   - Visit `https://api.cardicare.daivanlabs.site` for the main AI assistant worker
   - You should see a response (likely an error about invalid request method, which is fine)

3. Check browser console for detailed CORS error messages

4. If needed, you can modify the CORS settings in:
   - `drug-interaction-worker/super-simple-interaction-worker.js` for drug interactions
   - `cloudflare-worker/src/cors-utils.ts` for AI assistant

5. Use the standalone test file:
   - Open `drug-interaction-test.html` in your browser to test without running a server
   - This lets you test with various drug combinations to verify the worker is functioning

## Testing CORS Before Full Deployment

There are several ways to test the CORS configuration before deploying:

### 1. Using the Node.js Test Server

```bash
# Run the CORS test tool
npm run test:cors
```

This will start a local server at http://localhost:9000 with a web interface to test the CORS settings for both workers.

### 2. Using the Static HTML Test File

Open the `drug-interaction-test.html` file directly in your browser:

```bash
# On Windows
start drug-interaction-test.html
```

This HTML file works without a server and lets you test drug interactions with custom drug names.

## Using the Automated Deployment Script

For convenience, you can use the included PowerShell script to deploy both the worker and build the application:

```bash
# Run from the root directory of the project
npm run deploy
# Or directly:
./deploy.ps1
```

Follow the instructions displayed by the script to complete the deployment process.
