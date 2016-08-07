var yo = require('yo-yo')
var createTodo = require('../actions/todos-actions').createTodo
var cxs = require('cxs').default
var inputClass = cxs({
  flexGrow: '0',
  padding: '1rem',
  paddingBottom: '0.5rem',
  width:  '100%',
  fontSize: '2rem',
  fontWeight: '100',
  marginBottom: '0.5rem',
  color: '#FFF',
  border: 'none',
  background: 'transparent',
  ':focus': {
    border: 'none',
    outline: 'none'
  },
  '::-webkit-input-placeholder': {
    color: '#EEE'
  },
  '::-moz-placeholder': {
    color: '#EEE'
  }
})
var labelClass = cxs({
  display: 'flex',
  marginBottom: '1px',
  borderBottom: '1px solid transparent',
})

module.exports = function(dispatch) {

  function keyup(e) {
    var keyCode = e.keyCode
    // Enter key to save
    if (keyCode === 13) {
      submit()
    }
  }

  function submit() {
    var input = document.getElementById('title')
    var title = input && input.value
    if (title) {
      input.value = ''
      dispatch(createTodo(title))
    }
  }

  return yo`
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
            </label>`
}
