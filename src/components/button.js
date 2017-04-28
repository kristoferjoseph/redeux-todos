var html = require('bel')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var deleteTodo = actions.deleteTodo
var classes = css`
:host {
  font-size: 1rem;
  min-width: 1.5rem;
  min-height: 1.52rem;
  color: white;
  border: 1px solid red;
  border-radius: 100%;
  background: #ee0000;
  cursor: pointer;
}

:host:hover {
  background: #ff0000;
}

:host:active {
  background: #ee0000;
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
      ✖︎
    </button>
  `
}
