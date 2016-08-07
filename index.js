var tid = require('tiny-uuid')
var createStore = require('redeux')
var kubby = require('kubby')()
var todos = require('./reducers/todos-reducer')
var TodoCreate = require('./screens/todos-create')
var localTodos = kubby.get('redeux-todos')
var localState = localTodos? {todos:localTodos}: {todos:[]}

var store = createStore(todos, localState)
var todoCreate = TodoCreate(store)
document.getElementById('root').appendChild(todoCreate)
