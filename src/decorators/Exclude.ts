import { createFieldDecorator, ExcludeAnnotation, Exclude } from '@/decorators/Field'
import type { DtoFieldDecorator } from '@/decorators/Field'

//const EXCLUDED = new WeakMap<object, Set<PropertyKey>>()
// type DTO = Record<string, unknown>

/**
 *
 * @deprecated Use Fields
 */
/*function Exclude() {
  return function (target: object, key: PropertyKey) {
    let set = EXCLUDED.get(target)
    if (!set) {
      set = new Set()
      EXCLUDED.set(target, set)
    }
    set.add(key)
  }
}*/

function OldExcludeField(): DtoFieldDecorator {
  return createFieldDecorator(() => new ExcludeAnnotation())
}

export { OldExcludeField as OldExclude, OldExcludeField, Exclude }
