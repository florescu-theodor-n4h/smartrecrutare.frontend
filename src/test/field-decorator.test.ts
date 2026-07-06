import { expect, test } from 'vitest'
import { Field, dtoMetadata } from '@/decorators/Field'

class Person {
  @Field()
  name = ''

  @Field()
  age = 0
}

test('Field decorator registers fields in dtoMetadata', () => {
  const meta = dtoMetadata.get(Person as unknown as any)
  expect(meta).toBeDefined()
  // should have both fields
  expect(meta!.has('name')).toBe(true)
  expect(meta!.has('age')).toBe(true)
})
