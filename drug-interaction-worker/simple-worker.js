addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return handleOptions(request)
  }
  
  // Set CORS headers for the main request
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }
  
  if (request.method === "POST") {
    try {
      // Parse the JSON body
      const body = await request.json();
      
      return new Response(JSON.stringify({
        success: true,
        receivedDrugs: body.drugs || [],
        message: "Test endpoint working!"
      }), {
        headers: headers,
        status: 200
      });
    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to parse request body: " + err.message
      }), {
        headers: headers,
        status: 400
      });
    }
  }

  return new Response(JSON.stringify({
    success: false,
    error: "Method not allowed"
  }), {
    headers: headers,
    status: 405
  });
}

// Handle CORS preflight requests
function handleOptions(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
  
  return new Response(null, {
    headers: headers
  });
}
