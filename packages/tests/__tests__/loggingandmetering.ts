import decorate from 'gentle-proxy'
import metering from 'gentle-proxy-metering'
import logging from 'gentle-proxy-logging'

it('does not crash (async)', async () => {
  const service = {
    async foo(a: number) {
      return 3 + a
    }
  }
  
  expect(await decorate(service, metering("service_async2"), logging("log2")).foo(6)).toBe(9)
})

it('does not crash', () => {
  const service = {
    foo(a: number) {
      return 3 + a
    }
  }
  
  expect(decorate(service, metering("service2"), logging("log2")).foo(6)).toBe(9)
})