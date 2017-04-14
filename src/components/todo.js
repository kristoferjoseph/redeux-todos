var html = require('yo-yo')
var css = require('sheetify')
var joinClasses = require('join-classes')
var Checkbox = require('./checkbox')
var Button = require('./button')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = css`
:host {
  display: flex;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid;
  background: white;
}
`
var inputClasses = css`
  :host {
    width: 100%;
    font-size: 1.5rem;
    font-weight: 300;
    border: none;
  }
`

var doneClasses = css`
:host {
  text-decoration: line-through;
  opacity: 0.5;
}
`

module.exports = function Todo (state, dispatch) {
  state = state || {}
  var id = state.id
  var inputHandle = id + '-input'
  var element

  function getInput () {
    return document.getElementById(inputHandle)
  }

  function copyTodo () {
    return Object.assign({}, state)
  }

  function keydown (e) {
    var newTodo
    var keyCode = e.keyCode
    // ESCAPE key to exit edit
    if (keyCode === 27) {
      newTodo = copyTodo()
      newTodo.editing = false
      dispatch(updateTodo(newTodo))
    // Enter key to save
    } else if (keyCode === 13) {
      e.preventDefault()
      submit()
    }
  }

  function edit () {
    var el = getInput()
    el && el.focus()
    var newTodo = copyTodo()
    newTodo.editing = true
    dispatch(updateTodo(newTodo))
  }

  function input (e) {
    e &&
    e.target &&
    e.target.value &&
    submit()
  }

  function submit () {
    var el = getInput()
    var newTodo = copyTodo()
    newTodo.title = el.value
    newTodo.editing = false
    dispatch(updateTodo(newTodo))
  }

  function render (state) {
    return element ?
    update(state) :
    element = create(state), element
  }

  function create (state) {
    state = state || {}
    var title = state.title
    var done = state.done
    var editing = state.editing
    return html`
      <li
        id=${id}
        class=${classes}
        onclick=${edit}
      >
        ${Checkbox(state, dispatch)}
        <input
          id=${inputHandle}
          class=${done ? joinClasses(inputClasses, doneClasses) : inputClasses}
          oninput=${input}
          onkeydown=${keydown}
          disabled=${done}
          value=${title}
        >
        ${done && editing ? Button(state, dispatch) : null}
      </li>
    `
  }

  function update (state) {
    html.update(element, create(state))
  }

  return render(state)
}
