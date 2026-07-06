// src/polyfills/symbol-metadata.ts

// Works with old, mid, and new TypeScript.
// Runtime-only polyfill. No global type declaration needed.

const SymbolConstructor = Symbol as SymbolConstructor & {
  metadata?: symbol
}

if (!('metadata' in SymbolConstructor)) {
  Object.defineProperty(SymbolConstructor, 'metadata', {
    value: Symbol('Symbol.metadata'),
    writable: false,
    enumerable: false,
    configurable: false,
  })
}

export {}
