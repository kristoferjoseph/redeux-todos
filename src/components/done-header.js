var html = require('bel')
var css = require('sheetify')
var classes = css`
:host {
  padding: 1rem;
  padding-top: 2rem;
  border-bottom: 1px solid;
}
`
module.exports = function DoneHeader () {
  return html`
    <h3 class=${classes}>
      Completed
    </h3>
  `
}
