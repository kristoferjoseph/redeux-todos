import { CustomButton } from './CustomButton.js'; // Ensure CustomButton is loaded

class TodoItem extends HTMLElement {
  static templateCache = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = {
      id: null,
      text: '',
      done: false,
      editing: false
    };
  }

  static async fetchTemplate(elementName = 'todo-item', data = {}) {
    const query = new URLSearchParams(data).toString();
    const cacheKey = `${elementName}?${query}`;
    // if (this.templateCache.has(cacheKey)) { // Caching can be tricky with dynamic content from server
    //   return this.templateCache.get(cacheKey);
    // }
    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateString = await response.text();
    // this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async render() {
    const templateString = await TodoItem.fetchTemplate('todo-item', this._state);
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
    // Initial state from attributes
    this._state.id = this.getAttribute('data-id');
    this._state.text = this.getAttribute('data-text') || 'New Todo';
    this._state.done = this.hasAttribute('data-done');
    this._state.editing = this.hasAttribute('data-editing');

    if (this.shadowRoot.innerHTML === '') {
      this.render();
    }
  }

  addEventListeners() {
    const toggle = this.shadowRoot.querySelector('.toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.dispatchEvent(new CustomEvent('todo-toggle', {
          detail: { id: this._state.id, done: e.target.checked },
          bubbles: true, composed: true
        }));
      });
    }

    const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('todo-delete', {
          detail: { id: this._state.id },
          bubbles: true, composed: true
        }));
      });
    }

    const textSpan = this.shadowRoot.querySelector('span.text');
    if (textSpan) {
        textSpan.addEventListener('dblclick', () => {
            this.enterEditMode();
        });
    }

    const editInput = this.shadowRoot.querySelector('input.edit');
    if (editInput) {
        editInput.focus();
        editInput.addEventListener('blur', () => this.saveEdit());
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.cancelEdit();
        });
    }
  }

  enterEditMode() {
    this._state.editing = true;
    this.render(); // Re-render to show input field
  }

  saveEdit() {
    const editInput = this.shadowRoot.querySelector('input.edit');
    if (editInput) {
        const newText = editInput.value.trim();
        if (newText && newText !== this._state.text) {
             this.dispatchEvent(new CustomEvent('todo-edit', {
                detail: { id: this._state.id, text: newText },
                bubbles: true, composed: true
            }));
        }
        this._state.text = newText || this._state.text; // Keep old if empty
    }
    this._state.editing = false;
    this.render(); // Re-render to show text span
  }

  cancelEdit() {
    this._state.editing = false;
    this.render(); // Re-render to show text span without saving
  }

  static get observedAttributes() { return ['data-id', 'data-text', 'data-done', 'data-editing']; }

  attributeChangedCallback(name, oldValue, newValue) {
    const stateKey = name.substring(5); // remove "data-"
    let value = newValue;
    if (name === 'data-done' || name === 'data-editing') {
      value = newValue !== null;
    }

    if (this._state[stateKey] !== value) {
      this._state[stateKey] = value;
      // Avoid re-rendering if only id changes or if component not fully initialized
      if (this.shadowRoot.innerHTML !== '' && name !== 'data-id') {
        this.render();
      }
    }
  }
}
customElements.define('todo-item', TodoItem);
export { TodoItem };
