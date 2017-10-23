module.exports = function invoke(func, thisArg, args, onSuccess, onFailure) {
  try {
    const rv = Reflect.apply(func, thisArg, args)
    if (rv.then && typeof(rv.then) === "function") {
      return rv.then(onSuccess, onFailure)
    } else {
      return onSuccess(rv)
    }
  } catch (e) {
    return onFailure(e)
  }
}