var html = require('yo-yo')
var css = require('sheetify')
var tid = require('tiny-uuid')
var Todo = require('../components/todo')
var classes = css`
:host {

}
`
var headingClasses = css`
:host {
  padding: 1rem;
  padding-top: 2rem;
}
`
var id = tid()

module.exports = function TodoList (state, dispatch) {
  state = state || {}
  var todos = state.todos || []
  var active = todos.filter(function (t) {
    return !t.done
  })
  var done = todos.filter(function (t) {
    return t.done
  })

  function doneHeading () {
    return html`
      <h3>
        <div class=${headingClasses}>
          Completed
        </div>
        <hr>
      </h3>
    `
  }

  return html`
    <div>
      <ul
        id=${id}
        class=${classes}
      >
        ${active.map(function (t) {
          return Todo(t, dispatch)
        })}
      </ul>
      ${done && done.length ? doneHeading() : null}
      <ul
        id=${id}
        class=${classes}
      >
        ${done.map(function (t) {
          return Todo(t, dispatch)
        })}
      </ul>
    </div>
  `
}
