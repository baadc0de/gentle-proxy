const zipObject = require('lodash.zipobject')
const getParameterNames = require('get-parameter-names')

const cached = require('./cached')
const invoke = require('./invoke')

function getPino(name) {
  return require('pino')({name})
}

function defaultExtract(name, args) {
  return args
}

module.exports = function withLogging(instance, name, _opts = {}) {
  const opts = {makeLogger: getPino, level: 'debug', extract: defaultExtract, ..._opts}
  const log  = opts.log || opts.makeLogger(name)

  return cached(instance, function (target, name) {
    return new Proxy(target[name], {
      apply: function (target, thisArg, args) {
        const callArgs = args
        const names = getParameterNames(target.vanilla || target)
        if (names.length < args.length) {
          const vararg = args.slice(names.length)
          args = args.slice(0, names.length - 1).push(vararg)
        }
        
        log[opts.level].call(log, name, "called with:", zipObject(names, args))

        return invoke(target, thisArg, callArgs, onSuccess, onFailure)

        function onSuccess(rv) {
          log[opts.level].call(log, name, "returned:", rv)
          return rv
        }

        function onFailure(e) {
          log[opts.level].call(log, name, "threw:", e)
          throw e
        }
      }
    })
  })
}