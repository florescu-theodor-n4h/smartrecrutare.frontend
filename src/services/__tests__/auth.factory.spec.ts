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
    loginWithRedirect: vi.fn<() => Promise<void>>(),
    logout: vi.fn<() => Promise<void>>(),
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

  it('defaults to auth0 when VITE_PREFERRED_AUTH is missing', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = {}

    expect(getPreferredAuthMode(config)).toBe('auth0')
  })

  it('keeps explicit VITE_PREFERRED_AUTH as the only source of truth', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = { VITE_PREFERRED_AUTH: 'local' }

    expect(getPreferredAuthMode(config)).toBe('local')
  })

  it('builds auth config from env-like source in one place', async () => {
    const { getAuthEnvironmentConfig } = await import('../auth')
    const config = getAuthEnvironmentConfig({
      VITE_PREFERRED_AUTH: 'local',
      VITE_PREFERRED_LOGIN: 'auth0',
      VITE_DISABLE_LOCAL_LOGIN: 'true',
      VITE_REQUIRE_PAR: 'true',
      VITE_REQUIRE_JAR: 'false',
      VITE_USE_JAR_JWT_LOGIN: 'false',
    })

    expect(config).toEqual({
      VITE_PREFERRED_AUTH: 'local',
      VITE_PREFERRED_LOGIN: 'auth0',
      VITE_DISABLE_LOCAL_LOGIN: 'true',
      VITE_REQUIRE_PAR: 'true',
      VITE_REQUIRE_JAR: 'false',
      VITE_USE_JAR_JWT_LOGIN: 'false',
    })
  })

  it('keeps local mode blocked when VITE_DISABLE_LOCAL_LOGIN is true', async () => {
    const { getPreferredAuthMode } = await import('../auth')
    const config: AuthEnvironmentConfig = {
      VITE_PREFERRED_LOGIN: 'local',
      VITE_DISABLE_LOCAL_LOGIN: 'true',
    }

    expect(getPreferredAuthMode(config)).toBe('auth0')
  })

  it('strips inline comments when building auth config from env-like source', async () => {
    const { getAuthEnvironmentConfig } = await import('../auth')
    const config = getAuthEnvironmentConfig({
      VITE_PREFERRED_AUTH: 'local # or auth0',
    })

    expect(config.VITE_PREFERRED_AUTH).toBe('local')
  })

  it('uses Auth0 factory in auth0 mode', async () => {
    const auth0Factory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const localFactory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const registerAuth0Client = vi.fn()

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
      registerAuth0Client,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')
    const auth0Client = createAuth0ClientStub()
    const config: AuthEnvironmentConfig = { VITE_PREFERRED_AUTH: 'auth0' }

    createAuthLoginService({ auth0Client, config })

    expect(registerAuth0Client).toHaveBeenCalledWith(auth0Client)
    expect(auth0Factory).toHaveBeenCalledWith(auth0Client, config)
    expect(localFactory).not.toHaveBeenCalled()
  })

  it('allows jar login selection to skip Auth0 client creation', async () => {
    const auth0Factory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const localFactory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const registerAuth0Client = vi.fn()

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
      registerAuth0Client,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')

    expect(
      createAuthLoginService({
        config: {
          VITE_PREFERRED_AUTH: 'auth0',
          VITE_USE_JAR_JWT_LOGIN: 'true',
        },
      }),
    ).toBeInstanceOf(FakeAuthService)

    expect(auth0Factory).toHaveBeenCalledTimes(1)
    expect(auth0Factory).toHaveBeenCalledWith(undefined, {
      VITE_PREFERRED_AUTH: 'auth0',
      VITE_USE_JAR_JWT_LOGIN: 'true',
    })
    expect(localFactory).not.toHaveBeenCalled()
  })

  it('uses local factory in local mode', async () => {
    const auth0Factory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const localFactory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const registerAuth0Client = vi.fn()

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
      registerAuth0Client,
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
    const auth0Factory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const localFactory = vi.fn<() => AuthLoginService>(() => new FakeAuthService())
    const registerAuth0Client = vi.fn()

    vi.doMock('../auth_auth0', () => ({
      createAuthLoginPlugin: auth0Factory,
      registerAuth0Client,
    }))
    vi.doMock('../server-auth-user-pass', () => ({
      createLocalAuthLoginPlugin: localFactory,
    }))

    const { createAuthLoginService } = await import('../auth')

    createAuthLoginService({
      config: {
        VITE_PREFERRED_AUTH: 'local',
      },
    })

    expect(auth0Factory).not.toHaveBeenCalled()
    expect(localFactory).toHaveBeenCalledTimes(1)
  })
})
