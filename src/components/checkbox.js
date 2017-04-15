var html = require('yo-yo')
var css = require('sheetify')
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = css`
:host {
  min-width: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  min-height: 1.5rem;
  margin-right: 1rem;
  border: 1px solid red;
  border-radius: 100%;
  overflow: hidden;
  cursor: pointer;
}
:host:hover {
  border-color: red;
  border-width: 2px;
}
:host:active {
  border-width: 3px;
}
`
var inputClasses = css`
:host {
  opacity: 0.0001;
  border: none;
  background: transparent;
  pointer-events: none;
}
`

var doneClasses = css`
:host {
  border-color: grey;
}
:host:hover {
  border-color: grey;
  border-width: 2px;
}
:host:active {
  border-width: 3px;
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

  function getClasses () {
    return done ?
      joinClasses(classes, doneClasses) :
      classes
  }

  return html`
    <label class=${getClasses()}>
      <input
        class=${inputClasses}
        type='checkbox'
        onchange=${change}
        checked=${done}
      />
    </label>
  `
}
