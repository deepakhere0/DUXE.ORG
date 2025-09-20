/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as cors from "cors";

// Configure CORS for all origins dynamically
const corsHandler = cors({
  origin: true, // Allow all origins dynamically
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'X-Requested-With', 
    'X-Auth-Token',
    'X-HTTP-Method-Override'
  ]
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Sample API endpoint with dynamic CORS enabled for all origins
export const api = onRequest((request, response) => {
  corsHandler(request, response, () => {
    logger.info("API called", {
      structuredData: true,
      origin: request.get('origin'),
      method: request.method
    });
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      response.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Auth-Token');
      response.set('Access-Control-Max-Age', '86400');
      response.status(204).send('');
      return;
    }
    
    // Your API logic here
    response.json({
      message: "Hello from Firebase API! CORS enabled for all origins.",
      timestamp: new Date().toISOString(),
      method: request.method,
      origin: request.get('origin') || 'No origin header',
      userAgent: request.get('user-agent')
    });
  });
});
