var yo = require('yo-yo')
var cxs = require('cxs').default
var TitleInput =  require('../components/title-input')
var TodoList = require('../components/todo-list.js')
var className = cxs({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

module.exports = function TodosCreate(store) {
  var view
  var state    = store.getState()
  var dispatch = store.dispatch
  var unsubscribe

  function load() {
    unsubscribe = store.subscribe(render)
  }

  function unload() {
    unsubscribe()
  }

  function create(state) {
    return yo`<div
                class=${className}
                onload=${load}
                onunload=${unload}
              >
                ${TitleInput(dispatch)}
                ${TodoList(state, dispatch)}
              </div>`
  }

  function render(newState) {
    if (newState) {
      return yo.update(view, create(newState))
    }
  }

  return view = create(state)
}
