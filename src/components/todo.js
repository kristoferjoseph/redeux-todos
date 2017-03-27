var html = require('yo-yo')
var css = require('sheetify')
var Checkbox = require('./checkbox')
var Button = require('./button')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = css`
:host {
  display: flex;
  padding: 1rem;
  align-items: center;
  margin-bottom: 1px;
  border-bottom: 1px solid transparent;
  background: white;
}
`
var inputClasses = css`
  :host {
    font-size: 1.5rem;
    font-weight: 300;
    color: #333;
    border: none;
  }
`

module.exports = function Todo (state, dispatch) {
  state = state || {}
  var id = state.id
  var editing = state.editing
  var title = state.title
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

  function input () {
    var el = getInput()
  }

  function submit () {
    var el = getInput()
    var newTodo = copyTodo()
    newTodo.title = el.value
    newTodo.editing = false
    dispatch(updateTodo(newTodo))
  }

  function render (state) {
    if (!element) {
      element = create(state)
      return element
    } else {
      update(state)
    }
  }

  function create (state) {
    return html`
      <li
        id=${id}
        class=${classes}
        onclick=${edit}
      >
        ${Checkbox(state, dispatch)}
        <input
          id=${inputHandle}
          class=${inputClasses}
          style='width: 100%; outline: none;'
          oninput=${input}
          onkeydown=${keydown}
          value=${title}
        >
        ${editing ? Button(state, dispatch) : null}
      </li>
    `
  }

  function update (newState) {
    html.update(element, create(newState))
  }

  return render(state)
}
