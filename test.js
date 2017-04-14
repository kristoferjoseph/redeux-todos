var assert = require('assert')
var deepFreeze = require('deep-freeze')
var todosReducer = require('./src/reducers/todos-reducer')

function fail(msg) {
  console.error('  ✘ ' + msg)
}

function pass(msg) {
  console.info('  ✔︎ ' + msg)
}

function test(label, func) {
  var f = false
  console.info(label || '')
  try {
    msg = func()
  }
  catch(e) {
    f = e.message
    fail(f)
  }
  finally {
    if (!f) {
      pass('passed')
    }
  }
}

module.exports = function() {

  test('todosReducer', function() {
    assert(todosReducer, 'todosReducer does not exist')
  })

  test('should create a new todo', function() {
    var state = []
    var action = {
      type: 'CREATE_TODO',
      data: { title: 'YOLO' }
    }
    deepFreeze(state)
    assert.equal(todosReducer(state, action)[0].title, 'YOLO')
  })

  test('should update todo', function() {
    var todo = {id:1, title:'write code'}
    var state = [todo, {id: 2, title: 'delete code'}]
    var action = {
      type: 'UPDATE_TODO',
      data: { id: 1, title: 'make beats' }
    }
    deepFreeze(state)
    var state = todosReducer(state, action)
    assert.equal(state[0].title, 'make beats', 'todo not updated')
  })

  test('should delete todo', function() {
    var todo = {id:1, title:'write code'}
    var state = [todo, {id: 2, title: 'delete code'}]
    var action = {
      type: 'DELETE_TODO',
      data: todo
    }
    deepFreeze(state)
    var state = todosReducer(state, action)
    assert.equal(state.length, 1, 'todo not deleted')
  })

  test('should complete all todos', function() {
    var before = [
      {
        id:1,
        done:false,
        title:'write code'
      },
      {
        id:2,
        done:false,
        title:'write code'
      },
      {
        id:3,
        done:false,
        title:'write code'
      }
    ]
    var after = [
      {
        id:1,
        done:true,
        title:'write code'
      },
      {
        id:2,
        done:true,
        title:'write code'
      },
      {
        id:3,
        done:true,
        title:'write code'
      }
    ]
    var action = {
      type: 'COMPLETE_ALL'
    }
    deepFreeze(before)
    var state = todosReducer(before, action)
    assert.deepEqual(state, after)
  })

  test('should delete all todos', function() {
    var todo1  = {id:1, title:'write code'}
    var todo2  = {id:2, title:'write code'}
    var todo3  = {id:3, title:'write code'}
    var state  = [todo1,todo2,todo3]
    var action = {
      type: 'DELETE_ALL'
    }
    deepFreeze(state)
    var state = todosReducer(state, action)
    assert.equal(state.length, 0, 'todos not deleted')
  })

}()

