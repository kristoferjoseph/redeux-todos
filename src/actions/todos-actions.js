var CREATE_TODO = 'CREATE_TODO'
var UPDATE_TODO = 'UPDATE_TODO'
var COMPLETE_ALL = 'COMPLETE_ALL'
var DELETE_TODO = 'DELETE_TODO'
var DELETE_ALL = 'DELETE_ALL'

function createTodo (title) {
  return {
    type: CREATE_TODO,
    data: {
      title: title
    }
  }
}

function updateTodo (data) {
  return {
    type: UPDATE_TODO,
    data: data
  }
}

function deleteTodo (data) {
  return {
    type: DELETE_TODO,
    data: data
  }
}

function completeAll () {
  return {
    type: COMPLETE_ALL
  }
}

module.exports = {
  createTodo: createTodo,
  updateTodo: updateTodo,
  deleteTodo: deleteTodo,
  completeAll: completeAll,
  CREATE_TODO: CREATE_TODO,
  UPDATE_TODO: UPDATE_TODO,
  COMPLETE_ALL: COMPLETE_ALL,
  DELETE_TODO: DELETE_TODO,
  DELETE_ALL: DELETE_ALL
}
