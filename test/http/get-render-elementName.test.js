const tap = require('tap');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Path to the handler under test
const handlerPath = '../../../src/http/get-render-elementName/index.js';
let handler;

// Helper to mock templates in memory
const mockTemplates = {};

tap.beforeEach(() => {
  delete require.cache[require.resolve(handlerPath)];
  handler = require(handlerPath).handler;

  sinon.stub(fs, 'existsSync').callsFake((filePath) => {
    const fileName = path.basename(filePath);
    return mockTemplates.hasOwnProperty(fileName);
  });

  sinon.stub(fs, 'readFileSync').callsFake((filePath, encoding) => {
    const fileName = path.basename(filePath);
    if (mockTemplates.hasOwnProperty(fileName)) {
      return mockTemplates[fileName];
    }
    throw new Error(`Mocked readFileSync: File not found ${fileName}`);
  });
});

tap.afterEach(() => {
  sinon.restore();
  for (const key in mockTemplates) {
    delete mockTemplates[key];
  }
});

tap.test('Templating Engine - Nesting and Slots', async (t) => {
  t.test('should render a simple element without nesting or slots', async (st) => {
    mockTemplates['simple-element.html'] = '<template shadowrootmode="open"><p>\${data.message}</p></template>';
    const request = { params: { elementName: 'simple-element' }, queryStringParameters: { message: 'Hello' } };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    st.match(result.body, /<p>Hello<\/p>/);
    st.end();
  });

  t.test('should render a nested component', async (st) => {
    mockTemplates['parent-comp.html'] = '<template shadowrootmode="open"><div>Parent: <child-comp data-text="\${data.childText}"></child-comp></div></template>';
    mockTemplates['child-comp.html'] = '<template shadowrootmode="open"><span>Child: \${data.text}</span></template>';

    const request = { params: { elementName: 'parent-comp' }, queryStringParameters: { childText: 'Nested Hello' } };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    st.match(result.body, /Parent: <template shadowrootmode="open"><span>Child: Nested Hello<\/span><\/template>/, 'Parent should contain rendered child');
    st.end();
  });

  t.test('should handle attributes passed to nested components', async (st) => {
    mockTemplates['parent-attr.html'] = '<template shadowrootmode="open"><child-attr data-val="\${data.val}"></child-attr></template>';
    mockTemplates['child-attr.html'] = '<template shadowrootmode="open"><p>\${data.val}</p></template>';
    const request = { params: { elementName: 'parent-attr' }, queryStringParameters: { val: 'AttributeValue' } };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    st.match(result.body, /<p>AttributeValue<\/p>/);
    st.end();
  });

  t.test('should recursively render multiple levels of nesting', async (st) => {
    mockTemplates['grandparent-comp.html'] = '<template shadowrootmode="open"><h1>GP</h1><parent-comp-level1 data-text="\${data.parentText}"></parent-comp-level1></template>';
    mockTemplates['parent-comp-level1.html'] = '<template shadowrootmode="open"><h2>Parent L1: \${data.text}</h2><child-comp-level2 data-text="\${data.childText}"></child-comp-level2></template>';
    mockTemplates['child-comp-level2.html'] = '<template shadowrootmode="open"><h3>Child L2: \${data.text}</h3></template>';

    const request = {
      params: { elementName: 'grandparent-comp' },
      queryStringParameters: { parentText: 'Hello Parent', childText: 'Hello Child' }
    };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    st.match(result.body, /<h1>GP<\/h1>/);
    st.match(result.body, /<h2>Parent L1: Hello Parent<\/h2>/);
    st.match(result.body, /<h3>Child L2: Hello Child<\/h3>/);
    st.end();
  });

  t.test('should handle default slots', async (st) => {
    mockTemplates['slot-host.html'] = '<template shadowrootmode="open"><div><slot-consumer><p>This is slotted content.</p></slot-consumer></div></template>';
    mockTemplates['slot-consumer.html'] = '<template shadowrootmode="open"><section>Before slot. <slot></slot> After slot.</section></template>';

    const request = { params: { elementName: 'slot-host' }, queryStringParameters: {} };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    // The current slot implementation replaces <slot> with the content.
    st.match(result.body, /<section>Before slot. <p>This is slotted content.<\/p> After slot.<\/section>/);
    st.end();
  });

  t.test('should remove slot tags if no content is provided for default slot', async (st) => {
    mockTemplates['empty-slot-host.html'] = '<template shadowrootmode="open"><div><empty-slot-consumer></empty-slot-consumer></div></template>';
    mockTemplates['empty-slot-consumer.html'] = '<template shadowrootmode="open"><section>Content: <slot></slot>! </section></template>';
    const request = { params: { elementName: 'empty-slot-host'}, queryStringParameters: {}};
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    st.match(result.body, /<section>Content: ! <\/section>/, "Slot tag should be removed");
    st.end();
  });

  // Named slots are more complex and the current implementation is basic.
  // This test reflects the placeholder for named slots.
  t.test('should handle named slots (basic placeholder)', async (st) => {
    mockTemplates['named-slot-host.html'] = '<template shadowrootmode="open"><named-slot-consumer><span slot="header">My Header</span><span slot="footer">My Footer</span></named-slot-consumer></template>';
    mockTemplates['named-slot-consumer.html'] = '<template shadowrootmode="open"><header><slot name="header"></slot></header><footer><slot name="footer"></slot></footer></template>';

    const request = { params: { elementName: 'named-slot-host' }, queryStringParameters: {} };
    const result = await handler(request);
    st.equal(result.statusCode, 200);
    // The current simplified implementation puts a comment placeholder for named slots
    st.match(result.body, /<header><!-- Content for slot 'header' from parent would go here --><\/header>/);
    st.match(result.body, /<footer><!-- Content for slot 'footer' from parent would go here --><\/footer>/);
    st.end();
  });

  t.end();
});
