import './CustomButton.js';

class TodoFooter extends HTMLElement {
  static templateCache = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = {
      activeCount: 0,
      completedCount: 0,
      filter: 'all' // 'all', 'active', 'completed'
    };
  }

  static async fetchTemplate(elementName = 'todo-footer', data = {}) {
    const query = new URLSearchParams(data).toString();
    // const cacheKey = `${elementName}?${query}`;
    // if (this.templateCache.has(cacheKey)) return this.templateCache.get(cacheKey);

    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateString = await response.text();
    // this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async render() {
    // Hide component if no todos at all (activeCount + completedCount === 0)
    if ((this._state.activeCount + this._state.completedCount) === 0) {
        this.setAttribute('hidden', '');
    } else {
        this.removeAttribute('hidden');
    }

    const templateString = await TodoFooter.fetchTemplate('todo-footer', this._state);
    const tempTemplate = document.createElement('template');
    tempTemplate.innerHTML = templateString;

    if (tempTemplate.content.firstChild && tempTemplate.content.firstChild.nodeName === 'TEMPLATE' && tempTemplate.content.firstChild.hasAttribute('shadowrootmode')) {
      const dsdTemplateElement = tempTemplate.content.firstChild;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(dsdTemplateElement.content.cloneNode(true));
    } else {
      this.shadowRoot.innerHTML = templateString;
    }
    this.addEventListeners();
  }

  connectedCallback() {
    // Initial state from attributes or defaults
    this.updateStateFromAttributes();
    if (this.shadowRoot.innerHTML === '') {
      this.render();
    }
  }

  updateStateFromAttributes() {
    this._state.activeCount = parseInt(this.getAttribute('data-active-count') || '0', 10);
    this._state.completedCount = parseInt(this.getAttribute('data-completed-count') || '0', 10);
    this._state.filter = this.getAttribute('data-filter') || 'all';
  }

  addEventListeners() {
    this.shadowRoot.querySelectorAll('.filters custom-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const newFilter = e.target.getAttribute('data-filter');
        if (newFilter) {
          this.dispatchEvent(new CustomEvent('filter-change', {
            detail: { filter: newFilter },
            bubbles: true, composed: true
          }));
        }
      });
    });

    const clearCompletedBtn = this.shadowRoot.querySelector('.clear-completed');
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('clear-completed', {
          bubbles: true, composed: true
        }));
      });
    }
  }

  static get observedAttributes() {
    return ['data-active-count', 'data-completed-count', 'data-filter'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const oldState = { ...this._state };
    this.updateStateFromAttributes();

    // Only re-render if state actually changed
    if (JSON.stringify(this._state) !== JSON.stringify(oldState)) {
        if (this.shadowRoot.innerHTML !== '') { // Check if connected and initially rendered
            this.render();
        }
    }
  }
}
customElements.define('todo-footer', TodoFooter);
export { TodoFooter };
