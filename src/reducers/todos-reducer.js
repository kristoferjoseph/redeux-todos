var tid = require('tiny-uuid')
var hs = require('hash-switch')
var kubby = require('kubby')()
var actions = require('../actions/todos-actions')
var CREATE_TODO = actions.CREATE_TODO
var UPDATE_TODO = actions.UPDATE_TODO
var COMPLETE_ALL = actions.COMPLETE_ALL
var DELETE_TODO = actions.DELETE_TODO
var DELETE_ALL = actions.DELETE_ALL
var TODOS_LABEL = 'redeux-todos'

var stateMachine = hs(
  {
    CREATE_TODO: createTodo,
    UPDATE_TODO: updateTodo,
    COMPLETE_ALL: completeAll,
    DELETE_TODO: deleteTodo,
    DELETE_ALL: deleteAll
  },
  function (state) {
    return state
  }
)

function createTodo (state, data) {
  var newState = state.concat()
  data.id = tid()
  data.done = false
  newState.push(data)
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function updateTodo (state, data) {
  var newState = state.slice()
  newState = newState.map(function (t) {
    var todo
    if (data.editing) {
      t.editing = false
    }
    if (data.id === t.id) {
      todo = data
    } else {
      todo = t
    }
    return todo
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function completeAll (state, data) {
  var newState = state.concat()
  newState = newState.map(function (t) {
    var todo = Object.assign({}, t)
    todo.done = true
    return todo
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function deleteTodo (state, data) {
  var newState = state.concat()
  newState = newState.filter(function (t) {
    return t.id !== data.id
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function deleteAll (state, data) {
  var newState = []
  kubby.set(TODOS_LABEL, newState)
  return newState
}

module.exports = function todos (state, action) {
  state = state || []
  var type = action && action.type || ''
  var data = action && action.data
  var newState = stateMachine(type, state, data)
  return newState
}
