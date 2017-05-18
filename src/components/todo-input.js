var html = require('bel')
var morph = require('nanomorph')
var css = require('sheetify')
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

var containerClasses = css`
  :host {
    position: relative;
    width: 100%;
    height: auto;
    word-wrap: break-word;
    font-size: 1.5rem;
    font-weight: 300;
  }
`

var textAreaClasses = css`
  :host {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    resize: none;
    overflow: hidden;
    font: inherit;
    font-size: 1.5rem;
    font-weight: 300;
    border: none;
    text-overflow: ellipsis;
  }
`

var preClasses = css`
  :host {
    margin: 0;
    padding: 0;
    outline: none;
    border: none;
    display: none;
  }
`

module.exports = function TodoInput (state, dispatch) {
  state = state || {}
  var title = state.title
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

  function input (e) {
    e &&
    e.target &&
    e.target.value &&
    updateTitle()
  }

  function updateTitle () {
    var el = document.querySelector('.'+textAreaClasses)
    var newTodo = copyTodo()
    newTodo.title = el.value
    dispatch(updateTodo(newTodo))
  }

  function submit () {
    var newTodo = copyTodo()
    newTodo.editing = false
    dispatch(updateTodo(newTodo))
  }

  function create (state) {
    state = state || {}
    var done = state.done
    var title = state.title
    return html`
      <div class=${containerClasses}>
        ${title}
        <textarea
          class=${textAreaClasses}
          oninput=${input}
          onkeydown=${keydown}
          disabled=${done}
        >${title}</textarea>
      </div>
    `
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
    morph(element, create(state))
  }

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  return render(state)
}
