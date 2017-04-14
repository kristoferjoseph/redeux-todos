var html = require('yo-yo')
var css = require('sheetify')
var Todo = require('../components/todo')
var headingClasses = css`
:host {
  padding: 1rem;
  padding-top: 2rem;
}
`
var congratsClasses = css`
:host {
  padding: 3rem;
  font-size: 5rem;
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
        <hr>
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
      return !t.done
    })
    var done = todos.filter(function (t) {
      return t.done
    })

    return html`
      <div>
        <ul>
          ${active.map(function (t) {
            return Todo(t, dispatch)
          })}
        </ul>
        ${active && !active.length && done && done.length ? congrats() : null}
        ${done && done.length ? doneHeading() : null}
        <ul>
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
