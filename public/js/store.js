const TODOS_STORAGE_KEY = 'architect-refactor-todos';

// Initial state
let state = {
  todos: [],
  filter: 'all' // 'all', 'active', 'completed'
};

// Load initial state from localStorage
function loadState() {
  try {
    const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    if (storedTodos) {
      state.todos = JSON.parse(storedTodos);
    }
    // Filter state is not typically persisted, but could be.
    // For now, it resets on load.
    state.filter = 'all';
  } catch (e) {
    console.error('Failed to load todos from localStorage:', e);
    state.todos = []; // Start fresh if error
  }
}

// Save todos to localStorage
function saveTodos() {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(state.todos));
  } catch (e) {
    console.error('Failed to save todos to localStorage:', e);
  }
}

// --- Listener pattern for state changes ---
let listeners = [];

function subscribe(listener) {
  listeners.push(listener);
  return () => { // Unsubscribe function
    listeners = listeners.filter(l => l !== listener);
  };
}

function notify() {
  // Create a frozen/immutable copy of state to pass to listeners
  // This is a shallow freeze. For deep freeze, a recursive function would be needed.
  const frozenState = Object.freeze({ ...state, todos: Object.freeze(state.todos.map(t => Object.freeze({...t}))) });
  listeners.forEach(listener => listener(frozenState));
}

// --- Getters ---
export function getTodos() {
  return [...state.todos]; // Return a copy
}

export function getFilteredTodos() {
  const currentFilter = state.filter;
  if (currentFilter === 'active') {
    return state.todos.filter(todo => !todo.done);
  } else if (currentFilter === 'completed') {
    return state.todos.filter(todo => todo.done);
  }
  return [...state.todos]; // 'all'
}

export function getActiveCount() {
  return state.todos.filter(todo => !todo.done).length;
}

export function getCompletedCount() {
  return state.todos.filter(todo => todo.done).length;
}

export function getCurrentFilter() {
  return state.filter;
}

// --- Actions / Mutators ---
export function addTodo(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') return;
  const newTodo = {
    id: `todo-${Date.now()}`,
    text: text.trim(),
    done: false,
    editing: false // Default editing to false
  };
  state.todos = [...state.todos, newTodo];
  saveTodos();
  notify();
}

export function toggleTodo(id) {
  state.todos = state.todos.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodos();
  notify();
}

export function deleteTodo(id) {
  state.todos = state.todos.filter(todo => todo.id !== id);
  saveTodos();
  notify();
}

export function editText(id, newText) {
  if (!newText || typeof newText !== 'string' || newText.trim() === '') {
    // If new text is empty, consider it a delete or revert,
    // for now, we just don't update to empty. Or delete if that's the desired UX.
    // Let's just make sure it's not empty.
    return;
  }
  state.todos = state.todos.map(todo =>
    todo.id === id ? { ...todo, text: newText.trim(), editing: false } : todo
  );
  saveTodos();
  notify();
}

// Action to set a todo item's editing state (visual only, no persistence change)
export function setEditingState(id, editing) {
    state.todos = state.todos.map(todo =>
        todo.id === id ? { ...todo, editing: editing } : { ...todo, editing: false } // Only one item can be editing
    );
    notify(); // Notify to update UI
}


export function setFilter(newFilter) {
  if (['all', 'active', 'completed'].includes(newFilter)) {
    state.filter = newFilter;
    notify();
  }
}

export function clearCompleted() {
  state.todos = state.todos.filter(todo => !todo.done);
  // Optionally, set filter back to 'all' after clearing
  // state.filter = 'all';
  saveTodos();
  notify();
}

// Initialize by loading state
loadState();

// Export subscribe for UI updates
export { subscribe };

// For testing purposes, allow resetting state or getting raw state
export function _resetState() { // Underscore to indicate for testing/internal use
    state.todos = [];
    state.filter = 'all';
    localStorage.removeItem(TODOS_STORAGE_KEY);
    notify();
}
export function _getRawState() { return state; }
