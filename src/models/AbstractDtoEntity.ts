import {
  type Constructor,
  serialize,
  transform,
  toCreatePayload,
  validate,
} from '@/decorators/Field'

/**
 * Clasa de baza pentru DTO-uri populate prin parse(), folosind metadata
 * inregistrata de decoratorii din Field.ts, precum @Field, @Size, @Pattern,
 * @Exclude si altii.
 *
 * Subclasele trebuie sa aiba un constructor fara argumente, deoarece parse()
 * instantiaza obiectul intern cu new this() inainte de a-i atribui campurile.
 */
export abstract class AbstractDTOEntity {
  static parse<T extends Constructor<AbstractDTOEntity> & (new () => InstanceType<T>)>(
    this: T,
    input: Record<string, unknown> | string,
  ): InstanceType<T> {
    const raw: Record<string, unknown> = typeof input === 'string' ? JSON.parse(input) : input

    const instance = new this() as InstanceType<T>
    Object.assign(instance as object, raw)

    // Toate transformarile si validatoarele declarate prin decoratori sunt
    // executate aici. validate() arunca o singura eroare agregata pentru
    // toate campurile defecte.
    validate(instance as object)

    Object.assign(instance as object, transform(instance as object))
    return instance
  }

  toJSON(): Record<string, unknown> {
    return serialize(this)
  }

  transform(): Record<string, unknown> {
    return transform(this)
  }

  toCreatePayload(): Record<string, unknown> {
    return toCreatePayload(this)
  }
}
