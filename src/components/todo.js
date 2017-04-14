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
  background: white;
}
`
var inputClasses = css`
  :host {
    width: 100%;
    font-size: 1.5rem;
    font-weight: 300;
    border: none;
    text-overflow: ellipsis;
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
  var inputHandle = 'input-' + id
  var element

  function getInput () {
    return document.querySelector('.'+inputHandle)
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

  function getClasses (done) {
    return done ?
      joinClasses(inputHandle, inputClasses, doneClasses) :
      joinClasses(inputHandle, inputClasses)
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
      >
        ${Checkbox(state, dispatch)}
        <input
          class=${getClasses(done)}
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
