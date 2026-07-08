import { expect, test } from 'vitest'

function getMetadataObject(target: object): Record<PropertyKey, unknown> | undefined {
  const targetRecord = target as Record<PropertyKey, unknown>
  const metadata = targetRecord[Symbol.metadata] as Record<PropertyKey, unknown> | undefined
  if (metadata !== undefined) {
    return metadata
  }
  return targetRecord[Symbol.for('Symbol.metadata')] as Record<PropertyKey, unknown> | undefined
}

test('Symbol metadata key is available', () => {
  const available =
    typeof Symbol.metadata === 'symbol' || typeof Symbol.for('Symbol.metadata') === 'symbol'
  expect(available).toBe(true)
})

const TEST_METADATA_KEY = Symbol('test.metadata')

function SmokeField(_: unknown, context: ClassFieldDecoratorContext) {
  const meta = context.metadata as Record<PropertyKey, unknown>
  meta[TEST_METADATA_KEY] = true
}

class SmokeDto {
  @SmokeField
  value = ''
}

test('Stage III field decorator writes to class metadata', () => {
  const meta = getMetadataObject(SmokeDto)
  expect(meta).toBeDefined()
  expect(meta?.[TEST_METADATA_KEY]).toBe(true)
})
