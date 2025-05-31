if (typeof tap !== 'undefined') {
  tap.test('TodoList Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    t.teardown(() => document.body.removeChild(container));

    t.test('should render empty state message', async (st) => {
      container.innerHTML = '<todo-list empty-message="Nothing here!"></todo-list>';
      const list = container.querySelector('todo-list');
      await new Promise(r => setTimeout(r, 100)); // Wait for render & empty state update

      const emptyState = list.shadowRoot.querySelector('.empty-state');
      st.ok(emptyState, 'Empty state element should exist');
      st.includes(emptyState.textContent, 'Nothing here!', 'Custom empty message shown');
      st.end();
    });

    t.test('should render todo items from items property', async (st) => {
      container.innerHTML = '<todo-list></todo-list>';
      const list = container.querySelector('todo-list');
      await new Promise(r => setTimeout(r, 50)); // initial render

      list.items = [
        { id: 't1', text: 'Item 1', done: false },
        { id: 't2', text: 'Item 2', done: true }
      ];
      await new Promise(r => setTimeout(r, 100)); // wait for items to render

      const todoItemElements = list.querySelectorAll('todo-item'); // Items are in light DOM for slot
      st.equal(todoItemElements.length, 2, 'Should render two todo items');
      st.equal(todoItemElements[0].getAttribute('data-text'), 'Item 1');
      st.ok(todoItemElements[1].hasAttribute('data-done'), 'Second item should be done');

      const emptyState = list.shadowRoot.querySelector('.empty-state');
      st.notOk(emptyState, 'Empty state should not be present when there are items');
      st.end();
    });

    t.test('should update when items property changes', async (st) => {
      container.innerHTML = '<todo-list></todo-list>';
      const list = container.querySelector('todo-list');
      await new Promise(r => setTimeout(r, 50));
      list.items = [{ id: 't1', text: 'Initial', done: false }];
      await new Promise(r => setTimeout(r, 100));
      st.equal(list.querySelectorAll('todo-item').length, 1);

      list.items = [
        { id: 't2', text: 'New1', done: false },
        { id: 't3', text: 'New2', done: false }
      ];
      await new Promise(r => setTimeout(r, 100));
      st.equal(list.querySelectorAll('todo-item').length, 2, 'Should render updated list');
      st.equal(list.querySelectorAll('todo-item')[0].getAttribute('data-text'), 'New1');
      st.end();
    });

    t.end();
  });
} else { console.warn('TAP not loaded, skipping todo-list.test.js'); }
