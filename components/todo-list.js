var yo = require('yo-yo')
var cxs = require('cxs').default
var Todo = require('../components/todo')
var className = cxs({
  flexGrow: '1'
})

module.exports = function TodoList(state, dispatch) {
  var todos = state.todos

  return yo`
    <ul class=${className}>
      ${todos.map(function(t) {
        return yo`${Todo(t, dispatch)}`
      })}
    </ul>
  `
}
