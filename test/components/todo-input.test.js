if (typeof tap !== 'undefined') {
  tap.test('TodoInput Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    t.teardown(() => document.body.removeChild(container));

    t.test('should render input and button', async (st) => {
      container.innerHTML = '<todo-input></todo-input>';
      const inputComponent = container.querySelector('todo-input');
      await new Promise(r => setTimeout(r, 50));

      st.ok(inputComponent.shadowRoot.querySelector('input[type="text"]'), 'Text input exists');
      st.ok(inputComponent.shadowRoot.querySelector('custom-button.add-btn'), 'Add button exists');
      st.end();
    });

    t.test('should dispatch todo-add event on button click with text', async (st) => {
      container.innerHTML = '<todo-input></todo-input>';
      const inputComponent = container.querySelector('todo-input');
      await new Promise(r => setTimeout(r, 50));

      let eventDetail;
      inputComponent.addEventListener('todo-add', (e) => eventDetail = e.detail);

      const textInput = inputComponent.shadowRoot.querySelector('input[type="text"]');
      const addButton = inputComponent.shadowRoot.querySelector('custom-button.add-btn');

      textInput.value = 'New todo task  '; // With trailing space
      addButton.click();

      st.ok(eventDetail, 'todo-add event dispatched');
      st.equal(eventDetail.text, 'New todo task', 'Event detail contains trimmed text');
      st.equal(textInput.value, '', 'Input field should be cleared');
      st.end();
    });

    t.test('should dispatch todo-add event on Enter key press', async (st) => {
      container.innerHTML = '<todo-input></todo-input>';
      const inputComponent = container.querySelector('todo-input');
      await new Promise(r => setTimeout(r, 50));

      let eventDetail;
      inputComponent.addEventListener('todo-add', (e) => eventDetail = e.detail);

      const textInput = inputComponent.shadowRoot.querySelector('input[type="text"]');
      textInput.value = 'Via Enter';
      textInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

      st.ok(eventDetail, 'todo-add event dispatched on Enter');
      st.equal(eventDetail.text, 'Via Enter');
      st.equal(textInput.value, '', 'Input field cleared');
      st.end();
    });

    t.test('should not dispatch todo-add event if text is empty', async (st) => {
      container.innerHTML = '<todo-input></todo-input>';
      const inputComponent = container.querySelector('todo-input');
      await new Promise(r => setTimeout(r, 50));

      let eventDispatched = false;
      inputComponent.addEventListener('todo-add', () => eventDispatched = true);

      inputComponent.shadowRoot.querySelector('custom-button.add-btn').click();
      st.notOk(eventDispatched, 'todo-add event should not be dispatched for empty text');
      st.end();
    });

    t.end();
  });
} else { console.warn('TAP not loaded, skipping todo-input.test.js'); }
