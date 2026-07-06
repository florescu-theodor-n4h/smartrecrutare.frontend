// Minimal setup for Vitest (CommonJS) to ensure Symbol.metadata exists before tests start.
if (typeof Symbol.metadata === 'undefined') {
  Object.defineProperty(Symbol, 'metadata', {
    value: Symbol('Symbol.metadata'),
    writable: true,
    configurable: true,
  })
}

module.exports = {}
