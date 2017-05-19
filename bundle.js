(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"util/":19}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":2}],5:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
module.exports = function hashswitch (actions, defaultCallback){
  var hash = {}
  hash.DEFAULT_CALLBACK = defaultCallback || function () {}
  actions && Object.keys(actions).forEach(function (action) {
    ('string' === typeof action && 'function' === typeof actions[action]) ?
    (hash[action] = actions[action]) :
    console.log(action + ' should be a string and ' + actions[action] + ' should be a function.')
  })
  return function exectue (action) {
   'string' !== typeof action && console.error(action + ' should be a string')
    return (hash[action] || hash.DEFAULT_CALLBACK).apply(this, [].slice.call(arguments, 1))
  }
}

},{}],7:[function(require,module,exports){
var containers = []; // will store container HTMLElement references
var styleElements = []; // will store {prepend: HTMLElement, append: HTMLElement}

var usage = 'insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options]).';

function insertCss(css, options) {
    options = options || {};

    if (css === undefined) {
        throw new Error(usage);
    }

    var position = options.prepend === true ? 'prepend' : 'append';
    var container = options.container !== undefined ? options.container : document.querySelector('head');
    var containerId = containers.indexOf(container);

    // first time we see this container, create the necessary entries
    if (containerId === -1) {
        containerId = containers.push(container) - 1;
        styleElements[containerId] = {};
    }

    // try to get the correponding container + position styleElement, create it otherwise
    var styleElement;

    if (styleElements[containerId] !== undefined && styleElements[containerId][position] !== undefined) {
        styleElement = styleElements[containerId][position];
    } else {
        styleElement = styleElements[containerId][position] = createStyleElement();

        if (position === 'prepend') {
            container.insertBefore(styleElement, container.childNodes[0]);
        } else {
            container.appendChild(styleElement);
        }
    }

    // strip potential UTF-8 BOM if css was read from a file
    if (css.charCodeAt(0) === 0xFEFF) { css = css.substr(1, css.length); }

    // actually add the stylesheet
    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText += css
    } else {
        styleElement.textContent += css;
    }

    return styleElement;
};

function createStyleElement() {
    var styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    return styleElement;
}

module.exports = insertCss;
module.exports.insertCss = insertCss;

},{}],8:[function(require,module,exports){
var filter = Array.prototype.filter
module.exports = function joinClasses () {
  return filter.call(arguments, function (s) {
    return s && 'string' === typeof s
  }).join(' ').trim()
}

},{}],9:[function(require,module,exports){
module.exports = function kubby(options) {
  options = options || {}
  var noop = function(){}
  var storage
  if (typeof window === 'undefined') {
    storage = {setItem:noop,getItem:noop,clear:noop}
  }
  else {
   storage = options.storage === 'session'?
    window.sessionStorage:
    window.localStorage
  }

  function set(label, data) {
    if (label && typeof label === 'string' && data) {
      storage.setItem(label, JSON.stringify(data))
    }
    else {
      throw Error('kubby.set requires a string label and data to store.')
    }
  }

  function get(labels) {
    var result
    if (Array.isArray(labels)) {
      result = {}
      labels.forEach(function(l) {
        Object.assign(result, actualGet(l))
      })
    }
    else if (typeof labels === 'string') {
      result = actualGet(labels)
    }
    else {
      throw Error('kubby.get requires a string label to retrieve data from store.')
    }

    return result
  }

  function actualGet(label) {
    return JSON.parse(storage.getItem(label))
  }

  function empty() {
    storage.clear()
  }

  return {
    get:get,
    set:set,
    empty:empty
  }
}

},{}],10:[function(require,module,exports){
var assert = require('assert')
var morph = require('./lib/morph')
var rootLabelRegex = /^data-onloadid/

var ELEMENT_NODE = 1

module.exports = nanomorph

// morph one tree into another tree
// (obj, obj) -> obj
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function nanomorph (oldTree, newTree) {
  assert.equal(typeof oldTree, 'object', 'nanomorph: oldTree should be an object')
  assert.equal(typeof newTree, 'object', 'nanomorph: newTree should be an object')

  persistStatefulRoot(newTree, oldTree)
  var tree = walk(newTree, oldTree)
  return tree
}

// walk and morph a dom tree
// (obj, obj) -> obj
function walk (newNode, oldNode) {
  if (!oldNode) {
    return newNode
  } else if (!newNode) {
    return null
  } else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
    return oldNode
  } else if (newNode.tagName !== oldNode.tagName) {
    return newNode
  } else {
    morph(newNode, oldNode)
    updateChildren(newNode, oldNode)
    return oldNode
  }
}

// update the children of elements
// (obj, obj) -> null
function updateChildren (newNode, oldNode) {
  if (!newNode.childNodes || !oldNode.childNodes) return

  var newLength = newNode.childNodes.length
  var oldLength = oldNode.childNodes.length
  var length = Math.max(oldLength, newLength)

  var iNew = 0
  var iOld = 0
  for (var i = 0; i < length; i++, iNew++, iOld++) {
    var newChildNode = newNode.childNodes[iNew]
    var oldChildNode = oldNode.childNodes[iOld]
    var retChildNode = walk(newChildNode, oldChildNode)
    if (!retChildNode) {
      if (oldChildNode) {
        oldNode.removeChild(oldChildNode)
        iOld--
      }
    } else if (!oldChildNode) {
      if (retChildNode) {
        oldNode.appendChild(retChildNode)
        iNew--
      }
    } else if (retChildNode !== oldChildNode) {
      oldNode.replaceChild(retChildNode, oldChildNode)
      iNew--
    }
  }
}

function persistStatefulRoot (newNode, oldNode) {
  if (!newNode || !oldNode || oldNode.nodeType !== ELEMENT_NODE || newNode.nodeType !== ELEMENT_NODE) return
  var oldAttrs = oldNode.attributes
  var attr, name
  for (var i = 0, len = oldAttrs.length; i < len; i++) {
    attr = oldAttrs[i]
    name = attr.name
    if (rootLabelRegex.test(name)) {
      newNode.setAttribute(name, attr.value)
      break
    }
  }
}

},{"./lib/morph":12,"assert":1}],11:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],12:[function(require,module,exports){
var events = require('./events')
var eventsLength = events.length

var ELEMENT_NODE = 1
var TEXT_NODE = 3
var COMMENT_NODE = 8

module.exports = morph

// diff elements and apply the resulting patch to the old node
// (obj, obj) -> null
function morph (newNode, oldNode) {
  var nodeType = newNode.nodeType
  var nodeName = newNode.nodeName

  if (nodeType === ELEMENT_NODE) {
    copyAttrs(newNode, oldNode)
  }

  if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
    oldNode.nodeValue = newNode.nodeValue
  }

  // Some DOM nodes are weird
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') updateInput(newNode, oldNode)
  else if (nodeName === 'OPTION') updateOption(newNode, oldNode)
  else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode)
  else if (nodeName === 'SELECT') updateSelect(newNode, oldNode)

  copyEvents(newNode, oldNode)
}

