// Super simple worker with proper CORS support
// This file handles drug interaction API requests with proper CORS headers

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Set CORS headers to allow requests from any origin
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400'
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Parse the request body
    const data = await request.json()
    const drugs = data.drugs || []
    
    if (drugs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least two drugs are required for interaction check' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Perform the interaction check using our mock data
    const interactions = checkDrugInteractions(drugs)
    
    return new Response(
      JSON.stringify({ interactions }), 
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
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