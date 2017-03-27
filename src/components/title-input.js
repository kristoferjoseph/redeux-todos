var html = require('yo-yo')
var createTodo = require('../actions/todos-actions').createTodo
var css = require('sheetify')
var inputClass = css`
:host {
  flex-grow: 0;
  padding: 1rem;
  padding-bottom: 0.5rem;
  width: 100%;
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 0.5rem;
  color: #FFF;
  border: none;
  background: transparent;
}
:host:focus {
  border: none;
  outline: none;
}
:host::-webkit-input-placeholder {
  color: #EEE;
}
:host::-moz-placeholder {
  color: #EEE;
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

  function keyup (e) {
    var keyCode = e.keyCode
    // Enter key to save
    if (keyCode === 13) {
      submit()
    }
  }

  function submit () {
    var input = document.getElementById('title')
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
