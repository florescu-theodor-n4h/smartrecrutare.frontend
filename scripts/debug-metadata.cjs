const babel = require('@babel/core')
const vm = require('vm')

const source = `
const TEST_METADATA_KEY = Symbol('test.metadata')
function SmokeField(_, context) {
  context.metadata[TEST_METADATA_KEY] = true
}

class SmokeDto {
  @SmokeField
  value = ''
}

console.log('runtime Symbol.metadata:', typeof Symbol.metadata, Symbol.metadata)
console.log('class symbols:', Object.getOwnPropertySymbols(SmokeDto))
console.log('class meta current:', SmokeDto[Symbol.metadata])
console.log('class meta fallback:', SmokeDto[Symbol.for('Symbol.metadata')])
console.log('has current metadata:', !!SmokeDto[Symbol.metadata])
console.log('has fallback metadata:', !!SmokeDto[Symbol.for('Symbol.metadata')])
console.log('metadata key current:', SmokeDto[Symbol.metadata]?.[TEST_METADATA_KEY])
console.log('metadata key fallback:', SmokeDto[Symbol.for('Symbol.metadata')]?.[TEST_METADATA_KEY])
`

const result = babel.transformSync(source, {
  filename: 'debug-metadata.ts',
  configFile: true,
  babelrc: false,
})

console.log('--- transformed code ---')
console.log(result.code)
console.log('--- running transformed code ---')

const context = vm.createContext({ console, Symbol })
new vm.Script(result.code, { filename: 'debug-metadata.ts' }).runInContext(context)
