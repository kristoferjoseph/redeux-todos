var html = require('yo-yo')
var css = require('sheetify')
var TitleInput = require('../components/title-input')
var TodoList = require('../components/todo-list.js')
var Footer = require('../components/footer')
var CompleteButton = require('../components/button-complete-all')
var classes = css`
:host {
  display: flex;
  flex-direction: column;
  max-width: 50rem;
  height: 100%;
  margin: 0 auto;
}
`

module.exports = function TodosCreate (store) {
  var state = store()
  var subscribe = store.subscribe
  var dispatch = store.dispatch
  var unsubscribe
  var element

  function load () {
    unsubscribe = subscribe(update)
  }

  function unload () {
    unsubscribe(update)
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
    var todos = state && state.todos
    var showFooter = todos && todos.length
    return html`
      <div
        id=${classes}
        class=${classes}
        onload=${load}
        onunload=${unload}
      >
        ${TitleInput(dispatch)}
        ${TodoList(state, dispatch)}
        ${showFooter? Footer(state, dispatch): null}
      </div>
    `
  }

  function update (newState) {
    html.update(element, create(newState))
  }

  return render(state)
}