function copyAttrs (newNode, oldNode) {
  var oldAttrs = oldNode.attributes
  var newAttrs = newNode.attributes
  var attrNamespaceURI = null
  var attrValue = null
  var fromValue = null
  var attrName = null
  var attr = null

  for (var i = newAttrs.length - 1; i >= 0; --i) {
    attr = newAttrs[i]
    attrName = attr.name
    attrNamespaceURI = attr.namespaceURI
    attrValue = attr.value

    if (attrNamespaceURI) {
      attrName = attr.localName || attrName
      fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName)

      if (fromValue !== attrValue) {
        oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue)
      }
    } else {
      fromValue = oldNode.getAttribute(attrName)

      if (fromValue !== attrValue) {
        // apparently values are always cast to strings, ah well
        if (attrValue === 'null' || attrValue === 'undefined') {
          oldNode.removeAttribute(attrName)
        } else {
          oldNode.setAttribute(attrName, attrValue)
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j]
    if (attr.specified !== false) {
      attrName = attr.name
      attrNamespaceURI = attr.namespaceURI

      if (attrNamespaceURI) {
        attrName = attr.localName || attrName
        if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          oldNode.removeAttributeNS(attrNamespaceURI, attrName)
        }
      } else {
        if (!newNode.hasAttributeNS(null, attrName)) {
          oldNode.removeAttribute(attrName)
        }
      }
    }
  }
}

