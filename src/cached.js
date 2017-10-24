export default function(instance, decorator) {
  const cache = {}

  return new Proxy(instance, {
    get: function (target, name) {
      if (!cache[name]) {
        cache[name] = decorator(target, name)
        cache[name].vanilla = target[name].vanilla || target[name]
      }

      return cache[name]
    }
  })
}