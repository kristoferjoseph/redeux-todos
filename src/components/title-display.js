var html = require('bel')
var morph = require('nanomorph')
var css = require('sheeitfy')

var inputClasses = css`
  :host {
    width: 100%;
    font-size: 1.5rem;
    font-weight: 300;
    border: none;
  }
`

var doneClasses = css`
:host {
  text-decoration: line-through;
  opacity: 0.5;
}
`
module.exports = function TitleDisplay (opts) {
  opts = opts || {}
  var element

  function getClasses (done) {
    return done ?
      joinClasses(inputHandle, inputClasses, doneClasses) :
      joinClasses(inputHandle, inputClasses)
  }

  function click (e) {
  }

  function create (state) {
    return html`
      <div
        class=${getClasses(done)}
        onclick=${click}
        disabled=${done}
      >
        ${title}
      </div>
    `
  }

  function update (state) {
  }

  function render (state) {
    element ?
      update(state) :
      (element = create(state), element)
  }
}
