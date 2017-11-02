import Mutex from 'await-mutex'
import { ProxySelector, all, ProxyGenerator, Call, CallResult } from 'gentle-proxy'

function Synchronized(selector: ProxySelector = all): ProxyGenerator {
  const mutex = new Mutex()

  return {
    doBeforeAsync: async function (c: Call): Promise<Call> {
      c.context.unlocker = await mutex.lock()
      return c
    },
    doAfterAsync: async function (c: CallResult): Promise<CallResult> {
      c.context.unlocker()
      return c
    },
    selector
  }
}

export = Synchronized