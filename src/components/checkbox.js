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
  border: 1px solid grey;
  border-radius: 100%;
  overflow: hidden;
  cursor: pointer;
}
:host:hover {
  border-color: black;
}
:host:active {
  border: none;
  background: #ff0000;
}
`
var inputClasses = css`
:host {
  opacity: 0.0001;
  pointer-events: none;
}
`

var doneClasses = css`
:host {
  border: none;
  background: #ee0000;
}
:host:hover {
  border: none;
  background: #ff0000;
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
