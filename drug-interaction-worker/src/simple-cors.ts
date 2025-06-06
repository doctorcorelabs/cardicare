/**
 * Simple Drug Interaction Worker with permissive CORS
 */

export interface Env {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Log request details
    console.log(`Received ${request.method} request from origin: ${request.headers.get('Origin')}`);
    
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      // Log preflight request
      console.log('Handling CORS preflight request');
      
      // Return very permissive CORS headers for preflight
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Handle POST request
    if (request.method === 'POST') {
      try {
        // Parse request body
        const body = await request.json();
        const drugNames = body.drugs || [];
        console.log('Received drug names:', drugNames);
        
        // Return a mock response with permissive CORS headers
        return new Response(
          JSON.stringify({
            interactions: [
              {
                pair: ['aspirin', 'warfarin'],
                severity: 'High',
                description: 'This is a mock interaction. Both drugs have anticoagulant effects and may increase bleeding risk when used together.'
              }
            ]
          }),
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        // Return error response with CORS headers
        return new Response(
          JSON.stringify({ error: 'Failed to parse request' }),
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // Return method not allowed for other methods
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json'
        }
      }
    );
  },
};
