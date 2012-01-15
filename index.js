var clarinet = require('clarinet')
  , has = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

var DEBUG = false

module.exports = function makeParser() {
  var parser = clarinet.parser()
  var self = this
  
  var stack = null
  var path = []
  var listeners = parser.objListeners = {}
  var listener = null
  
  function maybeStartCapture() {
    if (path.length === 0) return
    var key1 = path.join('.')
    var key2 = path.slice(0, -1).join('.')+'.'
    if (has(listeners, key1)) {
      if (listener) throw new Error('multiple active listeners at a time not supported yet')
      listener = listeners[key1]
      stack = []
    }
    if (has(listeners, key2)) {
      if (DEBUG) console.log('pathlen: '+path.length)
      if (listener) throw new Error('multiple active listeners at a time not supported yet')
      listener = listeners[key2]
      stack = []
    }
  }
  
  function endCapture(obj) {
    if (path.length === 0) return
    stack = null
    if (!listener) throw new Error()
    listener(obj)
    listener = null
  }
  
  this.onerror = function(e) {
    throw e
  }
  parser.onerror = function(e) {
    self.onerror(e)
  }
  parser.onend = function() {
    self.onend && self.onend()
  }
  parser.onvalue = function(v) {
    if (DEBUG) console.log('value, path: '+path.join('.')+', stacklen: '+stack.length)
    if (stack && stack.length > 0) {
      var last = stack[stack.length-1]
      if (last.type === 'object') {
        last.value[last._key] = v
      } else if (last.type === 'array') {
        last.value.push(v)
      } else throw new Error()
    } else if (stack && stack.length === 0) {
      endCapture(v)
    }
    if (typeof path[path.length-1] === 'number') {
      path.push(path.pop()+1)
      maybeStartCapture()
    }
  }
  parser.onopenobject = function(key) {
    if (DEBUG) console.log('opened object at '+path.join('.'))
    path.push(key)
    if (stack) {
      stack.push({type: 'object', value: {}, _key: key})
    }
    maybeStartCapture()
  }
  parser.onkey = function (key) {
    path.pop()
    path.push(key)
    if (stack && stack.length > 0) stack[stack.length-1]._key = key
    maybeStartCapture()
  }
  parser.oncloseobject = parser.onclosearray = function() {
    path.pop()
    if (stack) {
      var obj = stack.pop().value
      if (DEBUG) console.log('--- stacklen: '+stack.lenght)
      if (DEBUG) console.log('considering endCapture... '+stack.length)
      //if (stack.length === 0) endCapture(obj)
      parser.onvalue(obj)
    } else {
      // doesn't care about the value, and we don't have it anyway
      parser.onvalue(null)
    }
  }
  parser.onopenarray = function () {
    if (DEBUG) console.log('opened array at '+path.join('.'))
    path.push(0)
    if (stack) {
      stack.push({type: 'array', value: []})
    }
    maybeStartCapture()
  }
  
  return parser
}
