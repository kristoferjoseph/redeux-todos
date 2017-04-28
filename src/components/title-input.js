var html = require('bel')
var createTodo = require('../actions/todos-actions').createTodo
var css = require('sheetify')
var labelClass = css`
:host {
  height: 4rem;
  min-height: 4rem;
  border-bottom: 1px solid;
  background: transparent;
}
`
var inputClass = css`
:host {
  width: 100%;
  height: 4rem;
  padding: 0 1rem;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  background: transparent;
}
:host:focus {
  border: none;
  outline: none;
}
:host::-webkit-input-placeholder {
  color: black;
}
:host::-moz-placeholder {
  color: black;
}
`

module.exports = function (dispatch) {

  function getTitle () {
    return document.getElementById('title')
  }

  function keyup (e) {
    var keyCode = e.keyCode
    // Enter key to save
    if (keyCode === 13) {
      submit()
    }
  }

  function submit () {
    var input = getTitle()
    var title = input && input.value
    if (title) {
      input.value = ''
      dispatch(createTodo(title))
    }
  }

  return html`
    <label
      for='title'
      class=${labelClass}
    >
      <input
        class=${inputClass}
        autofocus
        id='title'
        name='title'
        onkeyup=${keyup}
        placeholder='Enter todo'
      />
    </label>
  `
}
