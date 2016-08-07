var yo = require('yo-yo')
var cxs = require('cxs').default
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

module.exports = function(state, dispatch) {
  var className = cxs({
    marginRight: '1rem'
  })

  function change(e) {
    var newTodo = Object.assign({}, state)
    newTodo.done = !newTodo.done
    dispatch(updateTodo(newTodo))
  }

  return yo`
          <input
            className=${className}
            type='checkbox'
            onchange=${change}
            checked=${state.done}
          />
          `
}
