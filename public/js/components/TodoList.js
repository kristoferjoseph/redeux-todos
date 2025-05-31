import './TodoItem.js'; // Ensure todo-item is defined

class TodoList extends HTMLElement {
  static templateCache = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = []; // Internal store of item data
  }

  static async fetchTemplate(elementName = 'todo-list', data = {}) {
    const query = new URLSearchParams(data).toString();
    // const cacheKey = `${elementName}?${query}`; // Caching can be complex with dynamic list content
    // if (this.templateCache.has(cacheKey)) return this.templateCache.get(cacheKey);

    const response = await fetch(`/render/${elementName}?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateString = await response.text();
    // this.templateCache.set(cacheKey, templateString);
    return templateString;
  }

  async connectedCallback() {
    // Initial render of the list structure (slot, empty message)
    const templateString = await TodoList.fetchTemplate('todo-list', { items: this._items, emptyMessage: this.getAttribute('empty-message') });
    const tempTemplate = document.createElement('template');
    tempTemplate.innerHTML = templateString;

    if (tempTemplate.content.firstChild && tempTemplate.content.firstChild.nodeName === 'TEMPLATE' && tempTemplate.content.firstChild.hasAttribute('shadowrootmode')) {
      const dsdTemplateElement = tempTemplate.content.firstChild;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(dsdTemplateElement.content.cloneNode(true));
    } else {
      this.shadowRoot.innerHTML = templateString;
    }

    // If items are passed via an attribute initially (e.g. JSON string)
    if (this.hasAttribute('items')) {
        try {
            const itemsData = JSON.parse(this.getAttribute('items'));
            if (Array.isArray(itemsData)) {
                this.items = itemsData; // Use setter to render
            }
        } catch (e) {
            console.error('Error parsing items attribute on todo-list:', e);
        }
    } else {
        this.renderItems(); // Render based on current _items
    }
  }

  get items() {
    return this._items;
  }

  set items(newItems) {
    if (!Array.isArray(newItems)) {
        console.warn('TodoList: items must be an array.');
        return;
    }
    this._items = newItems;
    this.renderItems();
    this.updateEmptyState();
  }

  renderItems() {
    const container = this.shadowRoot.querySelector('.list-container') || this; // Fallback to host for items if slot not used explicitly by server

    // Clear existing items (except the slot itself if it's the container)
    while(container.firstChild && container.firstChild.nodeName !== 'SLOT') {
        container.removeChild(container.firstChild);
    }
    if (container.nodeName === 'SLOT') { // If container is the slot, clear light DOM
        Array.from(this.childNodes).forEach(node => {
            if (node.nodeName === 'TODO-ITEM') this.removeChild(node);
        });
    }


    this._items.forEach(itemData => {
      const todoItem = document.createElement('todo-item');
      todoItem.setAttribute('data-id', itemData.id);
      todoItem.setAttribute('data-text', itemData.text);
      if (itemData.done) {
        todoItem.setAttribute('data-done', '');
      }
      if (itemData.editing) {
        todoItem.setAttribute('data-editing', '');
      }
      // If using slot, append to light DOM. Otherwise, append to shadow DOM container.
      if (this.shadowRoot.querySelector('slot')) {
          this.appendChild(todoItem); // Item goes into the slot
      } else {
          container.appendChild(todoItem);
      }
    });
  }

  updateEmptyState() {
    // Re-fetch/re-render the shell to update the empty state message visibility
    // This is a bit heavy; a more targeted update would be better.
    (async () => {
        const emptyMessageElement = this.shadowRoot.querySelector('.empty-state');
        const templateString = await TodoList.fetchTemplate('todo-list', { items: this._items, emptyMessage: this.getAttribute('empty-message') });

        // Create a temporary div to parse the new template's empty state part
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateString;
        const newEmptyStateElement = tempDiv.querySelector('.empty-state');

        if (newEmptyStateElement && !emptyMessageElement) { // Add if new and not existing
            this.shadowRoot.appendChild(newEmptyStateElement);
        } else if (!newEmptyStateElement && emptyMessageElement) { // Remove if not new and existing
            emptyMessageElement.remove();
        } else if (newEmptyStateElement && emptyMessageElement) { // Replace if both exist
            emptyMessageElement.replaceWith(newEmptyStateElement);
        }
    })();
  }
}
customElements.define('todo-list', TodoList);
export { TodoList };
