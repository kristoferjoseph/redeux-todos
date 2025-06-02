import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic security: prevent directory traversal
function isValidElementName(elementName) {
  if (!elementName || typeof elementName !== 'string') return false;
  return !elementName.includes('..') && /^[a-zA-Z0-9_-]+$/.test(elementName);
}

// Interpolate function
function interpolate(templateString, dataObject) {
  if (typeof templateString !== 'string') return '';
  let result = templateString;
  if (dataObject && typeof dataObject === 'object') {
    for (const key in dataObject) {
      const regex = new RegExp(`\\$\\{data\\.${key}\\}`, 'g');
      result = result.replace(regex, dataObject[key]);
    }
  }
  // Clean up any unreplaced ${data.xyz} tags
  result = result.replace(/\$\{\s*data\.\w+\s*\}/g, '');
  return result;
}

async function renderElement(elementName, data = {}) {
  if (!isValidElementName(elementName)) {
    console.warn(`[Render] Invalid element name requested: ${elementName}`);
    return '';
  }

  const templatePath = path.join(__dirname, '..', '..', '..', 'elements', `${elementName}.html`);

  if (!fs.existsSync(templatePath)) {
    console.warn(`[Render] Template not found: ${templatePath}`);
    return '';
  }

  let htmlContent = fs.readFileSync(templatePath, 'utf-8');

  // 1. Interpolate variables
  htmlContent = interpolate(htmlContent, data);

  // 2. Handle nested custom elements
  let hasChanges = true;
  while (hasChanges) {
    hasChanges = false;
    
    // Find the first custom element (with hyphen) anywhere in the content
    const customElementRegex = /<([a-zA-Z0-9]+-[a-zA-Z0-9-]*)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*>([\s\S]*?)<\/\1>|<([a-zA-Z0-9]+-[a-zA-Z0-9-]*)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/>/;
    
    const match = customElementRegex.exec(htmlContent);
    if (match) {
      const tagName = match[1] || match[4];
      const attributes = match[2] || match[5];
      const content = match[3] || '';

      // Parse attributes
      const childData = { ...data };
      if (attributes) {
        const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
          let key = attrMatch[1];
          let value = attrMatch[2] || attrMatch[3] || attrMatch[4] || true;
          
          // Remove data- prefix if present
          if (key.startsWith('data-')) {
            key = key.substring(5);
          }
          
          // Interpolate attribute values
          if (typeof value === 'string') {
            value = interpolate(value, data);
          }
          
          childData[key] = value;
        }
      }

      // Add slot content
      if (content) {
        childData._slotContentFromParent = content;
      }

      // Render the nested element
      const renderedChild = await renderElement(tagName, childData);
      
      // Replace the original element with the rendered content
      htmlContent = htmlContent.replace(match[0], renderedChild);
      hasChanges = true;
    }
  }

  // 3. Handle slots
  if (data._slotContentFromParent) {
    // Default slot
    htmlContent = htmlContent.replace(/<slot\s*(?:\/>|>\s*<\/slot>)/g, data._slotContentFromParent);
  }
  
  // Named slots - simplified implementation with placeholder comments
  const namedSlotRegex = /<slot\s+name="([^"]+)"\s*(?:\/>|>\s*<\/slot>)/g;
  htmlContent = htmlContent.replace(namedSlotRegex, (slotMatch, slotName) => {
    return `<!-- Content for slot '${slotName}' from parent would go here -->`;
  });

  // Remove any remaining slot tags
  htmlContent = htmlContent.replace(/<slot[^>]*>[\s\S]*?<\/slot>/g, '');
  htmlContent = htmlContent.replace(/<slot[^>]*\/>/g, '');

  return htmlContent;
}

export const handler = async function http(req) {
  const elementName = req.params.elementName;
  if (!isValidElementName(elementName)) {
    return { statusCode: 400, json: { error: 'Invalid or missing elementName' } };
  }

  const queryParams = req.queryStringParameters || {};
  const data = { ...queryParams };
  
  // Basic type conversion
  for (const key in data) {
    if (data[key] === 'true') data[key] = true;
    else if (data[key] === 'false') data[key] = false;
    else if (!isNaN(data[key]) && data[key].trim() !== '') data[key] = Number(data[key]);
  }

  try {
    const renderedHtml = await renderElement(elementName, data);

    return {
      statusCode: 200,
      headers: { 'content-type': 'text/html; charset=utf8' },
      body: renderedHtml
    };
  } catch (error) {
    console.error(`[Handler Error] Rendering ${elementName}:`, error);
    return { statusCode: 500, json: { error: 'Failed to render template', details: error.message }};
  }
};