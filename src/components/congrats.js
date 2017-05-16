var html = require('bel')
var css = require('sheetify')
var classes = css`
:host {
  margin-bottom: 1rem;
  padding: 3rem;
  font-size: 3.5rem;
  text-align: center;
}
`
module.exports = function Congrats() {
  return html`
    <h1 class=${classes}>
      Well done
    </h1>
  `
}
