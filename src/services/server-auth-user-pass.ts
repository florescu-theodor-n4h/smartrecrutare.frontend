import { ref, type Ref } from 'vue'
import { clearHttpAuthBearerToken, httpClient, setHttpAuthBearerToken } from './httpClient'
import { AuthLoginService } from './auth.contract'

type LocalAuthRole = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'GOVERNMENTAL_USER' | 'USER'

type LocalAuthUser = {
  id: number
  username: string
  email: string
  enabled: boolean
  locked: boolean
  roles: LocalAuthRole[]
  managedEmployerIds: number[]
  lastLoginAt: string | null
  creatLa: string | null
  creatDe: string | null
  modificatLa: string | null
  modificatDe: string | null
  versiune: number
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
  }

  public async loginWithRedirect(options?: unknown): Promise<void> {
    if (!isLocalLoginRequest(options)) {
      throw new Error('Local login requires username and password')
    }

    await this.loginWithCredentials(options)
  }

  public async loginWithCredentials(credentials: LocalLoginRequest): Promise<void> {
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
  }

  public async checkAuth(): Promise<void> {
    try {
      const response = await httpClient.get<LocalMeResponse>(this.config.localMePath)
      const accessToken = response.data.accessToken?.trim()

      if (accessToken) {
        setHttpAuthBearerToken(accessToken)
      }

      this.isAuthenticated.value = response.data.authenticated ?? Boolean(response.data.user)
    } catch {
      clearHttpAuthBearerToken()
      this.isAuthenticated.value = false
    }
  }

  public async logout(_options?: unknown): Promise<void> {
    clearHttpAuthBearerToken()
    this.isAuthenticated.value = false
  }
}

function createLocalAuthLoginPlugin(): AuthLoginService {
  return new ServerAuthUserPassLogin()
}

export type {
  LocalAuthRole,
  LocalAuthServiceConfig,
  LocalAuthUser,
  LocalLoginRequest,
  LocalLoginResponse,
  LocalMeResponse,
}
export { ServerAuthUserPassLogin, createLocalAuthLoginPlugin }
