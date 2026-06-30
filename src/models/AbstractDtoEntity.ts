import { EXCLUDED } from '@/decorators/Exclude'

/**
 * Clasa de baza pentru entitatile care trebuie convertite intr-un DTO
 * (Data Transfer Object), eliminand automat campurile marcate cu `@Exclude`.
 *
 * Utila in special pentru a evita expunerea campurilor sensibile
 * (parole, token-uri etc.) in raspunsurile trimise catre client.
 *
 * @example
 * ```typescript
 * class UserEntity extends AbstractDtoEntity {
 *   id: number
 *   email: string
 *
 *   @Exclude()
 *   passwordHash: string
 *
 *   constructor(id: number, email: string, passwordHash: string) {
 *     super()
 *     this.id = id
 *     this.email = email
 *     this.passwordHash = passwordHash
 *   }
 * }
 *
 * const dto = new UserEntity(1, 'test@test.com', 'hash').toDTO()
 * // dto = { id: 1, email: 'test@test.com' }
 * ```
 */
export abstract class AbstractDtoEntity {
  /**
   * Returneaza o copie a entitatii curente sub forma de obiect simplu,
   * fara campurile marcate ca excluse.
   *
   * @template T - Forma asteptata a obiectului rezultat.
   * @returns {T} Obiectul DTO rezultat.
   */
  toDTO<T extends Record<string, unknown>>(): T {
    const excluded = this.getExcludedKeys()
    const dto: Record<PropertyKey, unknown> = {}

    for (const key of Object.keys(this) as Array<keyof this>) {
      if (!excluded.has(key as PropertyKey)) {
        dto[key as string] = this[key]
      }
    }

    return dto as T
  }

  /**
   * Aduna cheile excluse pentru clasa curenta si pentru toate clasele
   * parinte, deoarece `@Exclude` inregistreaza cheile pe prototipul
   * exact unde a fost folosit decoratorul.
   *
   * @returns {Set<PropertyKey>} Toate cheile excluse din lantul de mostenire.
   */
  private getExcludedKeys(): Set<PropertyKey> {
    const excluded = new Set<PropertyKey>()
    let proto = Object.getPrototypeOf(this)

    while (proto && proto !== Object.prototype) {
      const protoExcluded = EXCLUDED.get(proto)
      if (protoExcluded) {
        for (const key of protoExcluded) {
          excluded.add(key)
        }
      }
      proto = Object.getPrototypeOf(proto)
    }

    return excluded
  }
}
