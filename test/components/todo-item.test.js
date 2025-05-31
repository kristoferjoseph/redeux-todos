if (typeof tap !== 'undefined') {
  tap.test('TodoItem Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    t.teardown(() => document.body.removeChild(container));

    t.test('should render with text and id', async (st) => {
      container.innerHTML = '<todo-item data-id="todo1" data-text="Buy milk"></todo-item>';
      const item = container.querySelector('todo-item');
      await new Promise(r => setTimeout(r, 100)); // Wait for render

      st.ok(item.shadowRoot.querySelector('.text'), 'Text span exists');
      st.includes(item.shadowRoot.querySelector('.text').textContent, 'Buy milk');
      st.notOk(item.shadowRoot.querySelector('.toggle').checked, 'Checkbox is not checked');
      st.end();
    });

    t.test('should reflect "done" state', async (st) => {
      container.innerHTML = '<todo-item data-id="todo2" data-text="Get bread" data-done></todo-item>';
      const item = container.querySelector('todo-item');
      await new Promise(r => setTimeout(r, 100));

      st.ok(item.shadowRoot.querySelector('.toggle').checked, 'Checkbox is checked for done item');
      st.ok(item.shadowRoot.host.hasAttribute('data-done'), 'Host has data-done attribute');
      st.end();
    });

    t.test('should dispatch todo-toggle event on checkbox change', async (st) => {
      container.innerHTML = '<todo-item data-id="todo3" data-text="Toggle test"></todo-item>';
      const item = container.querySelector('todo-item');
      await new Promise(r => setTimeout(r, 100));

      let eventDetail;
      item.addEventListener('todo-toggle', (e) => eventDetail = e.detail);
      item.shadowRoot.querySelector('.toggle').click();

      st.ok(eventDetail, 'todo-toggle event dispatched');
      st.equal(eventDetail.id, 'todo3');
      st.equal(eventDetail.done, true);
      st.end();
    });

    t.test('should dispatch todo-delete event on button click', async (st) => {
      container.innerHTML = '<todo-item data-id="todo4" data-text="Delete test"></todo-item>';
      const item = container.querySelector('todo-item');
      await new Promise(r => setTimeout(r, 100));

      let eventDetail;
      item.addEventListener('todo-delete', (e) => eventDetail = e.detail);
      item.shadowRoot.querySelector('.delete-btn').click();

      st.ok(eventDetail, 'todo-delete event dispatched');
      st.equal(eventDetail.id, 'todo4');
      st.end();
    });

    t.test('should enter edit mode on dblclick', async (st) => {
        container.innerHTML = '<todo-item data-id="todo-edit-1" data-text="Double click me"></todo-item>';
        const item = container.querySelector('todo-item');
        await new Promise(r => setTimeout(r, 100)); // initial render

        const textSpan = item.shadowRoot.querySelector('span.text');
        textSpan.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100)); // wait for re-render

        st.ok(item.shadowRoot.querySelector('input.edit'), 'Input field for editing should be present');
        st.equal(item.shadowRoot.querySelector('input.edit').value, 'Double click me');
        st.end();
    });

    t.test('should dispatch todo-edit event on saving edit', async (st) => {
        container.innerHTML = '<todo-item data-id="todo-edit-2" data-text="Initial text"></todo-item>';
        const item = container.querySelector('todo-item');
        await new Promise(r => setTimeout(r, 100));
        item.enterEditMode(); // Directly call method to enter edit mode
        await new Promise(r => setTimeout(r, 100));

        let eventDetail;
        item.addEventListener('todo-edit', (e) => eventDetail = e.detail);

        const editInput = item.shadowRoot.querySelector('input.edit');
        editInput.value = 'Updated text';
        editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); // Simulate Enter key
        await new Promise(r => setTimeout(r, 100));

        st.ok(eventDetail, 'todo-edit event dispatched');
        st.equal(eventDetail.id, 'todo-edit-2');
        st.equal(eventDetail.text, 'Updated text');
        st.notOk(item.shadowRoot.querySelector('input.edit'), 'Should exit edit mode');
        st.includes(item.shadowRoot.querySelector('span.text').textContent, 'Updated text');
        st.end();
    });

    t.end();
  });
} else { console.warn('TAP not loaded, skipping todo-item.test.js'); }
