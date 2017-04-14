var html = require('yo-yo')
var css = require('sheetify')
var CompleteButton = require('./button-complete-all')
var DeleteButton = require('./button-delete-all')
var classes = css`
:host {
 text-align: right;
 padding: 1rem 0;
}
`

module.exports = function Footer (state, dispatch) {
  var active = state.filter(function (t) {
    return !t.done
  })

  function getButton (todos) {
    return todos ?
    CompleteButton({dispatch: dispatch}) :
    DeleteButton({dispatch: dispatch})
  }

  return html`
    <footer class=${classes}>
      ${getButton(active && active.length)}
    </footer>
  `
}
