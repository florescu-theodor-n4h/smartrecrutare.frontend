/**
 * Clasa de baza pentru DTO-uri populate prin `parse()`, folosind
 * metadata inregistrata de decoratorul `@Field`.
 *
 * Subclasele trebuie sa aiba un constructor fara argumente, deoarece
 * `parse()` instantiaza obiectul intern cu `new this()` inainte de
 * a-i atribui campurile.
 */
abstract class AbstractFieldedEntity {
  static parse<T extends Constructor<AbstractFieldedEntity> & (new () => InstanceType<T>)>(
    this: T,
    input: Record<string, unknown> | string,
  ): InstanceType<T> {
    const raw: Record<string, unknown> = typeof input === 'string' ? JSON.parse(input) : input

    const instance = new this()
    const meta = dtoMetadata.get(this)
    const errors: Record<string, string> = {}

    if (!meta) {
      Object.assign(instance, raw)
      return instance
    }

    for (const [key, field] of meta.entries()) {
      let value = raw[key]

      if (field.transform) {
        try {
          value = field.transform(value)
        } catch (e) {
          errors[key] = `transform failed: ${(e as Error).message}`
          continue
        }
      }

      if (field.validators) {
        for (const validate of field.validators) {
          const result = validate(value)
          if (result) {
            errors[key] = result
            break
          }
        }
      }

      ;(instance as Record<string, unknown>)[key] = value
    }

    if (Object.keys(errors).length > 0) {
      throw new ParseError(errors)
    }

    return instance
  }
}
