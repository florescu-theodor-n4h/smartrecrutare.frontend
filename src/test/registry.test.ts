import { expect, test } from 'vitest'
import { dtoMetadata } from '@/decorators/Field'

class RegistryDto {
  @((() => {}) as any) // placeholder no-op decorator
  a = ''
}

// This test ensures the registry can read metadata immediately after class def
// even if other decorators are present.
test('registry reads Class[Symbol.metadata] for decorated classes', () => {
  const meta = dtoMetadata.get(RegistryDto as unknown as any)
  // metadata object exists (may be empty map)
  expect(meta).toBeDefined()
})
