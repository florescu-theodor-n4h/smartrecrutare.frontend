import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import type { Auth0VueClient } from '@auth0/auth0-vue'
import { AuthLoginService, type AuthEnvironmentConfig } from '../auth'

class FakeAuthService extends AuthLoginService {
  public readonly isAuthenticated: Ref<boolean> = ref(false)

  public async loginWithRedirect(_options?: unknown): Promise<void> {
    return
  }

  public async checkAuth(): Promise<void> {
    return
  }

  public async logout(_options?: unknown): Promise<void> {
    return
  }
}

function createAuth0ClientStub(): Auth0VueClient {
  // In acest test avem nevoie doar de campurile minime folosite de factory.
  // Auth0VueClient expune multe alte campuri, deci folosim un cast controlat.
  return {
    isAuthenticated: ref(false),
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  } as unknown as Auth0VueClient
}

describe('auth factory mode behavior', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('normalizes auth mode from VITE_PREFERRED_AUTH', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = { VITE_PREFERRED_AUTH: 'local' }

    expect(getPreferredAuthMode(config)).toBe('local')
  })

  it('falls back to misspelled VITE_PREFFERRED_AUTH when preferred is missing', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = { VITE_PREFFERRED_AUTH: 'local' }

    expect(getPreferredAuthMode(config)).toBe('local')
  })

  it('supports VITE_PREFERRED_LOGIN compatibility flag', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = { VITE_PREFERRED_LOGIN: 'local' }

    expect(getPreferredAuthMode(config)).toBe('local')
  })

  it('uses Auth0 factory in auth0 mode', async () => {
    const auth0Factory = vi.fn(() => new FakeAuthService())
    const localFactory = vi.fn(() => new FakeAuthService())

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')
    const auth0Client = createAuth0ClientStub()

    createAuthLoginService({ auth0Client, config: { VITE_PREFERRED_AUTH: 'auth0' } })

    expect(auth0Factory).toHaveBeenCalledWith(auth0Client)
    expect(localFactory).not.toHaveBeenCalled()
  })

  it('uses local factory in local mode', async () => {
    const auth0Factory = vi.fn(() => new FakeAuthService())
    const localFactory = vi.fn(() => new FakeAuthService())

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')

    createAuthLoginService({ config: { VITE_PREFERRED_AUTH: 'local' } })

    expect(localFactory).toHaveBeenCalledTimes(1)
    expect(auth0Factory).not.toHaveBeenCalled()
  })

  it('does not create Auth0 plugin in local mode', async () => {
    const auth0Factory = vi.fn(() => new FakeAuthService())
    const localFactory = vi.fn(() => new FakeAuthService())

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')

    createAuthLoginService({
      config: {
        VITE_PREFERRED_AUTH: 'local',
        VITE_DISABLE_LOCAL_LOGIN: 'false',
      },
    })

    expect(auth0Factory).not.toHaveBeenCalled()
    expect(localFactory).toHaveBeenCalledTimes(1)
  })
})
