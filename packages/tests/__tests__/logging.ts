import decorate from 'gentle-proxy'
import logging from 'gentle-proxy-logging'

it('does not crash (async)', async () => {
  const service = {
    async foo(a: number) {
      return 3 + a
    }
  }
  
  expect(await decorate(service, logging("service")).foo(6)).toBe(9)
})

it('does not crash', () => {
  const service = {
    foo(a: number) {
      return 3 + a
    }
  }
  
  expect(decorate(service, logging("service")).foo(6)).toBe(9)
})