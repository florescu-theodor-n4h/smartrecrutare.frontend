import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  clearHttpAuthBearerToken,
  getHttpAuthBearerToken,
  httpClient,
  setHttpAuthBearerToken,
} from '../httpClient'
import { ServerAuthUserPassLogin, type LocalAuthUser } from '../server-auth-user-pass'
import { useAuthSessionStore } from '@/stores/auth.store'

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
    setActivePinia(createPinia())
  })

  it('reuses hydrated Pinia auth state when the session store is already authenticated', () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.setAuthenticated(true)

    const login = new ServerAuthUserPassLogin()

    expect(login.isAuthenticated.value).toBe(true)
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

  it('posts register request to /auth/local/register', async () => {
    const login = new ServerAuthUserPassLogin()
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        tokenType: 'Bearer',
        accessToken: 'test-register-token',
        expiresAt: '2026-01-01T00:00:00Z',
        user: createLocalUser(),
      },
    } as never)

    await login.register({
      username: 'local-user',
      email: 'local@example.test',
      password: 'secret',
    })

    expect(postSpy).toHaveBeenCalledWith('/auth/local/register', {
      username: 'local-user',
      email: 'local@example.test',
      password: 'secret',
    })
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

  it('fails when login payload does not include username and password', async () => {
    const login = new ServerAuthUserPassLogin()

    await expect(login.loginWithRedirect()).rejects.toThrow(
      'Local login requires username and password',
    )
  })

  it('clears token and marks unauthenticated when /auth/local/me fails', async () => {
    const login = new ServerAuthUserPassLogin()
    setHttpAuthBearerToken('token-before-check')
    vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('network down'))

    await login.checkAuth()

    expect(login.isAuthenticated.value).toBe(false)
    expect(getHttpAuthBearerToken()).toBeNull()
  })

  it('logout clears token and state', async () => {
    const login = new ServerAuthUserPassLogin()
    vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        tokenType: 'Bearer',
        accessToken: 'token-for-logout-test',
        expiresAt: '2026-01-01T00:00:00Z',
        user: createLocalUser(),
      },
    } as never)

    await login.loginWithRedirect({ username: 'local-user', password: 'secret' })
    expect(getHttpAuthBearerToken()).toBe('token-for-logout-test')

    await login.logout()

    expect(login.isAuthenticated.value).toBe(false)
    expect(getHttpAuthBearerToken()).toBeNull()
  })
})
