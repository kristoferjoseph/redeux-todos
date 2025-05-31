import tap from 'tap';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {}
  };
})();
global.localStorage = localStorageMock;

// Import the store module AFTER localStorage is mocked
import * as store from '../public/js/store.js';

tap.beforeEach(() => {
  store._resetState(); // Reset state and clear mock localStorage before each test
});

tap.test('Todo Store', (t) => {
  t.test('initial state', (st) => {
    st.same(store.getTodos(), [], 'should start with an empty todo list');
    st.equal(store.getCurrentFilter(), 'all', 'initial filter should be "all"');
    st.end();
  });

  t.test('addTodo', (st) => {
    store.addTodo('Test todo 1');
    const todos = store.getTodos();
    st.equal(todos.length, 1, 'should add a todo');
    st.equal(todos[0].text, 'Test todo 1', 'todo should have correct text');
    st.notOk(todos[0].done, 'new todo should not be done');

    store.addTodo('  Test todo 2  '); // Test trimming
    st.equal(store.getTodos().length, 2);
    st.equal(store.getTodos()[1].text, 'Test todo 2');

    store.addTodo(''); // Test empty add
    st.equal(store.getTodos().length, 2, 'should not add empty or whitespace-only todos');
    st.end();
  });

  t.test('toggleTodo', (st) => {
    store.addTodo('Todo to toggle');
    const todoId = store.getTodos()[0].id;

    store.toggleTodo(todoId);
    st.ok(store.getTodos()[0].done, 'todo should be marked as done');

    store.toggleTodo(todoId);
    st.notOk(store.getTodos()[0].done, 'todo should be marked as not done again');
    st.end();
  });

  t.test('deleteTodo', (st) => {
    store.addTodo('Todo 1');
    store.addTodo('Todo 2');
    const todoIdToDelete = store.getTodos()[0].id;
    const otherTodoId = store.getTodos()[1].id;

    store.deleteTodo(todoIdToDelete);
    const todos = store.getTodos();
    st.equal(todos.length, 1, 'should have one todo left');
    st.equal(todos[0].id, otherTodoId, 'correct todo should be deleted');
    st.end();
  });

  t.test('editText', (st) => {
    store.addTodo('Original text');
    const todoId = store.getTodos()[0].id;

    store.editText(todoId, 'Updated text');
    st.equal(store.getTodos()[0].text, 'Updated text', 'todo text should be updated');

    store.editText(todoId, '  '); // Test empty update
    st.equal(store.getTodos()[0].text, 'Updated text', 'todo text should not update to empty/whitespace');
    st.end();
  });

  t.test('setEditingState (visual helper, not persisted through editText)', (st) => {
    store.addTodo('Todo A');
    store.addTodo('Todo B');
    const idA = store.getTodos()[0].id;
    const idB = store.getTodos()[1].id;

    store.setEditingState(idA, true);
    let todos = store._getRawState().todos; // Check internal state for editing flag
    st.ok(todos.find(t => t.id === idA).editing, 'Todo A should be in editing state');
    st.notOk(todos.find(t => t.id === idB).editing, 'Todo B should not be in editing state');

    store.setEditingState(idB, true);
    todos = store._getRawState().todos;
    st.notOk(todos.find(t => t.id === idA).editing, 'Todo A should exit editing state');
    st.ok(todos.find(t => t.id === idB).editing, 'Todo B should enter editing state');

    // Simulate saving an edit, which should clear editing state
    store.editText(idB, "New text for B");
    todos = store._getRawState().todos;
    st.notOk(todos.find(t => t.id === idB).editing, 'Editing state should be cleared after editText');
    st.end();
  });

  t.test('setFilter', (st) => {
    store.setFilter('active');
    st.equal(store.getCurrentFilter(), 'active', 'filter should be set to active');

    store.setFilter('completed');
    st.equal(store.getCurrentFilter(), 'completed', 'filter should be set to completed');

    store.setFilter('all');
    st.equal(store.getCurrentFilter(), 'all', 'filter should be set to all');

    store.setFilter('invalid');
    st.equal(store.getCurrentFilter(), 'all', 'filter should not change for invalid value');
    st.end();
  });

  t.test('clearCompleted', (st) => {
    store.addTodo('Active todo');
    store.addTodo('Completed todo');
    store.toggleTodo(store.getTodos()[1].id); // Mark second todo as completed

    store.clearCompleted();
    const todos = store.getTodos();
    st.equal(todos.length, 1, 'should only have active todos left');
    st.equal(todos[0].text, 'Active todo', 'the active todo should remain');
    st.end();
  });

  t.test('getFilteredTodos', (st) => {
    store.addTodo('Active 1');
    store.addTodo('Completed 1');
    store.toggleTodo(store.getTodos()[1].id);
    store.addTodo('Active 2');

    store.setFilter('all');
    st.equal(store.getFilteredTodos().length, 3, 'should return all todos for "all" filter');

    store.setFilter('active');
    const activeTodos = store.getFilteredTodos();
    st.equal(activeTodos.length, 2, 'should return only active todos for "active" filter');
    st.ok(activeTodos.every(todo => !todo.done), 'all returned active todos should not be done');

    store.setFilter('completed');
    const completedTodos = store.getFilteredTodos();
    st.equal(completedTodos.length, 1, 'should return only completed todos for "completed" filter');
    st.ok(completedTodos.every(todo => todo.done), 'all returned completed todos should be done');
    st.end();
  });

  t.test('localStorage persistence', (st) => {
    store.addTodo('Persist Me');
    const todoId = store.getTodos()[0].id;

    // Simulate app reload by creating a new store instance (sort of)
    // by calling loadState on the existing module after clearing its memory state
    const currentStateInMemory = JSON.parse(JSON.stringify(store._getRawState())); // Deep copy
    store._resetState(); // Clears memory state and localStorage
    st.equal(store.getTodos().length, 0, "State should be empty after reset");

    // Now, re-populate localStorage from our "saved" version
    localStorage.setItem('architect-refactor-todos', JSON.stringify(currentStateInMemory.todos));

    // This is tricky because store.js loads on require.
    // To properly test loadState, we'd need to be able to call it or re-require the module.
    // The store.js already calls loadState() at the end. So, we need a way to re-trigger it, or mock it.
    // For this test, let's just check if saveTodos works.

    // Reset, add, then check localStorage
    store._resetState();
    store.addTodo("Save Test");
    const saved = localStorage.getItem('architect-refactor-todos');
    st.ok(saved, "localStorage should have saved todos");
    const parsedSaved = JSON.parse(saved);
    st.equal(parsedSaved.length, 1);
    st.equal(parsedSaved[0].text, "Save Test");

    // Test loading by resetting memory and calling loadState (if it were exported or testable)
    // Since loadState is internal and run on module load, this test is more about saveTodos.
    // We can test that if we add another todo, it's added to the persisted list.
    store.addTodo("Another Save");
    const reSaved = JSON.parse(localStorage.getItem('architect-refactor-todos'));
    st.equal(reSaved.length, 2);
    st.end();
  });

  t.end();
});
