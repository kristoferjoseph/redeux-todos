if (typeof tap !== 'undefined') {
  tap.test('TodoFooter Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    t.teardown(() => document.body.removeChild(container));

    t.test('should render counts and filters', async (st) => {
      container.innerHTML = \`
        <todo-footer
          data-active-count="2"
          data-completed-count="1"
          data-filter="all">
        </todo-footer>\`;
      const footer = container.querySelector('todo-footer');
      await new Promise(r => setTimeout(r, 100)); // Wait for render

      st.includes(footer.shadowRoot.querySelector('.count').textContent, '2 items left');
      st.ok(footer.shadowRoot.querySelector('.clear-completed'), 'Clear completed button exists');
      st.includes(footer.shadowRoot.querySelector('.clear-completed').textContent, '(1)');
      st.ok(footer.shadowRoot.querySelector('custom-button[data-filter="all"][data-active]'), 'All filter is active');
      st.end();
    });

    t.test('should be hidden if all counts are zero', async (st) => {
        container.innerHTML = \`
          <todo-footer
            data-active-count="0"
            data-completed-count="0"
            data-filter="all">
          </todo-footer>\`;
        const footer = container.querySelector('todo-footer');
        await new Promise(r => setTimeout(r, 100));
        st.ok(footer.hasAttribute('hidden'), 'Footer should be hidden when no todos');
        st.end();
    });

    t.test('should not show clear completed if completedCount is 0', async (st) => {
        container.innerHTML = \`
          <todo-footer
            data-active-count="3"
            data-completed-count="0"
            data-filter="all">
          </todo-footer>\`;
        const footer = container.querySelector('todo-footer');
        await new Promise(r => setTimeout(r, 100));
        st.notOk(footer.shadowRoot.querySelector('.clear-completed'), 'Clear completed button should not exist');
        st.ok(footer.shadowRoot.querySelector('.clear-completed-placeholder'), 'Placeholder for clear button layout should exist');
        st.end();
    });

    t.test('should dispatch filter-change event', async (st) => {
      container.innerHTML = '<todo-footer data-active-count="1"></todo-footer>';
      const footer = container.querySelector('todo-footer');
      await new Promise(r => setTimeout(r, 100));

      let eventDetail;
      footer.addEventListener('filter-change', (e) => eventDetail = e.detail);

      footer.shadowRoot.querySelector('custom-button[data-filter="active"]').click();
      st.ok(eventDetail, 'filter-change event dispatched');
      st.equal(eventDetail.filter, 'active');
      st.end();
    });

    t.test('should dispatch clear-completed event', async (st) => {
      container.innerHTML = '<todo-footer data-completed-count="1"></todo-footer>';
      const footer = container.querySelector('todo-footer');
      await new Promise(r => setTimeout(r, 100));

      let eventDispatched = false;
      footer.addEventListener('clear-completed', () => eventDispatched = true);

      const clearButton = footer.shadowRoot.querySelector('.clear-completed');
      st.ok(clearButton, 'Clear completed button must exist for this test');
      clearButton.click();

      st.ok(eventDispatched, 'clear-completed event dispatched');
      st.end();
    });

    t.test('should update when attributes change', async (st) => {
        container.innerHTML = '<todo-footer data-active-count="1" data-filter="all"></todo-footer>';
        const footer = container.querySelector('todo-footer');
        await new Promise(r => setTimeout(r, 100));
        st.includes(footer.shadowRoot.querySelector('.count').textContent, '1 item left');
        st.ok(footer.shadowRoot.querySelector('custom-button[data-filter="all"][data-active]'));

        footer.setAttribute('data-active-count', '5');
        footer.setAttribute('data-filter', 'active');
        await new Promise(r => setTimeout(r, 100));

        st.includes(footer.shadowRoot.querySelector('.count').textContent, '5 items left');
        st.notOk(footer.shadowRoot.querySelector('custom-button[data-filter="all"][data-active]'));
        st.ok(footer.shadowRoot.querySelector('custom-button[data-filter="active"][data-active]'));
        st.end();
    });

    t.end();
  });
} else { console.warn('TAP not loaded, skipping todo-footer.test.js'); }
