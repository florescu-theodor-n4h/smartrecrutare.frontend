import { expect, test } from 'vitest'
import { dtoMetadata, type Constructor, type DtoFieldDecorator } from '@/decorators/Field'

const noOpDecorator: DtoFieldDecorator = () => {
  // Decorator de test folosit doar pentru a forta emiterea metadatelor de clasa.
}

class RegistryDto {
  @noOpDecorator
  a = ''
}

// This test ensures the registry can read metadata immediately after class def
// even if other decorators are present.
test('registry reads Class[Symbol.metadata] for decorated classes', () => {
  const meta = dtoMetadata.get(RegistryDto as Constructor)
  // metadata object exists (may be empty map)
  expect(meta).toBeDefined()
})
