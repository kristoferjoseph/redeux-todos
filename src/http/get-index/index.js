// src/http/get-index/index.js
// This handler needs to serve the main public/index.html file for the SPA.
// Architect's @static pragma handles serving assets from public/,
// but the root path '/' needs to explicitly serve the HTML file.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async function http(req) {
  // Path to public/index.html relative to this lambda's execution context
  // Lambdas run from src/http/get-index, so path is ../../../public/index.html
  const indexPath = path.join(__dirname, '..', '..', '..', 'public', 'index.html');

  try {
    const htmlContent = fs.readFileSync(indexPath, 'utf-8');
    return {
      headers: { 'content-type': 'text/html; charset=utf8' },
      body: htmlContent,
      statusCode: 200
    };
  } catch (error) {
    console.error("Error reading public/index.html:", error);
    return {
      headers: { 'content-type': 'text/plain; charset=utf8' },
      body: 'Application not found.',
      statusCode: 404 // Or 500 if it's an unexpected server error
    };
  }
}
