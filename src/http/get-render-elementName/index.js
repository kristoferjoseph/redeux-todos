const fs = require('fs');
const path = require('path');

// Basic security: prevent directory traversal
function isValidElementName(elementName) {
  if (!elementName || typeof elementName !== 'string') return false;
  return !elementName.includes('..') && /^[a-zA-Z0-9_-]+$/.test(elementName);
}

// Interpolate function (simplified, from previous step)
// Adjusted to take templateString and a data object.
function interpolate(templateString, dataObject) {
  if (typeof templateString !== 'string') return '';
  let result = templateString;
  if (dataObject && typeof dataObject === 'object') {
    for (const key in dataObject) {
      // Regex to match ${data.key}, ${ data.key }, etc.
      // Or, if dataObject is passed directly, ${key}
      const regex = new RegExp(\`\\$\\{data\.${key}\\}\`, 'g');
      result = result.replace(regex, dataObject[key]);
    }
  }
  // Clean up any unreplaced ${data.xyz} tags
  result = result.replace(/\$\{\s*data\.\w+\s*\}/g, '');
  return result;
}


async function renderElement(elementName, data, fetchPromises = new Set()) {
  if (!isValidElementName(elementName)) {
    console.warn(\`[Render] Invalid element name requested: \${elementName}\`);
    return ''; // Or throw error
  }

  const templatePath = path.join(__dirname, '..', '..', '..', 'elements', `${elementName}.html`);

  if (!fs.existsSync(templatePath)) {
    console.warn(\`[Render] Template not found: \${templatePath}\`);
    return ''; // Or throw error for critical missing elements
  }

  let htmlContent = fs.readFileSync(templatePath, 'utf-8');

  // 1. Interpolate the current template with its data
  htmlContent = interpolate(htmlContent, data);

  // 2. Handle nested elements (recursive call)
  // Regex to find custom elements like <tag-name ...></tag-name> or <tag-name ... />
  // This is a simplified regex and might need refinement for complex cases.
  // It captures the tag name, attributes, and content (for slotting).
  const nestedElementRegex = /<([a-zA-Z0-9-]+)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*>((?:.|
)*?)<\/>/g;
  let match;

  // Use a Promise.all to handle all nested renderings concurrently for this level
  const renderingPromises = [];

  // Store parts of the HTML to rebuild it later
  let lastIndex = 0;
  const newHtmlParts = [];

  while ((match = nestedElementRegex.exec(htmlContent)) !== null) {
    newHtmlParts.push(htmlContent.substring(lastIndex, match.index)); // Part before the match

    const nestedTagName = match[1];
    const attributesString = match[2];
    const nestedContent = match[3]; // This is the content between <nested-tag> and </nested-tag> for slots

    // Heuristic: if the tag name looks like a custom element (contains a hyphen), try to render it.
    if (nestedTagName.includes('-')) {
      const nestedData = {};
      // Parse attributes to pass as data to nested component
      const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let attrMatch;
      if (attributesString) {
        while ((attrMatch = attrRegex.exec(attributesString)) !== null) {
          nestedData[attrMatch[1]] = attrMatch[2] || attrMatch[3] || attrMatch[4] || true;
          // Interpolate attribute values if they contain \${data.xxx}
          if (typeof nestedData[attrMatch[1]] === 'string') {
            nestedData[attrMatch[1]] = interpolate(nestedData[attrMatch[1]], data);
          }
        }
      }

      // Prepare slotted content object
      const slots = { default: nestedContent }; // Simplified: all innerHTML is default slot for now
      // A more robust slot parsing would identify named slots from `nestedContent`.
      // For now, the child component will receive `nestedContent` as `data.slotDefaultContent`.
      // Or, we modify how slots are passed/used.
      // The current `htmlContent` for `parent-element` has `<child-element ...></child-element>` (empty content).
      // If it were `<child-element>SLOTTED</child-element>`, then `nestedContent` would be "SLOTTED".

      const promise = renderElement(nestedTagName, { ...data, ...nestedData, _slotContentFromParent: nestedContent }, fetchPromises).then(renderedNestedHtml => {
        return { index: match.index, length: match[0].length, rendered: renderedNestedHtml };
      });
      renderingPromises.push(promise);
      newHtmlParts.push({promise}); // Placeholder for the rendered nested element
    } else {
      newHtmlParts.push(match[0]); // Not a custom element, push original tag
    }
    lastIndex = nestedElementRegex.lastIndex;
  }
  newHtmlParts.push(htmlContent.substring(lastIndex)); // Part after the last match

  const resolvedRenderings = await Promise.all(renderingPromises);

  // Reconstruct HTML by replacing placeholders with rendered nested elements
  // This part is a bit tricky due to async replacements.
  // A simpler approach for now: iterate and replace. For more complex scenarios, might need to build string piece by piece.
  // For this iteration, let's simplify: The regex replacement will be iterative.
  // This means an outer element finishes rendering its direct children, then those children render theirs.

  // Re-simplifying the loop for sequential replacement for clarity in this step:
  // This is less performant than Promise.all but easier to reason about for replacement.
  let processedHtml = interpolate(fs.readFileSync(templatePath, 'utf-8'), data); // Start fresh for this instance

  // Handle nested elements (recursive replacement)
  const elementRegex = /<([a-zA-Z0-9-]+)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*>([\s\S]*?)<\/>|<([a-zA-Z0-9-]+)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/>/g;
  let currentMatch;
  while((currentMatch = elementRegex.exec(processedHtml))) {
      const tagName = currentMatch[1] || currentMatch[4];
      const attributes = currentMatch[2] || currentMatch[5];
      const content = currentMatch[3] || ''; // Content for slotting

      if (tagName.includes('-')) { // Likely a custom element
          const childData = {};
          const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
          let attrMatch;
          if (attributes) {
              while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                  let value = attrMatch[2] || attrMatch[3] || attrMatch[4] || true;
                  if (typeof value === 'string') {
                      value = interpolate(value, data); // Interpolate attributes based on parent's data
                  }
                  childData[attrMatch[1].startsWith('data-') ? attrMatch[1].substring(5) : attrMatch[1]] = value;
              }
          }

          let renderedChild = await renderElement(tagName, { ...data, ...childData, _slotContentFromParent: content }, fetchPromises);
          processedHtml = processedHtml.replace(currentMatch[0], renderedChild);
          elementRegex.lastIndex = 0; // Reset regex index due to string modification
      }
  }

  // 3. Handle slots (using the passed _slotContentFromParent)
  // If this element instance was given slot content from its parent:
  if (data && data._slotContentFromParent) {
    // Default slot: replace <slot></slot> or <slot/>
    processedHtml = processedHtml.replace(/<slot\s*(?:\/>|>\s*<\/slot>)/g, data._slotContentFromParent);
    // Named slots: replace <slot name="X"></slot> with content from <tag slot="X">
    // This requires parsing _slotContentFromParent for elements with `slot="name"` attributes.
    // This is a simplified version. A full slot implementation is more complex.
    const namedSlotRegex = /<slot\s+name="([^"]+)"\s*(?:\/>|>\s*<\/slot>)/g;
    processedHtml = processedHtml.replace(namedSlotRegex, (slotMatch, slotName) => {
        // Extract content for this named slot from _slotContentFromParent
        // E.g., find <element slot="slotName">content</element> within _slotContentFromParent
        // This is a placeholder for actual named slot content extraction.
        // For now, we'll assume _slotContentFromParent is simple text for default slot.
        // A proper implementation would parse _slotContentFromParent, find elements with slot="<name>",
        // and use their outerHTML.
        // For this iteration, named slots are NOT fully implemented beyond finding the tag.
        // We'll return a placeholder for named slots.
        return `<!-- Content for slot '\${slotName}' from parent would go here -->`;
    });
  }
  // Remove any remaining slot tags if no content was provided
  processedHtml = processedHtml.replace(/<slot[^>]*>(?:<\/slot>)?/g, '');


  return processedHtml;
}

exports.handler = async function http(req) {
  const elementName = req.params.elementName;
  if (!isValidElementName(elementName)) {
    return { statusCode: 400, json: { error: 'Invalid or missing elementName' } };
  }

  const queryParams = req.queryStringParameters || {};
  const data = { ...queryParams };
  for (const key in data) { // Basic type conversion
    if (data[key] === 'true') data[key] = true;
    else if (data[key] === 'false') data[key] = false;
    else if (!isNaN(data[key]) && data[key].trim() !== '') data[key] = Number(data[key]);
  }

  try {
    const fetchPromises = new Set(); // For tracking async operations if any deeper ones arise
    const renderedHtml = await renderElement(elementName, data, fetchPromises);
    await Promise.all(Array.from(fetchPromises)); // Ensure all async ops are done

    return {
      statusCode: 200,
      headers: { 'content-type': 'text/html; charset=utf8' },
      body: renderedHtml
    };
  } catch (error) {
    console.error(\`[Handler Error] Rendering \${elementName}:\`, error);
    return { statusCode: 500, json: { error: 'Failed to render template', details: error.message }};
  }
};
