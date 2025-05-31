class InfoBadge extends HTMLElement {
  static templateCache = new Map(); // Cache fetched template strings

  constructor() {
    super();
    // DSD will create the shadow root. If not using DSD initially, create it here.
    if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
    }
  }

  static async fetchTemplate(elementName, data = {}) {
    const query = new URLSearchParams(data).toString();
    const cacheKey = `${elementName}?${query}`;
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey);
    }

    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template for ${elementName}: ${response.statusText}`);
    }
    const templateString = await response.text(); // This is the full <template>...</template> string
    this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async render() {
    const text = this.getAttribute('data-text') || 'Default Badge Text';
    try {
      // Fetch the pre-rendered HTML content for this instance
      // This will be the full "<template shadowrootmode='open'>...interpolated styles and HTML...</template>"
      const fullTemplateString = await InfoBadge.fetchTemplate('info-badge', { text: text });

      // To apply this to the shadowRoot, we need its *content*.
      // Create a temporary template element to parse the string
      const tempTemplate = document.createElement('template');
      tempTemplate.innerHTML = fullTemplateString;

      // If the server sent a DSD template, its content is what we need for the shadow root.
      if (tempTemplate.content.firstChild && tempTemplate.content.firstChild.nodeName === 'TEMPLATE' && tempTemplate.content.firstChild.hasAttribute('shadowrootmode')) {
         // It's a DSD template element. We need its content's content.
         const dsdTemplateElement = tempTemplate.content.firstChild;
         this.shadowRoot.innerHTML = ''; // Clear previous content
         this.shadowRoot.appendChild(dsdTemplateElement.content.cloneNode(true));
      } else {
         // Fallback or if the server just sends the content directly (not a full DSD string)
         this.shadowRoot.innerHTML = fullTemplateString; // This assumes the server sent ready-to-use innerHTML for shadow DOM
      }

    } catch (error) {
      console.error('Error rendering InfoBadge:', error);
      this.shadowRoot.innerHTML = '<p>Error loading badge.</p>';
    }
  }

  connectedCallback() {
    // If the element was server-rendered with DSD, the shadow root is already populated.
    // We might only need to call render() if we want to update it or if it was client-side only.
    if (this.shadowRoot.innerHTML === '') { // Heuristic: if shadow DOM is empty, render it.
        this.render();
    }
  }

  // Example of reacting to attribute changes
  static get observedAttributes() { return ['data-text']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-text' && oldValue !== newValue) {
      this.render(); // Re-render when data-text changes
    }
  }
}

customElements.define('info-badge', InfoBadge);
export { InfoBadge };
