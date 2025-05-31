import './CustomButton.js'; // Ensure CustomButton is defined

class TodoInput extends HTMLElement {
  static templateCache = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static async fetchTemplate(elementName = 'todo-input', data = {}) {
    const query = new URLSearchParams(data).toString();
    // const cacheKey = `${elementName}?${query}`;
    // if (this.templateCache.has(cacheKey)) return this.templateCache.get(cacheKey);

    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateString = await response.text();
    // this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async connectedCallback() {
    const templateString = await TodoInput.fetchTemplate('todo-input');
    const tempTemplate = document.createElement('template');
    tempTemplate.innerHTML = templateString;

    if (tempTemplate.content.firstChild && tempTemplate.content.firstChild.nodeName === 'TEMPLATE' && tempTemplate.content.firstChild.hasAttribute('shadowrootmode')) {
      const dsdTemplateElement = tempTemplate.content.firstChild;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(dsdTemplateElement.content.cloneNode(true));
    } else {
      this.shadowRoot.innerHTML = templateString;
    }

    this._input = this.shadowRoot.querySelector('input[type="text"]');
    this._addButton = this.shadowRoot.querySelector('.add-btn');

    this._addButton.addEventListener('click', () => this._handleAdd());
    this._input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this._handleAdd();
      }
    });
  }

  _handleAdd() {
    const text = this._input.value.trim();
    if (text) {
      this.dispatchEvent(new CustomEvent('todo-add', {
        detail: { text: text },
        bubbles: true,
        composed: true
      }));
      this._input.value = ''; // Clear input
    }
  }
}
customElements.define('todo-input', TodoInput);
export { TodoInput };