function copyEvents (newNode, oldNode) {
  for (var i = 0; i < eventsLength; i++) {
    var ev = events[i]
    if (newNode[ev]) {           // if new element has a whitelisted attribute
      oldNode[ev] = newNode[ev]  // update existing element
    } else if (oldNode[ev]) {    // if existing element has it and new one doesnt
      oldNode[ev] = undefined    // remove it from existing element
    }
  }
}

function updateOption (newNode, oldNode) {
  updateAttribute(newNode, oldNode, 'selected')
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput (newNode, oldNode) {
  var newValue = newNode.value
  var oldValue = oldNode.value

  updateAttribute(newNode, oldNode, 'checked')
  updateAttribute(newNode, oldNode, 'disabled')

  if (!newNode.hasAttributeNS(null, 'value') || newValue === 'null') {
    oldNode.value = ''
    oldNode.removeAttribute('value')
  } else if (newValue !== oldValue) {
    oldNode.setAttribute('value', newValue)
    oldNode.value = newValue
  } else if (oldNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    oldNode.value = newValue
  }
}

function updateTextarea (newNode, oldNode) {
  var newValue = newNode.value
  if (newValue !== oldNode.value) {
    oldNode.value = newValue
  }

  if (oldNode.firstChild) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
      return
    }

    oldNode.firstChild.nodeValue = newValue
  }
}

function updateSelect (newNode, oldNode) {
  if (!oldNode.hasAttributeNS(null, 'multiple')) {
    var i = 0
    var curChild = oldNode.firstChild
    while (curChild) {
      var nodeName = curChild.nodeName
      if (nodeName && nodeName.toUpperCase() === 'OPTION') {
        if (curChild.hasAttributeNS(null, 'selected')) break
        i++
      }
      curChild = curChild.nextSibling
    }

    newNode.selectedIndex = i
  }
}

