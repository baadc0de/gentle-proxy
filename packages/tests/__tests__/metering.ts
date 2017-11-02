import decorate from 'gentle-proxy'
import metering from 'gentle-proxy-metering'

it('does not crash (async)', async () => {
  const service = {
    async foo(a: number) {
      return 3 + a
    }
  }
  
  expect(await decorate(service, metering("service_async")).foo(6)).toBe(9)
})

it('does not crash', () => {
  const service = {
    foo(a: number) {
      return 3 + a
    }
  }
  
  expect(decorate(service, metering("service")).foo(6)).toBe(9)
})