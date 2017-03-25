var html = require('yo-yo')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var completeAll = actions.completeAll
var classes = css`
:host {
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: transparent;
  border-radius: 2px;
}
:host:hover {
  border-color: #ccc;
}
`

module.exports = function CompleteAllButton (opts) {
  opts = opts || {}
  var dispatch = opts.dispatch || function () {}

  function click () {
    dispatch(completeAll())
  }

  return html`
    <button
      class=${classes}
      onclick=${click}
    >
      complete all
    </button>
  `
}
