// Super simple worker with proper CORS support
// This file handles drug interaction API requests with proper CORS headers

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const requestOrigin = request.headers.get('Origin') || '';
  
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept', // Ensure this covers all headers your client sends
    'Access-Control-Max-Age': '86400' // 1 day
  };

  const allowedOrigins = [
    'https://cardicare.daivanlabs.site',
    'http://localhost:8080', // For local frontend development
    'http://localhost:5173', // For local frontend development (e.g., Vite)
    'null'                   // For requests from file:// protocol, if needed
  ];

  // Determine the Access-Control-Allow-Origin value
  if (allowedOrigins.includes(requestOrigin)) {
    corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
  } else {
    // For any other origin not in the whitelist, or if requestOrigin is empty.
    // Set a default ACAO. If an unallowed origin makes a request,
    // the browser will block it because Origin and ACAO won't match.
    // This ensures the ACAO header is always present in the response.
    corsHeaders['Access-Control-Allow-Origin'] = 'https://cardicare.daivanlabs.site'; 
    if (requestOrigin && requestOrigin !== 'null' && !allowedOrigins.includes(requestOrigin)) {
      console.log(`CORS: Origin '${requestOrigin}' not in allowed list. Defaulting ACAO to primary domain to ensure header presence.`);
    }
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    // The corsHeaders object should now reliably have Access-Control-Allow-Origin set.
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders
    });
  }

  // For actual GET/POST requests, proceed with application logic
  try {
    const data = await request.json();
    const drugs = data.drugs || [];
    
    if (drugs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least two drugs are required for interaction check' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders // Spread the determined CORS headers
          }
        }
      );
    }

    const interactions = checkDrugInteractions(drugs);
    
    return new Response(
      JSON.stringify({ interactions }), 
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders // Spread the determined CORS headers
        }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders // Spread the determined CORS headers, even for errors
        }
      }
    );
  }
}

// Mock database of drug interactions
const knownInteractions = {
  'aspirin-warfarin': {
    severity: 'Moderate',
    description: 'Combined use may increase the risk of bleeding.'
  },
  'aspirin-ibuprofen': {
    severity: 'Mild',
    description: 'May decrease the cardioprotective effects of aspirin.'
  },
  'warfarin-ibuprofen': {
    severity: 'Moderate to Severe',
    description: 'May increase the risk of gastrointestinal bleeding.'
  },
  'warfarin-amiodarone': {
    severity: 'Severe',
    description: 'May enhance the anticoagulant effect of warfarin, increasing bleeding risk.'
  },
  'lisinopril-potassium': {
    severity: 'Moderate',
    description: 'May increase potassium levels, potentially leading to hyperkalemia.'
  },
  'simvastatin-amiodarone': {
    severity: 'Severe',
    description: 'May increase the risk of muscle breakdown (rhabdomyolysis).'
  },
  'clopidogrel-omeprazole': {
    severity: 'Moderate',
    description: 'May reduce the effectiveness of clopidogrel.'
  }
  // Add more known interactions as needed
}

// Function to check drug interactions
function checkDrugInteractions(drugs) {
  const interactions = []
  
  // Check each pair of drugs
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drug1 = drugs[i].toLowerCase()
      const drug2 = drugs[j].toLowerCase()
      
      // Check both orderings of the pair
      const key1 = `${drug1}-${drug2}`
      const key2 = `${drug2}-${drug1}`
      
      if (knownInteractions[key1]) {
        interactions.push({
          pair: [drugs[i], drugs[j]],
          severity: knownInteractions[key1].severity,
          description: knownInteractions[key1].description
        })
      } else if (knownInteractions[key2]) {
        interactions.push({
          pair: [drugs[i], drugs[j]],
          severity: knownInteractions[key2].severity,
          description: knownInteractions[key2].description
        })
      }
    }
  }
  
  return interactions
}
