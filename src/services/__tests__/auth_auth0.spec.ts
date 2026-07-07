import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JARJWTLogin } from '../auth_auth0'

describe('JARJWTLogin technical behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('marks unauthenticated on 401 from /auth/me', async () => {
    const login = new JARJWTLogin('http://example.test')
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 401 }))

    await login.checkAuth()

    expect(fetchSpy).toHaveBeenCalledWith('http://example.test/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    expect(login.isAuthenticated.value).toBe(false)
  })

  it('marks authenticated when /auth/me returns authenticated=true', async () => {
    const login = new JARJWTLogin('http://example.test')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await login.checkAuth()

    expect(login.isAuthenticated.value).toBe(true)
  })

  it('throws for non-401 non-2xx auth response', async () => {
    const login = new JARJWTLogin('http://example.test')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }))

    await expect(login.checkAuth()).rejects.toThrow('Failed to check authentication: 500')
    expect(login.isAuthenticated.value).toBe(false)
  })

  it('logout keeps frontend state false even if network fails', async () => {
    const login = new JARJWTLogin('http://example.test')
    login.isAuthenticated.value = true

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))

    await login.logout()

    expect(login.isAuthenticated.value).toBe(false)
  })
})
