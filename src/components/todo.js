var html = require('bel')
var morph = require('nanomorph')
var css = require('sheetify')
var joinClasses = require('join-classes')
var Checkbox = require('./checkbox')
var Button = require('./button')
var TodoInput = require('./todo-input')
var TitleDisplay = require('./title-display')
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

  function getContent (state) {
    state = state || {}
    var editing = state.editing || false
    var done = state.done || false
    return editing && !done ? TodoInput(state, dispatch) : TitleDisplay(state, dispatch)
  }

  function create (state) {
    state = state || {}
    var done = state.done
    var editing = state.editing
    return html`
      <li
        id=${id}
        class=${classes}
      >
        ${Checkbox(state, dispatch)}
        ${getContent(state)}
        ${done && editing ? Button(state, dispatch) : null}
      </li>
    `
  }

  function update (state) {
    morph(element, create(state))
  }

  return render(state)
}
