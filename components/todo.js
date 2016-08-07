var yo = require('yo-yo')
var cxs = require('cxs').default
var Checkbox = require('./checkbox')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var deleteTodo = actions.deleteTodo

module.exports = function Todo(state, dispatch) {
  var jsHandle = `js-${state.id}`
  var itemClass = cxs({
    display: 'flex',
    padding: '1rem',
    alignItems: 'center',
    marginBottom: '1px',
    borderBottom: '1px solid transparent',
    background: 'white'
  })

  var buttonClass = cxs({
    fontSize: '0.85rem',
    height: '100%',
    color: 'red',
    border: 'none',
    background: 'none'
  })

  function keydown(e) {
    var newTodo
    var keyCode = e.keyCode
    // ESCAPE key to exit edit
    if (keyCode === 27) {
      newTodo = Object.assign({}, state)
      newTodo.editing = false
      dispatch(updateTodo(newTodo))
    }
    // Enter key to save
    else if (keyCode === 13) {
      e.preventDefault()
      submit()
    }
  }

  function edit() {
    var el = document.querySelector(`.${jsHandle}`)
    el.focus()
    var newTodo = Object.assign({}, state)
    newTodo.editing = true
    dispatch(updateTodo(newTodo))
  }

  function submit() {
    var el = document.querySelector(`.${jsHandle}`)
    var newTodo = Object.assign({}, state)
    newTodo.title = el.innerText
    newTodo.editing = false
    dispatch(updateTodo(newTodo))
  }

  function destroy() {
    dispatch(deleteTodo(state))
  }

  return yo`<li class=${itemClass}>
              ${Checkbox(state, dispatch)}
              <span
                className=${jsHandle}
                style='width: 100%; outline: none;'
                contenteditable=${state.editing}
                onclick=${edit}
                onkeydown=${keydown}
              >
                ${state.title}
              </span>
              ${state.editing?
                yo`
                    <button
                      class=${buttonClass}
                      onclick=${destroy}
                    >
                    ✖︎
                    </button>
                  `: null
              }
            </li>`
}
