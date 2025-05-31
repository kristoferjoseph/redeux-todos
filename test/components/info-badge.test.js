// This test needs to be run in test/runner.html environment
// Ensure tap-browser-umd.js is correctly loaded in runner.html
// For now, this is a placeholder structure. Actual execution depends on runner.html setup.

if (typeof tap !== 'undefined') { // Check if tap is loaded (by tap-browser-umd.js)
  tap.test('InfoBadge Web Component', async (t) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    t.teardown(() => {
      document.body.removeChild(container);
    });

    t.test('should render with default text when no attribute is provided', async (st) => {
      container.innerHTML = '<info-badge></info-badge>';
      const badge = container.querySelector('info-badge');
      // Wait for component to render (connectedCallback, async render)
      await new Promise(resolve => setTimeout(resolve, 100)); // Adjust timing as needed

      st.ok(badge, 'info-badge element should exist');
      st.ok(badge.shadowRoot, 'shadowRoot should exist');
      const span = badge.shadowRoot.querySelector('span.badge-text');
      st.ok(span, 'span.badge-text should exist in shadow DOM');
      st.includes(span.textContent, 'Default Badge Text', 'should display default text');
      st.end();
    });

    t.test('should render with text from data-text attribute', async (st) => {
      container.innerHTML = '<info-badge data-text="Custom Text"></info-badge>';
      const badge = container.querySelector('info-badge');
      await new Promise(resolve => setTimeout(resolve, 100));

      const span = badge.shadowRoot.querySelector('span.badge-text');
      st.includes(span.textContent, 'Custom Text', 'should display text from attribute');
      st.end();
    });

    t.test('should update text when data-text attribute changes', async (st) => {
      container.innerHTML = '<info-badge data-text="Initial Text"></info-badge>';
      const badge = container.querySelector('info-badge');
      await new Promise(resolve => setTimeout(resolve, 100)); // Initial render

      badge.setAttribute('data-text', 'Updated Text');
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for attributeChangedCallback and re-render

      const span = badge.shadowRoot.querySelector('span.badge-text');
      st.includes(span.textContent, 'Updated Text', 'should display updated text');
      st.end();
    });

    // Test for CSS encapsulation (visual or computed style check - harder in basic tap)
    // For now, we assume :host styling works if the structure is correct.
    // A simple check could be to ensure styles are in shadowRoot.
    t.test('should have its styles encapsulated in shadow DOM', async (st) => {
        container.innerHTML = '<info-badge data-text="Styled"></info-badge>';
        const badge = container.querySelector('info-badge');
        await new Promise(resolve => setTimeout(resolve, 100));

        const styleElement = badge.shadowRoot.querySelector('style');
        st.ok(styleElement, 'should have a style tag in its shadow DOM');
        st.includes(styleElement.textContent, ':host', 'style tag should contain :host rules');
        st.end();
    });

    t.end();
  });
} else {
  console.warn('TAP library not found. Skipping info-badge.test.js. Ensure tap-browser-umd.js is correctly loaded in test/runner.html.');
}
