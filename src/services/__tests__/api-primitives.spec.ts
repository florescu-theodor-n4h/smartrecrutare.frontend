import { describe, expect, it } from 'vitest'
import { LOCAL_USER_ROLES, isLocalUserRole, withVersionParam } from '../api-primitives'

describe('api-primitives', () => {
  it('contains all supported local user roles', () => {
    expect(LOCAL_USER_ROLES).toEqual(['ADMIN', 'MANAGER', 'AUDITOR', 'GOVERNMENTAL_USER', 'USER'])
  })

  it('validates role values safely', () => {
    expect(isLocalUserRole('ADMIN')).toBe(true)
    expect(isLocalUserRole('NOT_A_ROLE')).toBe(false)
    expect(isLocalUserRole(1)).toBe(false)
  })

  it('builds optimistic version query params', () => {
    expect(withVersionParam(7)).toEqual({ params: { version: 7 } })
  })
})
