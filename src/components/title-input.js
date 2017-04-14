var html = require('yo-yo')
var createTodo = require('../actions/todos-actions').createTodo
var css = require('sheetify')
var inputClass = css`
:host {
  flex-grow: 0;
  padding: 1rem;
  padding-top: 2rem;
  width: 100%;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  border-bottom: 1px solid;
  background: transparent;
}
:host:focus {
  border: none;
  border-bottom: 1px solid;
  outline: none;
}
:host::-webkit-input-placeholder {
  color: black;
}
:host::-moz-placeholder {
  color: black;
}
`

var labelClass = css`
:host {
  display: flex;
  min-height: 4.375rem;
  margin-bottom: 1px;
  border-bottom: 1px solid transparent;
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
