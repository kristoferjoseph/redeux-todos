var html = require('yo-yo')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var deleteTodo = actions.deleteTodo
var classes = css`
:host {
  padding: 0.25rem;
  fontSize: 0.85rem;
  height: 100%;
  color: red;
  border: 1px solid red;
  border-radius: 2px;
  background: none;
}
`

module.exports = function Button (state, dispatch) {

  function destroy () {
    dispatch(deleteTodo(state))
  }

  return html`
    <button
      class=${classes}
      onclick=${destroy}
    >
      delete
    </button>
  `
}
