var html = require('bel')
var morph = require('nanomorph')
var css = require('sheetify')
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

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

module.exports = function TitleDisplay (state, dispatch) {
  state = state || {}
  var element

  function getClasses (done) {
    return done ?
      joinClasses(inputClasses, doneClasses) :
      joinClasses(inputClasses)
  }

  function click (e) {
    var newTodo = Object.assign({}, state)
    newTodo.editing = !newTodo.editing
    dispatch(updateTodo(newTodo))
  }

  function create (state) {
    state = state || {}
    var title = state.title
    var done = state.done
    var editing = state.editing
    return html`
      <p
        class=${getClasses(done)}
        onclick=${click}
        disabled=${done}
      >
        ${title}
      </p>
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
