var yo = require('yo-yo')
var cxs = require('cxs')
var className = cxs({
  flexGrow: '1',
  fontSize: '1rem',
  fontWeight: '500',
  color: 'white',
  background: '#007FFF',
  border: 'none',
  ':active': {
    color: 'blue'
  }
})

module.exports = function Button(state, dispatch) {
  return yo`
    <button class=${className}></button>
  `
}
