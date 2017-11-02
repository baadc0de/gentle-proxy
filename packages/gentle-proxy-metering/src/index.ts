import { ProxyGenerator, ProxySelector, Call, CallResult, ErroredCall, all } from 'gentle-proxy'
import { Histogram, Registry, register } from 'prom-client'

const defaultOptions: Metering.Options = {
  registers: [register]
}

function Metering(name: string, selector: ProxySelector = all, options: Metering.Options = defaultOptions): ProxyGenerator {
  const { help } = options

  return {
    prepareContext: function (instance, props, context) {
      (context as any).histogram = new Histogram({ name, help: help || name, labelNames: ['function'], registers: options.registers })
    },
    doBefore: function (call: Call): Call {
      call.context.stopMetering = call.context.histogram.startTimer({ function: call.name })
      return call
    },
    doAfter: function (call: CallResult): CallResult {
      call.context.stopMetering()
      return call
    },
    selector
  }
}

namespace Metering {
  export interface Options {
    help?: string,
    registers?: Registry[]
  }
}

export default Metering