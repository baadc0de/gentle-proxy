import { ProxyGenerator, ProxySelector, Call, CallResult, ErroredCall, all } from "gentle-proxy";


const defaultLogging: Logging.Options = {
  level: "info",
  logger: console
}

function Logging(name: String, selector: ProxySelector = all, opts: Logging.Options = defaultLogging): ProxyGenerator {
  if (!opts) {
    opts = defaultLogging
  }

  const log: any           = opts.logger  || (opts.createLogger && opts.createLogger()) || console
  const sel: ProxySelector = selector     || all
  const level: string      = opts.level   || "info"

  return {
    doBefore(c: Call): Call {
      log[level].call(log, name, c.args)
      return c
    },
    doAfter(c: CallResult) {
      if (c.successful) {
        log[level].call(log, name, 'returned', c.returnValue)
      } else {
        log.error(name, 'threw', (c as ErroredCall).error)
      }
      return c
    },
    selector: sel
  }
}

namespace Logging {
  export interface Options {
    level: string;
    logger?: any;
    createLogger?: Function
  }

  export function pino(level: string = "info"): Options {
    const pino = require('pino')
    return {
      createLogger: (name: string) => pino({ name }),
      level
    }
  }
}

export = Logging