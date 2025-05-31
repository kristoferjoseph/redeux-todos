class CustomButton extends HTMLElement {
  static templateCache = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static async fetchTemplate(elementName = 'custom-button', data = {}) {
    const query = new URLSearchParams(data).toString();
    const cacheKey = `${elementName}?${query}`;
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey);
    }
    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateString = await response.text();
    this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async render() {
    // For a generic button, data might include label if not using slot, or classes etc.
    // Here, the label is primarily from the slot.
    const templateString = await CustomButton.fetchTemplate('custom-button', {
      // text: this.textContent // Alternative if not using slot primarily
    });

    const tempTemplate = document.createElement('template');
    tempTemplate.innerHTML = templateString; // Server returns the DSD <template> tag

    if (tempTemplate.content.firstChild && tempTemplate.content.firstChild.nodeName === 'TEMPLATE' && tempTemplate.content.firstChild.hasAttribute('shadowrootmode')) {
      const dsdTemplateElement = tempTemplate.content.firstChild;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(dsdTemplateElement.content.cloneNode(true));
    } else {
      this.shadowRoot.innerHTML = templateString;
    }

    this._button = this.shadowRoot.querySelector('button');
    this.disabled = this.hasAttribute('disabled'); // Sync disabled state
  }

  connectedCallback() {
    if (this.shadowRoot.innerHTML === '') {
      this.render();
    }
    // Forward click events from the internal button to the custom element
    // This is important for external event listeners on <custom-button>
    this.shadowRoot.addEventListener('click', (e) => {
        if(this.disabled) {
            e.stopPropagation();
            return;
        }
        // Re-dispatch the event from the host element
        this.dispatchEvent(new MouseEvent('click', {
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            composed: true // Allow event to cross shadow boundary
        }));
    });
  }

  static get observedAttributes() { return ['disabled']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled') {
      this.disabled = newValue !== null;
      if (this._button) {
        this._button.disabled = this.disabled;
      }
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}
customElements.define('custom-button', CustomButton);
export { CustomButton };
