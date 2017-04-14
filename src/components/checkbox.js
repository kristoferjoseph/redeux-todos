var html = require('yo-yo')
var css = require('sheetify')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = css`
:host {
  position: relative;
  min-width: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  min-height: 1.5rem;
  margin-right: 1rem;
  border: 1px solid;
  border-radius: 100%;
  cursor: pointer;
}
`
var inputClasses = css`
:host {
  opacity: 0.0001;
  pointer-events: none;
}
`

var checkClasses = css`
:host {
  position: absolute;
  top: -0.955rem;
  left: -0.05rem;
  font-size: 2.55rem;
  color: #ee0000;
}
:host:hover {
  color: #ff0000;
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
    <label class=${classes}>
      <input
        class=${inputClasses}
        type='checkbox'
        onchange=${change}
        checked=${done}
      />
      <span class=${checkClasses}>
        ${ done ? '●' : null }
      </span>
    </label>
  `
}
