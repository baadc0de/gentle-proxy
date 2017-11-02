import { ProxyGenerator, ProxySelector, all, Call, CallResult } from 'gentle-proxy'
import makeCircuitBreaker from 'opossum'

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 30000 // After 30 seconds, try again.
}

export = function (selector: ProxySelector = all): ProxyGenerator {
  const breakers = {}
  return {
    doBefore: function (call: Call): Call {
      if (!breakers[call.name]) {
        breakers[call.name] = (makeCircuitBreaker as Function)(call.function, options)
      }

      return {
        ...call,
        function: breakers[call.name]
      }
    },
    selector
  }
}