var html = require('yo-yo')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var deleteAll = actions.deleteAll
var classes = css`
:host {
  padding: 0.5rem;
  font-weight: 700;
  color: white;
  background: #ee0000;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}
:host:hover {
  background: #ff0000;
}
:host:active {
  background: #ee0000;
}
`

module.exports = function DeleteAllButton (opts) {
  opts = opts || {}
  var dispatch = opts.dispatch || function () {}

  function click () {
    dispatch(deleteAll())
  }

  return html`
    <button
      class=${classes}
      onclick=${click}
    >
      Delete All
    </button>
  `
}
