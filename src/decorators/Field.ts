type TransformFn<T = unknown, R = unknown> = (value: T) => R
type ValidatorFn<T = unknown> = (value: T) => string | null

interface FieldMeta<T = unknown> {
  key: string
  transform?: TransformFn<unknown, T>
  validators?: ValidatorFn<T>[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T

const dtoMetadata = new Map<Constructor, Map<string, FieldMeta>>()

/**
 * Decorator de proprietate care inregistreaza un camp pentru parsare
 * si validare automata in `AbstractDtoEntity.parse()`.
 *
 * @template T - Tipul final al campului, dupa aplicarea `transform`.
 *
 * @example
 * ```typescript
 * class UserDto extends AbstractDtoEntity {
 *   @Field<Date>({
 *     transform: (v) => new Date(v as string),
 *     validators: [(v) => (isNaN(v.getTime()) ? 'invalid date' : null)],
 *   })
 *   birthDate!: Date
 * }
 * ```
 */
function Field<T = unknown>(
  options: {
    transform?: TransformFn<unknown, T>
    validators?: ValidatorFn<T>[]
  } = {},
) {
  return function (target: object, propertyKey: string): void {
    const ctor = target.constructor as Constructor

    if (!dtoMetadata.has(ctor)) {
      dtoMetadata.set(ctor, new Map())
    }

    dtoMetadata.get(ctor)!.set(propertyKey, {
      key: propertyKey,
      transform: options.transform,
      validators: options.validators,
    })
  }
}

/**
 * Eroare aruncata de `AbstractDtoEntity.parse()` cand unul sau mai
 * multe campuri esueaza la transformare sau validare.
 */
class ParseError extends Error {
  constructor(public issues: Record<string, string>) {
    super('DTO validation failed')
  }
}

export { ParseError, Field, dtoMetadata, type Constructor, type FieldMeta }
