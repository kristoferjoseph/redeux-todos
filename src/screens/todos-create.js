var html = require('bel')
var morph = require('nanomorph')
var css = require('sheetify')
var TitleInput = require('../components/title-input')
var TodoList = require('../components/todo-list.js')
var DoneHeader = require('../components/done-header')
var Congrats = require('../components/congrats')
var Footer = require('../components/footer')
var CompleteButton = require('../components/button-complete-all')
var classes = css`
:host {
  display: flex;
  flex-direction: column;
  max-width: 33.333rem;
  height: 100%;
  margin: 0 auto;
  padding: 1rem;
  padding-top: 2rem;
  overflow: hidden;
}
`
var contentClasses = css`
:host {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
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
    return element ?
      update(state) :
      element = create(state), element
  }

  function create (state) {
    var todos = state && state.todos
    var active = todos.filter(function (t) {
      return t && !t.done
    })
    var done = todos.filter(function (t) {
      return t && t.done
    })
    var showFooter = todos && todos.length
    var notActive = active && !active.length
    var areDone = done && done.length
    return html`
      <div
        id=${classes}
        class=${classes}
        onload=${load}
        onunload=${unload}
      >
        ${TitleInput(dispatch)}
        <div class=${contentClasses}>
          ${TodoList(active, dispatch)}
          ${notActive && areDone ? Congrats() : null}
          ${areDone ? DoneHeader() : null}
          ${TodoList(done, dispatch)}
        </div>
        ${showFooter ? Footer(todos, dispatch) : null}
      </div>
    `
  }

  function update (state) {
    morph(element, create(state))
  }

  return render(state)
}
