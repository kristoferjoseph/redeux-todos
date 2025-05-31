import { InfoBadge } from './components/InfoBadge.js';
// CustomButton, TodoItem, TodoList, TodoInput, TodoFooter are implicitly used by being defined.
// We import them to ensure their modules execute and customElements.define() is called.
import './components/CustomButton.js';
import './components/TodoItem.js';
import './components/TodoList.js';
import './components/TodoInput.js';
import './components/TodoFooter.js';

import * as store from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  function renderApp(currentState) {
    const { todos, filter } = currentState; // Use raw state for rendering decisions
    const activeCount = todos.filter(todo => !todo.done).length;
    const completedCount = todos.length - activeCount;

    let filteredRenderTodos;
    if (filter === 'active') {
        filteredRenderTodos = todos.filter(todo => !todo.done);
    } else if (filter === 'completed') {
        filteredRenderTodos = todos.filter(todo => todo.done);
    } else {
        filteredRenderTodos = [...todos];
    }

    // Manually reconstruct HTML. A more advanced setup might use a virtual DOM or template literals for this.
    root.innerHTML = \`
      <h1>Todos</h1>
      <todo-input id="newTodoInput"></todo-input>
      <todo-list id="mainTodoList"></todo-list>
      <todo-footer id="appFooter"></todo-footer>
      <hr>
      <p>Info Badge Example: <info-badge data-text="Store Example"></info-badge></p>
    \`;

    const todoListElement = root.querySelector('#mainTodoList');
    if (todoListElement) {
        // Pass the todos with their current editing flags
        todoListElement.items = filteredRenderTodos.map(t => ({...t}));
        todoListElement.setAttribute('empty-message',
            filter === 'completed' ? 'No completed tasks yet.' :
            filter === 'active' ? 'All tasks are done!' :
            'No todos yet. Add some!'
        );
    }

    const footerElement = root.querySelector('#appFooter');
    if (footerElement) {
        footerElement.setAttribute('data-active-count', activeCount.toString());
        footerElement.setAttribute('data-completed-count', completedCount.toString());
        footerElement.setAttribute('data-filter', filter);
    }
  }

  // Initial render
  renderApp(store._getRawState()); // Get initial state for first render

  // Subscribe to store changes
  store.subscribe(newState => {
    renderApp(newState);
  });

  // Event listeners delegate to store actions
  root.addEventListener('todo-add', (e) => {
    store.addTodo(e.detail.text);
  });

  root.addEventListener('todo-toggle', (e) => {
    store.toggleTodo(e.detail.id);
  });

  root.addEventListener('todo-delete', (e) => {
    store.deleteTodo(e.detail.id);
  });

  // Handle todo-item's request to enter edit mode (visual only, via store)
  // This is slightly different from original TodoItem which handled its own editing state.
  // To make it compatible with a central store knowing about editing state:
  // TodoItem could dispatch 'todo-enter-edit' / 'todo-exit-edit'
  // Or app.js can intercept dblclick if it bubbles up.
  // For now, assume TodoItem.js handles its visual editing state internally after text is saved.
  // The store.editText also sets editing to false.
  // We need to ensure the TodoItem component gets its 'editing' prop correctly.
  // Let's adjust the todo-item to reflect 'editing' state from its properties/attributes
  // and dispatch an event when it wants to save.
  // The `store.setEditingState` can be used if an item is double-clicked.
  // This part requires coordination with TodoItem.js. For now, `store.editText` handles it.
  // If `todo-item` itself calls `this.render()` on dblclick to show an input,
  // then on saving, it dispatches `todo-edit`.

  root.addEventListener('todo-edit', (e) => { // This event comes from TodoItem when edit is submitted
    store.editText(e.detail.id, e.detail.text);
  });

  // If a todo-item is double-clicked, it might set its own editing state.
  // Or it could dispatch an event that app.js listens to, to call store.setEditingState(id, true)
  // This depends on how TodoItem is implemented. Let's assume TodoItem handles its immediate edit state.
  // The store.editText action will clear editing state upon successful save.

  root.addEventListener('filter-change', (e) => {
    store.setFilter(e.detail.filter);
  });

  root.addEventListener('clear-completed', () => {
    store.clearCompleted();
  });
});
