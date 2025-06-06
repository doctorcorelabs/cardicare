// Simple CORS Test Tool for CardiCare
// Using CommonJS syntax for maximum compatibility

const http = require('http');
const url = require('url');
const path = require('path');

const PORT = 9000;

// Create a basic HTTP server to test CORS settings
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Handle API endpoints for testing
  if (parsedUrl.pathname === '/test-cors') {
    // Set headers to simulate the frontend origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const responseData = {
      success: true,
      message: 'CORS test successful',
      requestHeaders: req.headers,
      testTime: new Date().toISOString()
    };
    
    res.statusCode = 200;
    res.end(JSON.stringify(responseData, null, 2));
    return;
  }
  
  // Serve the test HTML file for any other request
  res.setHeader('Content-Type', 'text/html');
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardiCare CORS Test</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { color: #3b82f6; }
      button { background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
      button:hover { background: #2563eb; }
      pre { background: #f1f5f9; padding: 15px; border-radius: 4px; overflow: auto; }
      .success { color: green; }
      .error { color: red; }
      .test-group { margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
    </style>
  </head>
  <body>
    <h1>CardiCare CORS Test Tool</h1>
    
    <div class="test-group">
      <h2>Drug Interaction Worker Test</h2>
      <p>Tests the connection to the drug interaction worker.</p>
      <button id="testDrugWorker">Test Drug Interaction Worker</button>
      <p>Status: <span id="drugWorkerStatus">Not tested</span></p>
      <pre id="drugWorkerResult">Results will appear here...</pre>
    </div>
    
    <div class="test-group">
      <h2>AI Assistant Worker Test</h2>
      <p>Tests the connection to the AI assistant worker.</p>
      <button id="testAiWorker">Test AI Assistant Worker</button>
      <p>Status: <span id="aiWorkerStatus">Not tested</span></p>
      <pre id="aiWorkerResult">Results will appear here...</pre>
    </div>
    
    <div class="test-group">
      <h2>Local CORS Test</h2>
      <p>Tests if this server is correctly handling CORS.</p>
      <button id="testLocalCors">Test Local CORS</button>
      <p>Status: <span id="localCorsStatus">Not tested</span></p>
      <pre id="localCorsResult">Results will appear here...</pre>
    </div>

    <script>
      // Function to make a CORS request
      async function makeCorsRequest(url, method = 'GET', body = null) {
        try {
          const options = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors'
          };
          
          if (body) {
            options.body = JSON.stringify(body);
          }
          
          const response = await fetch(url, options);
          const data = await response.text();
          
          return {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(Array.from(response.headers.entries())),
            data
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
      
      // Drug Worker Test
      document.getElementById('testDrugWorker').addEventListener('click', async () => {
        const statusEl = document.getElementById('drugWorkerStatus');
        const resultEl = document.getElementById('drugWorkerResult');
        
        statusEl.textContent = 'Testing...';
        statusEl.className = '';
        
        // Try local dev server first, then production
        const urls = [
          'http://localhost:8789',
          'https://drug-interaction-worker.cardicare.daivanlabs.site'
        ];
        
        let result = null;
        for (const url of urls) {
          try {
            result = await makeCorsRequest(url, 'POST', { drugs: ['aspirin', 'warfarin'] });
            if (result && result.success) break;
          } catch (error) {
            console.error('Error testing URL:', url, error);
          }
        }
        
        if (result && result.success) {
          statusEl.textContent = 'SUCCESS';
          statusEl.className = 'success';
        } else {
          statusEl.textContent = 'FAILED';
          statusEl.className = 'error';
        }
        
        resultEl.textContent = JSON.stringify(result, null, 2);
      });
      
      // AI Worker Test
      document.getElementById('testAiWorker').addEventListener('click', async () => {
        const statusEl = document.getElementById('aiWorkerStatus');
        const resultEl = document.getElementById('aiWorkerResult');
        
        statusEl.textContent = 'Testing...';
        statusEl.className = '';
        
        // Try local dev server first, then production
        const urls = [
          'http://localhost:8787',
          'https://api.cardicare.daivanlabs.site/chat'
        ];
        
        let result = null;
        for (const url of urls) {
          try {
            // Options request to test CORS preflight
            result = await fetch(url, { 
              method: 'OPTIONS',
              mode: 'cors'
            });
            
            if (result.ok) {
              break;
            }
          } catch (error) {
            console.error('Error testing URL:', url, error);
          }
        }
        
        if (result && result.ok) {
          statusEl.textContent = 'SUCCESS';
          statusEl.className = 'success';
        } else {
          statusEl.textContent = 'FAILED';
          statusEl.className = 'error';
        }
        
        let headerText = '';
        if (result && result.headers) {
          try {
            const headerArray = Array.from(result.headers.entries());
            headerText = JSON.stringify(headerArray, null, 2);
          } catch (e) {
            headerText = 'Unable to read headers: ' + e.message;
          }
        }
        
        resultEl.textContent = result 
          ? 'Status: ' + result.status + '\nHeaders: ' + headerText
          : 'Connection failed';
      });
      
      // Local CORS Test
      document.getElementById('testLocalCors').addEventListener('click', async () => {
        const statusEl = document.getElementById('localCorsStatus');
        const resultEl = document.getElementById('localCorsResult');
        
        statusEl.textContent = 'Testing...';
        statusEl.className = '';
        
        const result = await makeCorsRequest('http://localhost:9000/test-cors');
        
        if (result.success) {
          statusEl.textContent = 'SUCCESS';
          statusEl.className = 'success';
        } else {
          statusEl.textContent = 'FAILED';
          statusEl.className = 'error';
        }
        
        resultEl.textContent = JSON.stringify(result, null, 2);
      });
    </script>
  </body>
  </html>
  `;
  
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`CORS Test Server running at http://localhost:${PORT}`);
  console.log('Open the URL in your browser to run CORS tests');
});
