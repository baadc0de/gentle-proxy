/* declarative proxy stuff */

export type ProxySelector = (name: PropertyKey) => boolean

export function all(): boolean {
  return true
}

export function just(...keys: Array<String>): ProxySelector {
  return function (key: PropertyKey) {
    for (var k of keys) {
      if (k === key) {
        return true
      }
    }
    return false
  }
}

export function except(...keys: Array<PropertyKey>): ProxySelector {
  return function (key: PropertyKey) {
    for (var k of keys) {
      if (k === key) {
        return false
      }
    }
    return true
  }
}

export interface Call {
  vanillaFunction: Function
  function: Function
  thisArg: any
  args: Array<any>
  context: {[id: string]: any}
}

export interface ReturnedCall extends Call {
  successful: true
  returnValue: any
}

export interface ErroredCall extends Call {
  successful: false
  error: Error
}

export type CallResult = ReturnedCall | ErroredCall

export interface ProxyGenerator {
  doBefore?(call: Call): Call
  doAfter?(call: CallResult): CallResult
  doBeforeAsync?(call: Call): Promise<Call>
  doAfterAsync?(call: CallResult): Promise<CallResult>
  mayInvoke?(call: Call): Boolean
  mayInvokeAsync?(call: Call): Promise<Boolean>

  selector: ProxySelector
}

function decorateSingleAsync(src: Function, gen: ProxyGenerator): Function {
  const rv: any = async function (this: any, ...args: any[]) {
    var c: Call = {
      args, 
      context: {}, 
      function: src, 
      vanillaFunction: (src as any).vanilla || src,
      thisArg: this
    }

    if (gen.doBefore) {
      c = gen.doBefore(c)
    }
    if (gen.doBeforeAsync) {
      c = await gen.doBeforeAsync(c)
    }
    var rv: CallResult | null = null

    try {
      rv = {
        ...c,
        successful: true,
        returnValue: await c.function.apply(c.thisArg, args)
      }
    } catch (e) {
      rv = {
        ...c,
        successful: false,
        error: e
      }
    }

    if (gen.doAfter) {
      rv = gen.doAfter(rv)
    }
    if (gen.doAfterAsync) {
      rv = await gen.doAfterAsync(rv)
    }

    if (rv.successful) {
      return rv.returnValue
    } else {
      throw (rv as ErroredCall).error
    }
  }

  rv.vanilla = (src as any).vanilla || src
  return rv
}

export function isThenable(a: any): boolean {
  return !!(a && typeof a === "object" && a.then && typeof a.then === "function")
}

function executeCallResult(r: CallResult): any {
  if (r.successful) {
    return r.returnValue
  } else {
    throw (r as any).error
  }
}

function decorateSingle(src: Function, gen: ProxyGenerator): Function {
  if (gen.doAfterAsync || gen.doBeforeAsync) {
    return decorateSingleAsync(src, gen)
  }

  const rv: any = function (this: any, ...args: any[]) {
    var c: Call = {
      args,
      context: {},
      function: src,
      vanillaFunction: (src as any).vanilla || src,
      thisArg: this
    }

    if (gen.doBefore) {
      c = gen.doBefore(c)
    }

    var rv: CallResult;

    try {
      rv = {
        ...c,
        successful: true, 
        returnValue: c.function.apply(c.thisArg, c.args)
      }
    } catch (e) {
      rv = {
        ...c,
        successful: false,
        error: e
      }
    }
    
    if (gen.doAfter) {
      /* handle thenable */
      if (rv.successful && isThenable(rv.returnValue)) {
        rv.returnValue = rv.returnValue.then(
          function (xrv: any) {
            if (gen.doAfter) {
              var rv2 = gen.doAfter({ ...rv, successful: true, returnValue: xrv } as CallResult)
              return executeCallResult(rv2)
            } else {
              throw new Error('Internal error: doAfter disappeared over async boundary')
            }
          },
          function (err: Error) {
            if (gen.doAfter) {
              var rv2 = gen.doAfter({ ...rv, successful: false, error: err } as CallResult)
              return executeCallResult(rv2)
            } else {
              throw new Error('Internal error: doAfter disappeared over async boundary')
            }
          }
        )
      } else {
        rv = gen.doAfter(rv)
      }
    }

    return executeCallResult(rv)
  }

  rv.vanilla = (src as any).vanilla || src
  return rv
}

export default function decorate<T extends { [id: string]: any }>(target: T, ...generators: Array<ProxyGenerator>): T {
  const cache: { [id: string]: Function } = {}

  return new Proxy<T>(target, {
    get: function (target: T, p: PropertyKey, receiver: any): any {
      if (typeof target[p] !== "function") {
        return target[p]
      }

      if (!cache[p]) {
        var current = target[p]
        for (var generator of generators) {
          if (generator.selector(p)) {
            current = decorateSingle(current, generator)
          }
        }

        cache[p] = current
      }
      
      return cache[p]
    }
  })
}