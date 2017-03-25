var html = require('yo-yo')
var css = require('sheetify')
var tid = require('tiny-uuid')
var Todo = require('../components/todo')
var classes = css`
:host > .todo:first-of-type {
  border-top-right-radius: 2px;
  border-top-left-radius: 2px;
}
`
var id = tid()

module.exports = function TodoList (state, dispatch) {
  state = state || {}
  var todos = state.todos

  return html`
    <ul
      id=${id}
      class=${classes}
    >
      ${todos.map(function (t) {
        return Todo(t, dispatch)
      })}
    </ul>
  `
}
