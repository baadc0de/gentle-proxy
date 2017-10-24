const gently = require('../dist')
const instance = {
	f(x) { return x + 3}
}

gently.withLogging(instance, 'test', {level: 'info'}).f(5)
