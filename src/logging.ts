import { ProxyGenerator, ProxySelector, Call, CallResult, ErroredCall, all } from "./proxy";

export interface LoggingOptions {
  level: string;
  logger: any;
  createLogger: Function | null
}

const defaultLogging: LoggingOptions = {
  level: "info",
  logger: console,
  createLogger: null
}

export default function logging(name: String = "", _selector: ProxySelector = all, p: LoggingOptions = defaultLogging): ProxyGenerator {
  if (!p) {
    p = defaultLogging
  }

  const log: any                = p.logger  || (p.createLogger && p.createLogger()) || console
  const selector: ProxySelector = _selector || all
  const level: string           = p.level   || "info"

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
    selector
  }
}
