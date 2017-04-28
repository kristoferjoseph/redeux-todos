var html = require('bel')
var update = require('nanomorph')
var css = require('sheetify')
var Todo = require('../components/todo')
var classes = css`
:host {
  margin-top: 1rem;
}
`

module.exports = function TodoList (state, dispatch) {
  state = state || {}
  var element

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }


  function create (state) {
    var todos = state || []

    return html`
      <ul class=${classes}>
        ${todos.map(function (t) {
          return Todo(t, dispatch)
        })}
      </ul>
    `
  }

  function update (state) {
    update(element, create(state))
  }

  return render(state)
}
