if (typeof tap !== 'undefined') {
  tap.test('CustomButton Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    t.teardown(() => document.body.removeChild(container));

    t.test('should render with slotted content', async (st) => {
      container.innerHTML = '<custom-button>Test Label</custom-button>';
      const btn = container.querySelector('custom-button');
      await new Promise(r => setTimeout(r, 50)); // wait for render
      st.ok(btn.shadowRoot.querySelector('button'), 'Button element exists in shadow DOM');
      st.equal(btn.shadowRoot.querySelector('slot').assignedNodes()[0].textContent, 'Test Label');
      st.end();
    });

    t.test('should handle disabled attribute', async (st) => {
      container.innerHTML = '<custom-button disabled>Disabled</custom-button>';
      const btn = container.querySelector('custom-button');
      await new Promise(r => setTimeout(r, 50));
      st.ok(btn.disabled, 'Component is disabled');
      st.ok(btn.shadowRoot.querySelector('button').disabled, 'Inner button is disabled');

      btn.disabled = false;
      await new Promise(r => setTimeout(r, 50));
      st.notOk(btn.disabled, 'Component is enabled after property change');
      st.notOk(btn.shadowRoot.querySelector('button').disabled, 'Inner button is enabled');
      st.end();
    });

    t.test('should dispatch click event', async (st) => {
      container.innerHTML = '<custom-button>Clickable</custom-button>';
      const btn = container.querySelector('custom-button');
      await new Promise(r => setTimeout(r, 50));
      let clicked = false;
      btn.addEventListener('click', () => clicked = true);
      btn.shadowRoot.querySelector('button').click(); // Click the inner button
      st.ok(clicked, 'click event was dispatched by custom-button');
      st.end();
    });

    t.end();
  });
} else { console.warn('TAP not loaded, skipping custom-button.test.js'); }
