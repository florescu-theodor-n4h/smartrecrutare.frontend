const EXCLUDED = new WeakMap<object, Set<PropertyKey>>()
// type DTO = Record<string, unknown>

/**
 *
 * @deprecated Use Fields
 */
function Exclude() {
  return function (target: object, key: PropertyKey) {
    let set = EXCLUDED.get(target)
    if (!set) {
      set = new Set()
      EXCLUDED.set(target, set)
    }
    set.add(key)
  }
}

export { Exclude, EXCLUDED }
