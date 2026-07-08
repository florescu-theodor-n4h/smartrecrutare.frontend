import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearHttpAuthBearerToken, getHttpAuthBearerToken, httpClient } from '../httpClient'
import { ServerAuthUserPassLogin, type LocalAuthUser } from '../server-auth-user-pass'

function createLocalUser(): LocalAuthUser {
  return {
    id: 1,
    username: 'user.local',
    email: 'user.local@example.test',
    enabled: true,
    locked: false,
    roles: ['ADMIN'],
    managedEmployerIds: [1],
    lastLoginAt: null,
    creatLa: null,
    creatDe: null,
    modificatLa: null,
    modificatDe: null,
    versiune: 1,
  }
}

describe('ServerAuthUserPassLogin integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearHttpAuthBearerToken()
  })

  it('posts login request to /auth/local/login', async () => {
    const login = new ServerAuthUserPassLogin()
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        tokenType: 'Bearer',
        accessToken: 'test-token',
        expiresAt: '2026-01-01T00:00:00Z',
        user: createLocalUser(),
      },
    } as never)

    await login.loginWithRedirect({ username: 'local-user', password: 'secret' })

    expect(postSpy).toHaveBeenCalledWith('/auth/local/login', {
      username: 'local-user',
      password: 'secret',
    })
    expect(getHttpAuthBearerToken()).toBe('test-token')
  })

  it('checks identity on /auth/local/me', async () => {
    const login = new ServerAuthUserPassLogin()
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({
      data: {
        authenticated: true,
        user: createLocalUser(),
      },
    } as never)

    await login.checkAuth()

    expect(getSpy).toHaveBeenCalledWith('/auth/local/me')
    expect(login.isAuthenticated.value).toBe(true)
  })
})
