var html = require('yo-yo')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = css`
:host {
  min-width: 2rem;
  width: 2rem;
  height: 2rem;
  min-height: 2rem;
  margin-right: 1rem;
}
`

module.exports = function (state, dispatch) {
  state = state || {}
  var done = state.done

  function change (e) {
    var newTodo = Object.assign({}, state)
    newTodo.done = !newTodo.done
    dispatch(updateTodo(newTodo))
  }

  return html`
    <input
      class=${classes}
      type='checkbox'
      onchange=${change}
      checked=${done}
    />
  `
}
