import { ref, type Ref } from 'vue'
import { clearHttpAuthBearerToken, httpClient, setHttpAuthBearerToken } from './httpClient'
import { AuthLoginService } from './auth.contract'
import { authBanner, authError, authLog, authWarn } from './auth-debug'
import type { AuditFields, LocalUserRole, VersionFields } from './api-primitives'

type LocalAuthUser = AuditFields &
  VersionFields & {
    id: number
    username: string
    email: string
    enabled: boolean
    locked: boolean
    roles: LocalUserRole[]
    managedEmployerIds: number[]
    lastLoginAt: string | null
  }

type LocalLoginRequest = {
  username: string
  password: string
}

type LocalLoginResponse = {
  tokenType: string
  accessToken: string
  expiresAt: string
  user: LocalAuthUser
}

type LocalMeResponse = {
  user?: LocalAuthUser
  authenticated?: boolean
  tokenType?: string
  accessToken?: string
}

type LocalAuthServiceConfig = {
  localLoginPath: string
  localMePath: string
}

const DEFAULT_LOCAL_AUTH_CONFIG: LocalAuthServiceConfig = {
  localLoginPath: '/auth/local/login',
  localMePath: '/auth/local/me',
}

function isLocalLoginRequest(options: unknown): options is LocalLoginRequest {
  if (typeof options !== 'object' || options === null) {
    return false
  }

  const candidate = options as Partial<LocalLoginRequest>

  return typeof candidate.username === 'string' && typeof candidate.password === 'string'
}

class ServerAuthUserPassLogin extends AuthLoginService {
  public readonly isAuthenticated: Ref<boolean> = ref(false)

  private readonly config: LocalAuthServiceConfig

  public constructor(config?: Partial<LocalAuthServiceConfig>) {
    super()
    this.config = {
      ...DEFAULT_LOCAL_AUTH_CONFIG,
      ...config,
    }

    authBanner('ServerAuthUserPassLogin initialized', {
      localLoginPath: this.config.localLoginPath,
      localMePath: this.config.localMePath,
    })
  }

  public async loginWithRedirect(options?: unknown): Promise<void> {
    authLog('ServerAuthUserPassLogin.loginWithRedirect called', {
      hasOptions: options !== undefined,
    })

    if (!isLocalLoginRequest(options)) {
      authError('ServerAuthUserPassLogin.loginWithRedirect missing username/password payload')
      throw new Error('Local login requires username and password')
    }

    authBanner('ServerAuthUserPassLogin.loginWithRedirect accepted credentials payload', {
      username: options.username,
    })
    await this.loginWithCredentials(options)
  }

  public async loginWithCredentials(credentials: LocalLoginRequest): Promise<void> {
    authLog('ServerAuthUserPassLogin.loginWithCredentials started', {
      username: credentials.username,
      endpoint: this.config.localLoginPath,
    })

    const response = await httpClient.post<LocalLoginResponse>(
      this.config.localLoginPath,
      credentials,
    )
    const tokenType = response.data.tokenType?.trim() || 'Bearer'
    const accessToken = response.data.accessToken
    const normalizedToken =
      tokenType.toLowerCase() === 'bearer' ? accessToken : `${tokenType} ${accessToken}`

    setHttpAuthBearerToken(normalizedToken)
    this.isAuthenticated.value = true
    authBanner('ServerAuthUserPassLogin.loginWithCredentials completed', {
      username: credentials.username,
      isAuthenticated: this.isAuthenticated.value,
      tokenType,
    })
  }

  public async checkAuth(): Promise<void> {
    authLog('ServerAuthUserPassLogin.checkAuth started', {
      endpoint: this.config.localMePath,
    })

    try {
      const response = await httpClient.get<LocalMeResponse>(this.config.localMePath)
      const accessToken = response.data.accessToken?.trim()

      if (accessToken) {
        setHttpAuthBearerToken(accessToken)
      }

      this.isAuthenticated.value = response.data.authenticated ?? Boolean(response.data.user)
      authBanner('ServerAuthUserPassLogin.checkAuth completed', {
        isAuthenticated: this.isAuthenticated.value,
      })
    } catch {
      clearHttpAuthBearerToken()
      this.isAuthenticated.value = false
      authWarn('ServerAuthUserPassLogin.checkAuth failed; cleared token and marked unauthenticated')
    }
  }

  public async logout(_options?: unknown): Promise<void> {
    authBanner('ServerAuthUserPassLogin.logout called')
    clearHttpAuthBearerToken()
    this.isAuthenticated.value = false
    authLog('ServerAuthUserPassLogin.logout completed')
  }
}

function createLocalAuthLoginPlugin(): AuthLoginService {
  return new ServerAuthUserPassLogin()
}

export type {
  LocalAuthServiceConfig,
  LocalAuthUser,
  LocalLoginRequest,
  LocalLoginResponse,
  LocalMeResponse,
}
export { ServerAuthUserPassLogin, createLocalAuthLoginPlugin }