function updateAttribute (newNode, oldNode, name) {
  if (newNode[name] !== oldNode[name]) {
    oldNode[name] = newNode[name]
    if (newNode[name]) {
      oldNode.setAttribute(name, '')
    } else {
      oldNode.removeAttribute(name, '')
    }
  }
}

},{"./events":11}],13:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":4,"global/window":5}],14:[function(require,module,exports){
module.exports = function redeux () {
  var state = {}
  var listeners = []
  var name = ''
  var queue = []
  var raf = 'undefined' === typeof window ?
    setTimeout :
    window.requestAnimationFrame
  var initialState
  var reducers

  ('object' === typeof arguments[arguments.length - 1]) &&
  (initialState = Array.prototype.pop.call(arguments))

  reducers = Array.prototype.map.call(
    arguments,
    function (r) {
      if (r) {
        name = r.name
        return initialState ?
          (initialState.hasOwnProperty(name) ||
          console.warn('initialState.' + name + ' is missing.'),
          state[name] = r(initialState[name])) :
          state[name] = r(), r
      }
    }
  )

  function store (func) {
    return func ? func(state) : state
  }

  function subscribe (listener) {
    return 'function' === typeof listener ?
      (listeners.push(listener), unsubscribe) :
      console.error('listener must be a function')
  }

  function unsubscribe (listener) {
    return listeners.splice(listeners.indexOf(listener), 1)
  }

  function dispatch () {
    var action = queue.pop()
    action &&
    'string' !== typeof action.type &&
    console.error('action.type must be a "string"')
    reducers.forEach(function (r) {
      name = r.name
      state[name] = r(state[name], action)
    })
    queue.length ? raf(dispatch) : notify()
  }

  function notify () {
    var update = store()
    listeners.forEach(function (l) {
      l(update)
    })
  }

  function prequeue (action) {
    queue.push(action)
    raf(dispatch)
  }

  store.subscribe = subscribe
  store.dispatch = prequeue
  return store
}

},{}],15:[function(require,module,exports){
module.exports = require('insert-css')

},{"insert-css":7}],16:[function(require,module,exports){
module.exports = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b};

},{}],17:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],18:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],19:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":18,"_process":3,"inherits":17}],20:[function(require,module,exports){
module.exports = function yoyoifyAppendChild (el, childs) {
  for (var i = 0; i < childs.length; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      yoyoifyAppendChild(el, node)
      continue
    }
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }
    if (typeof node === 'string') {
      if (el.lastChild && el.lastChild.nodeName === '#text') {
        el.lastChild.nodeValue += node
        continue
      }
      node = document.createTextNode(node)
    }
    if (node && node.nodeType) {
      el.appendChild(node)
    }
  }
}

},{}],21:[function(require,module,exports){
var CREATE_TODO = 'CREATE_TODO'
var UPDATE_TODO = 'UPDATE_TODO'
var COMPLETE_ALL = 'COMPLETE_ALL'
var DELETE_TODO = 'DELETE_TODO'
var DELETE_ALL = 'DELETE_ALL'

function createTodo (title) {
  return {
    type: CREATE_TODO,
    data: {
      title: title
    }
  }
}

function updateTodo (data) {
  return {
    type: UPDATE_TODO,
    data: data
  }
}

function deleteTodo (data) {
  return {
    type: DELETE_TODO,
    data: data
  }
}

function completeAll () {
  return {
    type: COMPLETE_ALL
  }
}

function deleteAll () {
  return {
    type: DELETE_ALL
  }
}

module.exports = {
  createTodo: createTodo,
  updateTodo: updateTodo,
  deleteTodo: deleteTodo,
  completeAll: completeAll,
  deleteAll: deleteAll,
  CREATE_TODO: CREATE_TODO,
  UPDATE_TODO: UPDATE_TODO,
  COMPLETE_ALL: COMPLETE_ALL,
  DELETE_TODO: DELETE_TODO,
  DELETE_ALL: DELETE_ALL
}

},{}],22:[function(require,module,exports){
var html = {}
var css = 0
var actions = require('../actions/todos-actions')
var completeAll = actions.completeAll
var classes = ((null || true) && "_df666def")

module.exports = function CompleteAllButton (opts) {
  opts = opts || {}
  var dispatch = opts.dispatch || function () {}

  function click () {
    dispatch(completeAll())
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("button")
bel0["onclick"] = arguments[0]
bel0.setAttribute("class", arguments[1])
ac(bel0, ["\n      Complete All\n    "])
      return bel0
    }(click,classes))
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],23:[function(require,module,exports){
var html = {}
var css = 0
var actions = require('../actions/todos-actions')
var deleteAll = actions.deleteAll
var classes = ((null || true) && "_df666def")

module.exports = function DeleteAllButton (opts) {
  opts = opts || {}
  var dispatch = opts.dispatch || function () {}

  function click () {
    dispatch(deleteAll())
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("button")
bel0["onclick"] = arguments[0]
bel0.setAttribute("class", arguments[1])
ac(bel0, ["\n      Delete All\n    "])
      return bel0
    }(click,classes))
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],24:[function(require,module,exports){
var html = {}
var css = 0
var actions = require('../actions/todos-actions')
var deleteTodo = actions.deleteTodo
var classes = ((null || true) && "_b0990f22")

module.exports = function Button (state, dispatch) {

  function destroy () {
    dispatch(deleteTodo(state))
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("button")
bel0["onclick"] = arguments[0]
bel0.setAttribute("class", arguments[1])
ac(bel0, ["\n      ✖︎\n    "])
      return bel0
    }(destroy,classes))
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],25:[function(require,module,exports){
var html = {}
var css = 0
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo
var classes = ((null || true) && "_fbe0d814")
var inputClasses = ((null || true) && "_bd357024")

var doneClasses = ((null || true) && "_5c5561cc")

module.exports = function (state, dispatch) {
  state = state || {}
  var done = state.done

  function change (e) {
    var newTodo = Object.assign({}, state)
    newTodo.done = !newTodo.done
    dispatch(updateTodo(newTodo))
  }

  function getClasses () {
    return done ?
      joinClasses(classes, doneClasses) :
      classes
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel1 = document.createElement("label")
bel1.setAttribute("class", arguments[3])
var bel0 = document.createElement("input")
bel0.setAttribute("type", "checkbox")
bel0["onchange"] = arguments[0]
if (arguments[1]) bel0.setAttribute("checked", "checked")
bel0.setAttribute("class", arguments[2])
ac(bel1, ["\n      ",bel0,"\n    "])
      return bel1
    }(change,done,inputClasses,getClasses()))
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"join-classes":8,"sheetify/insert":15}],26:[function(require,module,exports){
var html = {}
var css = 0
var classes = ((null || true) && "_9cf46706")
module.exports = function Congrats() {
  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("h1")
bel0.setAttribute("class", arguments[0])
ac(bel0, ["\n      Well done\n    "])
      return bel0
    }(classes))
}

},{"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],27:[function(require,module,exports){
var html = {}
var css = 0
var classes = ((null || true) && "_3c9f36e5")
module.exports = function DoneHeader () {
  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("h3")
bel0.setAttribute("class", arguments[0])
ac(bel0, ["\n      Completed\n    "])
      return bel0
    }(classes))
}

},{"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],28:[function(require,module,exports){
var html = {}
var css = 0
var CompleteButton = require('./button-complete-all')
var DeleteButton = require('./button-delete-all')
var classes = ((null || true) && "_5a8dfa4e")

module.exports = function Footer (state, dispatch) {
  var active = state.filter(function (t) {
    return !t.done
  })

  function getButton (todos) {
    return todos ?
    CompleteButton({dispatch: dispatch}) :
    DeleteButton({dispatch: dispatch})
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("footer")
bel0.setAttribute("class", arguments[0])
ac(bel0, ["\n      ",arguments[1],"\n    "])
      return bel0
    }(classes,getButton(active && active.length)))
}

},{"./button-complete-all":22,"./button-delete-all":23,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],29:[function(require,module,exports){
var html = {}
var morph = require('nanomorph')
var css = 0
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

var inputClasses = ((null || true) && "_9e829db2")

var doneClasses = ((null || true) && "_bf30b541")

module.exports = function TitleDisplay (state, dispatch) {
  state = state || {}
  var element

  function getClasses (done) {
    return done ?
      joinClasses(inputClasses, doneClasses) :
      joinClasses(inputClasses)
  }

  function click (e) {
    var newTodo = Object.assign({}, state)
    newTodo.editing = !newTodo.editing
    dispatch(updateTodo(newTodo))
  }

  function create (state) {
    state = state || {}
    var title = state.title
    var done = state.done
    var editing = state.editing
    return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("p")
bel0["onclick"] = arguments[0]
if (arguments[1]) bel0.setAttribute("disabled", "disabled")
bel0.setAttribute("class", arguments[2])
ac(bel0, ["\n        ",arguments[3],"\n      "])
      return bel0
    }(click,done,getClasses(done),title))
  }

  function update (state) {
    morph(element, create(state))
  }

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  return render(state)
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"join-classes":8,"nanomorph":10,"sheetify/insert":15}],30:[function(require,module,exports){
var html = {}
var createTodo = require('../actions/todos-actions').createTodo
var css = 0
var labelClass = ((null || true) && "_6dddc22b")
var inputClass = ((null || true) && "_2bd0bde2")

module.exports = function (dispatch) {

  function getTitle () {
    return document.getElementById('title')
  }

  function keyup (e) {
    var keyCode = e.keyCode
    // Enter key to save
    if (keyCode === 13) {
      submit()
    }
  }

  function submit () {
    var input = getTitle()
    var title = input && input.value
    if (title) {
      input.value = ''
      dispatch(createTodo(title))
    }
  }

  return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel1 = document.createElement("label")
bel1.setAttribute("htmlFor", "title")
bel1.setAttribute("class", arguments[2])
var bel0 = document.createElement("input")
bel0.setAttribute("autofocus", "autofocus")
bel0.setAttribute("id", "title")
bel0.setAttribute("name", "title")
bel0["onkeyup"] = arguments[0]
bel0.setAttribute("placeholder", "Enter todo")
bel0.setAttribute("class", arguments[1])
ac(bel1, ["\n      ",bel0,"\n    "])
      return bel1
    }(keyup,inputClass,labelClass))
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"sheetify/insert":15}],31:[function(require,module,exports){
var html = {}
var morph = require('nanomorph')
var css = 0
var joinClasses = require('join-classes')
var actions = require('../actions/todos-actions')
var updateTodo = actions.updateTodo

var containerClasses = ((null || true) && "_2dadbed3")

var textAreaClasses = ((null || true) && "_8d16f973")

module.exports = function TodoInput (state, dispatch) {
  state = state || {}
  var title = state.title
  var element

  function copyTodo () {
    return Object.assign({}, state)
  }

  function keydown (e) {
    var newTodo
    var keyCode = e.keyCode
    var shift = e.shiftKey
    // ESC key to exit edit
    if (keyCode === 27) {
      newTodo = copyTodo()
      newTodo.editing = false
      dispatch(updateTodo(newTodo))
    // Enter key to save
    } else if (keyCode === 13) {
      e.preventDefault()
      submit()
    } else if (keyCode === 13 && shift) {
      // FIXME: challenge PR how to add special characters!
    }
  }

  function input (e) {
    e &&
    e.target &&
    e.target.value &&
    updateTitle()
  }

  function updateTitle () {
    var el = document.querySelector('.'+textAreaClasses)
    var newTodo = copyTodo()
    newTodo.title = el.value
    dispatch(updateTodo(newTodo))
  }

  function submit () {
    var newTodo = copyTodo()
    newTodo.editing = false
    dispatch(updateTodo(newTodo))
  }

  function focus () {
    var el = document.querySelector('.'+textAreaClasses)
    el && el.focus()
  }

  function create (state) {
    state = state || {}
    var done = state.done
    var title = state.title
    return (function () {
      var onload = require('/Users/kj/Documents/work/redeux-todos/node_modules/on-load/index.js')
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel1 = document.createElement("label")
var args = arguments
      onload(bel1, function bel_onload () {
        args[5](bel1)
      }, function bel_onunload () {
        
      }, "o1")
bel1.setAttribute("class", arguments[6])
var bel0 = document.createElement("textarea")
bel0["oninput"] = arguments[0]
bel0["onkeydown"] = arguments[1]
if (arguments[2]) bel0.setAttribute("disabled", "disabled")
bel0.setAttribute("class", arguments[3])
ac(bel0, [arguments[4]])
ac(bel1, ["\n        ",arguments[7],"\n        ",bel0,"\n      "])
      return bel1
    }(input,keydown,done,textAreaClasses,title,focus,containerClasses,title))
  }

  function update (state) {
    morph(element, create(state))
  }

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  return render(state)
}

},{"../actions/todos-actions":21,"/Users/kj/Documents/work/redeux-todos/node_modules/on-load/index.js":13,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"join-classes":8,"nanomorph":10,"sheetify/insert":15}],32:[function(require,module,exports){
var html = {}
var update = require('nanomorph')
var css = 0
var Todo = require('../components/todo')
var classes = ((null || true) && "_fbf62c13")

module.exports = function TodoList (state, dispatch) {
  state = state || {}
  var element

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }


  function create (state) {
    var todos = state || []

    return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("ul")
bel0.setAttribute("class", arguments[0])
ac(bel0, ["\n        ",arguments[1],"\n      "])
      return bel0
    }(classes,todos.map(function (t) {
          return Todo(t, dispatch)
        })))
  }

  function update (state) {
    update(element, create(state))
  }

  return render(state)
}

},{"../components/todo":33,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"nanomorph":10,"sheetify/insert":15}],33:[function(require,module,exports){
var html = {}
var morph = require('nanomorph')
var css = 0
var joinClasses = require('join-classes')
var Checkbox = require('./checkbox')
var Button = require('./button')
var TodoInput = require('./todo-input')
var TitleDisplay = require('./title-display')
var classes = ((null || true) && "_76489e16")
var inputClasses = ((null || true) && "_5991b9a1")

var doneClasses = ((null || true) && "_bf30b541")

module.exports = function Todo (state, dispatch) {
  state = state || {}
  var id = state.id
  var inputHandle = 'input-' + id
  var element

  function getInput () {
    return document.querySelector('.'+inputHandle)
  }

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  function getClasses (done) {
    return done ?
      joinClasses(inputHandle, inputClasses, doneClasses) :
      joinClasses(inputHandle, inputClasses)
  }

  function getContent (state) {
    state = state || {}
    var editing = state.editing || false
    var done = state.done || false
    return editing && !done ? TodoInput(state, dispatch) : TitleDisplay(state, dispatch)
  }

  function create (state) {
    state = state || {}
    var done = state.done
    var editing = state.editing
    return (function () {
      
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel0 = document.createElement("li")
bel0.setAttribute("id", arguments[0])
bel0.setAttribute("class", arguments[1])
ac(bel0, ["\n        ",arguments[2],"\n        ",arguments[3],"\n        ",arguments[4],"\n      "])
      return bel0
    }(id,classes,Checkbox(state, dispatch),getContent(state),done && editing ? Button(state, dispatch) : null))
  }

  function update (state) {
    morph(element, create(state))
  }

  return render(state)
}

},{"./button":24,"./checkbox":25,"./title-display":29,"./todo-input":31,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"join-classes":8,"nanomorph":10,"sheetify/insert":15}],34:[function(require,module,exports){
var createStore = require('redeux')
var kubby = require('kubby')()
var todos = require('./reducers/todos-reducer')
var TodoCreate = require('./screens/todos-create')
var localTodos = kubby.get('redeux-todos')
var localState = localTodos ? {todos:localTodos} : {todos:[]}

var store = createStore(todos, localState)
var todoCreate = TodoCreate(store)
document.getElementById('root').appendChild(todoCreate)

},{"./reducers/todos-reducer":35,"./screens/todos-create":36,"kubby":9,"redeux":14}],35:[function(require,module,exports){
var tid = require('tiny-uuid')
var hs = require('hash-switch')
var kubby = require('kubby')()
var actions = require('../actions/todos-actions')
var CREATE_TODO = actions.CREATE_TODO
var UPDATE_TODO = actions.UPDATE_TODO
var COMPLETE_ALL = actions.COMPLETE_ALL
var DELETE_TODO = actions.DELETE_TODO
var DELETE_ALL = actions.DELETE_ALL
var TODOS_LABEL = 'redeux-todos'
var stateMachine = hs(
  {
    CREATE_TODO: createTodo,
    UPDATE_TODO: updateTodo,
    COMPLETE_ALL: completeAll,
    DELETE_TODO: deleteTodo,
    DELETE_ALL: deleteAll
  },
  function (state) {
    return state
  }
)

module.exports = function todos (state, action) {
  state = state || []
  var type = action && action.type || ''
  var data = action && action.data
  var newState = stateMachine(type, state, data)
  return newState
}

function createTodo (state, data) {
  var newState = state.slice()
  data.id = tid().substr(0, 7)
  data.done = false
  newState.push(data)
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function updateTodo (state, data) {
  var newState = state.slice()
  newState = newState.map(function (t) {
    var todo
    if (data.editing) {
      t.editing = false
    }
    if (data.id === t.id) {
      todo = data
    } else {
      todo = t
    }
    return todo
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function completeAll (state, data) {
  var newState = state.slice()
  newState = newState.map(function (t) {
    var todo = Object.assign({}, t)
    todo.done = true
    return todo
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function deleteTodo (state, data) {
  var newState = state.slice()
  newState = newState.filter(function (t) {
    return t.id !== data.id
  })
  kubby.set(TODOS_LABEL, newState)
  return newState
}

function deleteAll (state, data) {
  var newState = []
  kubby.set(TODOS_LABEL, newState)
  return newState
}


},{"../actions/todos-actions":21,"hash-switch":6,"kubby":9,"tiny-uuid":16}],36:[function(require,module,exports){
var html = {}
var morph = require('nanomorph')
var css = 0
var TitleInput = require('../components/title-input')
var TodoList = require('../components/todo-list.js')
var DoneHeader = require('../components/done-header')
var Congrats = require('../components/congrats')
var Footer = require('../components/footer')
var CompleteButton = require('../components/button-complete-all')
var classes = ((null || true) && "_71ffb0bf")
var contentClasses = ((null || true) && "_cf95d9bd")

module.exports = function TodosCreate (store) {
  var state = store()
  var subscribe = store.subscribe
  var dispatch = store.dispatch
  var unsubscribe
  var element

  function load () {
    unsubscribe = subscribe(update)
  }

  function unload () {
    unsubscribe(update)
  }

  function render (state) {
    return element ?
      update(state) :
      element = create(state), element
  }

  function create (state) {
    var todos = state && state.todos
    var active = todos.filter(function (t) {
      return t && !t.done
    })
    var done = todos.filter(function (t) {
      return t && t.done
    })
    var showFooter = todos && todos.length
    var notActive = active && !active.length
    var areDone = done && done.length
    return (function () {
      var onload = require('/Users/kj/Documents/work/redeux-todos/node_modules/on-load/index.js')
      var ac = require('/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js')
      var bel1 = document.createElement("div")
var args = arguments
      onload(bel1, function bel_onload () {
        args[5](bel1)
      }, function bel_onunload () {
        args[6](bel1)
      }, "o0")
bel1.setAttribute("id", arguments[7])
bel1.setAttribute("class", arguments[8])
var bel0 = document.createElement("div")
bel0.setAttribute("class", arguments[0])
ac(bel0, ["\n          ",arguments[1],"\n          ",arguments[2],"\n          ",arguments[3],"\n          ",arguments[4],"\n        "])
ac(bel1, ["\n        ",arguments[9],"\n        ",bel0,"\n        ",arguments[10],"\n      "])
      return bel1
    }(contentClasses,TodoList(active, dispatch),notActive && areDone ? Congrats() : null,areDone ? DoneHeader() : null,TodoList(done, dispatch),load,unload,classes,classes,TitleInput(dispatch),showFooter ? Footer(todos, dispatch) : null))
  }

  function update (state) {
    morph(element, create(state))
  }

  return render(state)
}

},{"../components/button-complete-all":22,"../components/congrats":26,"../components/done-header":27,"../components/footer":28,"../components/title-input":30,"../components/todo-list.js":32,"/Users/kj/Documents/work/redeux-todos/node_modules/on-load/index.js":13,"/Users/kj/Documents/work/redeux-todos/node_modules/yo-yoify/lib/appendChild.js":20,"nanomorph":10,"sheetify/insert":15}]},{},[34]);
