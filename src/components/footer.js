var html = require('yo-yo')
var css = require('sheetify')
var CompleteButton = require('./button-complete-all')
var classes = css`
:host {
 text-align: right;
 padding: 1rem;
 background: white;
 border-bottom-right-radius: 2px;
 border-bottom-left-radius: 2px;
}
`

module.exports = function Footer (state, dispatch) {
  return html`
    <footer class=${classes}>
      ${CompleteButton({dispatch: dispatch})}
    </footer>
  `
}
