var html = require('bel')
var morph = require('nanomorph')
var css = require('sheeitfy')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

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

module.exports = function TodoInput (state, dispatch) {
  state = state || {}
  var title = opts.title
  var element

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

  function getClasses (done) {
    return done ?
      joinClasses(inputHandle, inputClasses, doneClasses) :
      joinClasses(inputHandle, inputClasses)
  }

  function create (state) {
    state = state || {}
    return html`
      <input
        class=${getClasses(done)}
        oninput=${input}
        onkeydown=${keydown}
        disabled=${done}
        value=${title}
      >
    `

  }

  function update (state) {
  }

  function render (state) {
    element ?
      update(state) :
      (element = create(state), element)
  }
}
