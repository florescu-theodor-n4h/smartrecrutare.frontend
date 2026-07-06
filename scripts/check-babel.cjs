const babel = require('@babel/core')

const sample = `
const TEST_METADATA_KEY = Symbol('test');
class SmokeDto {
  @(() => {
    return function (value, context) {
      context.metadata[TEST_METADATA_KEY] = true
    }
  })
  name
}
`

try {
  const result = babel.transformSync(sample, {
    filename: 'test.ts',
    configFile: true,
    babelrc: false,
  })

  if (!result) {
    console.error('No transform result')
    process.exit(2)
  }

  console.log('--- Transformed code ---')
  console.log(result.code)
  console.log('--- End transformed code ---')

  const hasSymbolMetadata = /Symbol\.metadata/.test(result.code)
  const hasContextMetadata = /context\.metadata/.test(result.code)
  console.log('HAS Symbol.metadata:', hasSymbolMetadata)
  console.log('HAS context.metadata:', hasContextMetadata)

  process.exit(hasSymbolMetadata || hasContextMetadata ? 0 : 3)
} catch (err) {
  console.error('Babel transform failed:', err)
  process.exit(1)
}
