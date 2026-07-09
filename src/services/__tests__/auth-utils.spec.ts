import { describe, expect, it } from 'vitest'
import { normalizeAuth0Domain } from '../auth-utils'

describe('normalizeAuth0Domain', () => {
  it('removes protocol prefix and trailing slash', () => {
    expect(normalizeAuth0Domain('https://dev-example.us.auth0.com/')).toBe(
      'dev-example.us.auth0.com',
    )
  })

  it('keeps bare domain unchanged except trimming', () => {
    expect(normalizeAuth0Domain('  dev-example.us.auth0.com  ')).toBe('dev-example.us.auth0.com')
  })

  it('handles http protocol as well', () => {
    expect(normalizeAuth0Domain('http://tenant.example.com')).toBe('tenant.example.com')
  })
})