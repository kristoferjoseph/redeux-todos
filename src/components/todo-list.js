var html = require('yo-yo')
var css = require('sheetify')
var Todo = require('../components/todo')
var classes = css`
:host {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}
`
var listClasses = css`
:host {
  margin-top: 1rem;
}
`
var headingClasses = css`
:host {
  padding: 1rem;
  padding-top: 2rem;
  border-bottom: 1px solid;
}
`
var congratsClasses = css`
:host {
  margin-bottom: 1rem;
  padding: 3rem;
  font-size: 3.5rem;
  text-align: center;
}
`

module.exports = function TodoList (state, dispatch) {
  state = state || {}
  var element

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  function doneHeading () {
    return html`
      <h3>
        <div class=${headingClasses}>
          Completed
        </div>
      </h3>
    `
  }

  function congrats () {
    return html`
      <h1>
        <div class=${congratsClasses}>
          Well done
        </div>
      </h1>
    `
  }

  function create (state) {
    state = state || {}
    var todos = state.todos || []
    var active = todos.filter(function (t) {
      return t && !t.done
    })
    var done = todos.filter(function (t) {
      return t && t.done
    })

    return html`
      <div class=${classes}>
        <ul class=${listClasses}>
          ${active.map(function (t) {
            return Todo(t, dispatch)
          })}
        </ul>
        ${active && !active.length && done && done.length ? congrats() : null}
        ${done && done.length ? doneHeading() : null}
        <ul class=${listClasses}>
          ${done.map(function (t) {
            return Todo(t, dispatch)
          })}
        </ul>
      </div>
    `
  }

  function update (state) {
    html.update(element, create(state))
  }

  return render(state)
}
