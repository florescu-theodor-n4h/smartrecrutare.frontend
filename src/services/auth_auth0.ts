import { ref, toRef, type Ref } from 'vue'
import { AuthLoginService } from './auth.contract'
import { authBanner, authError, authLog, authWarn } from './auth-debug'
import type { Auth0VueClient } from '@auth0/auth0-vue'
import { useAuthSessionStoreSafely } from '@/stores/auth.store'

type LogoutOptions = {
  logoutParams?: {
    returnTo?: string
  }
}

type AuthPluginEnvironmentConfig = {
  VITE_REQUIRE_JAR?: string
  VITE_USE_JAR_JWT_LOGIN?: string
}

function sanitizeEnvValue(value?: string): string {
  return (value || '')
    .replace(/\s+#.*$/, '')
    .trim()
    .toLowerCase()
}

function isTrueFlag(value?: string): boolean {
  return sanitizeEnvValue(value) === 'true'
}

function shouldUseJarJwtLogin(config?: AuthPluginEnvironmentConfig): boolean {
  if (!config) {
    return false
  }

  return isTrueFlag(config.VITE_USE_JAR_JWT_LOGIN) || isTrueFlag(config.VITE_REQUIRE_JAR)
}

function extractLogoutReturnTo(options: unknown): string | null {
  if (!options || typeof options !== 'object') {
    return null
  }
  const maybeOptions = options as LogoutOptions
  const maybeReturnTo = maybeOptions.logoutParams?.returnTo

  return typeof maybeReturnTo === 'string' && maybeReturnTo.trim().length > 0 ? maybeReturnTo : null
}

/**
 * Creaza un plugin de autentificare pentru Vue, alegand implementarea potrivita
 * @param auth0 - Clientul Auth0 Vue, daca se foloseste Auth0 SPA
 * @param config - Variabilele de mediu relevante pentru selectia implementarii
 * @returns   {AuthLoginService} Instanta a serviciului de autentificare ales
 */
function createAuthLoginPlugin(
  auth0: Auth0VueClient | undefined,
  config?: AuthPluginEnvironmentConfig,
): AuthLoginService {
  if (shouldUseJarJwtLogin(config)) {
    authBanner('Auth login plugin factory selected JAR/JWT implementation', {
      useJarJwtLogin: config?.VITE_USE_JAR_JWT_LOGIN,
      requireJar: config?.VITE_REQUIRE_JAR,
    })
    return new JARJWTLogin()
  }

  if (!auth0) {
    authError('Auth login plugin factory selected Auth0 SPA but no Auth0 client was provided')
    throw new Error('Auth0 client is required when Auth0 SPA login is selected')
  }

  authBanner('Auth login plugin factory selected Auth0 SPA implementation', {
    useJarJwtLogin: config?.VITE_USE_JAR_JWT_LOGIN,
    requireJar: config?.VITE_REQUIRE_JAR,
  })
  return new AuthSPAService(auth0)
}

abstract class AbstractAuthAuth0Service extends AuthLoginService {
  protected readonly authSessionStore = useAuthSessionStoreSafely()

  public readonly isAuthenticated: Ref<boolean>

  protected constructor(protected readonly auth0Client?: Auth0VueClient) {
    super()

    if (this.authSessionStore) {
      this.isAuthenticated = toRef(this.authSessionStore, 'isAuthenticated')
      this.authSessionStore.hydrate()
    } else if (auth0Client) {
      this.isAuthenticated = auth0Client.isAuthenticated
    } else {
      this.isAuthenticated = ref(false)
    }
  }

  protected persistAuthState(isAuthenticated: boolean): void {
    this.saveLoginStatus(isAuthenticated)
  }

  public override getDisclaimer(): string {
    return this.authSessionStore?.disclaimer ?? ''
  }

  public override isLocalPiniaSaveable(): boolean {
    return true
  }
}

/**
 * Implementare a serviciului de autentificare pentru Auth0 SPA (Single Page Application).
 *
 * Aceasta clasa integreaza SDK-ul Auth0 Vue pentru a gestiona autentificarea
 * utilizatorilor intr-o aplicatie single page folosind protocolul OAuth2/OIDC.
 */
class AuthSPAService extends AbstractAuthAuth0Service {
  /**
   * Construieste o instanta de AuthSPAService.
   *
   * @param {Auth0VueClient} auth0 - Clientul Auth0 Vue configurat
   */
  public constructor(auth0: Auth0VueClient) {
    super(auth0)
    this.persistAuthState(auth0.isAuthenticated.value)
    authBanner('AuthSPAService initialized', {
      initialIsAuthenticated: this.isAuthenticated.value,
    })
  }

  /**
   * Redirecrioneaza utilizatorul catre pagina de logare Auth0.
   *
   * @param {unknown} options - Optiuni specifice Auth0 pentru procesul de logare
   * @returns {Promise<void>} Promisiune care se rezolva cand redirectarea este initiata
   */
  public async loginWithRedirect(options?: unknown): Promise<void> {
    authBanner('AuthSPAService.loginWithRedirect called', { hasOptions: options !== undefined })
    await this.auth0Client?.loginWithRedirect(options as never)
  }

  /**
   * Verifica starea de autentificare cu Auth0.
   *
   * Auth0 Vue SDK se ocupa automat de aceasta, deci nu este necesara
   * nicio verificare suplimentara din partea noastra.
   *
   * @returns {Promise<void>} Promisiune care se rezolva imediat
   */
  public async checkAuth(): Promise<void> {
    // Auth0 Vue SDK maintains this ref itself.
    // Nothing extra is needed here.
    authLog('AuthSPAService.checkAuth noop executed (managed by Auth0 SDK)', {
      isAuthenticated: this.isAuthenticated.value,
    })
    this.persistAuthState(this.isAuthenticated.value)
  }

  /**
   * Realizeaza delogarea utilizatorului din Auth0.
   *
   * @param {unknown} options - Optiuni specifice Auth0 pentru procesul de delogare
   * @returns {Promise<void>} Promisiune care se rezolva cand delogarea este completa
   */
  public override async logout(options?: unknown): Promise<void> {
    authBanner('AuthSPAService.logout called', { hasOptions: options !== undefined })
    await this.auth0Client?.logout(options as Parameters<Auth0VueClient['logout']>[0])
    this.persistAuthState(false)
  }
}

/**
 * Tipul raspunsului obtinut de la endpoint-ul /me al API-ului.
 */
type MeResponse = {
  authenticated: boolean
  tokens?: unknown
}

/**
 * Implementare a serviciului de autentificare bazata pe JWT si sesiuni HTTP.
 *
 * Aceasta clasa utilizeaza un API backend pentru a gestiona autentificarea
 * utilizatorilor prin intermediul JWT (JSON Web Tokens) si cookie-uri de sesiune.
 */
class JARJWTLogin extends AbstractAuthAuth0Service {
  /**
   * URL-ul de baza al API-ului backend.
   */
  private readonly apiBaseUrl: string

  /**
   * Construieste o instanta de JARJWTLogin.
   *
   * @param {string} apiBaseUrl - URL-ul de baza al API-ului, implicit '/api'
   */
  public constructor(apiBaseUrl = import.meta.env.VITE_BACKEND || '/api') {
    super()

    this.apiBaseUrl = `${apiBaseUrl.replace(/\/$/, '')}/auth`
    authBanner('JARJWTLogin initialized', { apiBaseUrl: this.apiBaseUrl })
  }

  /**
   * Redirectioneaza utilizatorul catre endpoint-ul de logare al API-ului.
   *
   * @returns {Promise<void>} Promisiune care se rezolva cand redirectarea este initiata
   */
  public async loginWithRedirect(): Promise<void> {
    authBanner('JARJWTLogin.loginWithRedirect called', {
      redirectUrl: `${this.apiBaseUrl}/login`,
    })
    window.location.href = `${this.apiBaseUrl}/login`
  }

  /**
   * Verifica starea de autentificare prin consultarea endpoint-ului /me.
   *
   * Realizeaza un request GET catre API pentru a verifica daca utilizatorul
   * are o sesiune valida. Actualizeaza starea de autentificare in functie
   * de raspunsul primit.
   *
   * @returns {Promise<void>} Promisiune care se rezolva cand verificarea este completa
   * @throws {Error} Daca request-ul catre API esueaza (cu status diferit de 401)
   */
  public async checkAuth(): Promise<void> {
    authLog('JARJWTLogin.checkAuth started', { meEndpoint: `${this.apiBaseUrl}/me` })
    const response = await fetch(`${this.apiBaseUrl}/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.status === 401) {
      this.isAuthenticated.value = false
      this.persistAuthState(false)
      authWarn('JARJWTLogin.checkAuth received 401, marking unauthenticated')
      return
    }

    if (!response.ok) {
      this.isAuthenticated.value = false
      this.persistAuthState(false)
      authError('JARJWTLogin.checkAuth failed with non-OK response', {
        status: response.status,
      })
      throw new Error(`Failed to check authentication: ${response.status}`)
    }

    const data = (await response.json()) as MeResponse

    this.isAuthenticated.value = data.authenticated === true
    this.persistAuthState(this.isAuthenticated.value)
    authBanner('JARJWTLogin.checkAuth completed', {
      authenticated: this.isAuthenticated.value,
    })
  }

  /**
   * Realizeaza delogarea utilizatorului prin consultarea endpoint-ului /logout.
   *
   * Realizeaza un request POST catre API pentru a termina sesiunea utilizatorului.
   * Daca endpoint-ul este indisponibil, marcheaza utilizatorul ca delogat la nivel
   * de frontend pentru a evita ca utilizatorii sa ramana blocati in starea de autentificat.
   *
   * @returns {Promise<void>} Promisiune care se rezolva cand delogarea este finalizata
   */
  public override async logout(options?: unknown): Promise<void> {
    authBanner('JARJWTLogin.logout called', { hasOptions: options !== undefined })
    await fetch(`${this.apiBaseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Avoid leaving the frontend stuck as authenticated
      // if logout endpoint is missing or temporarily unavailable.
      authWarn('JARJWTLogin.logout network call failed; continuing with local logout state')
    })

    this.isAuthenticated.value = false
    this.persistAuthState(false)

    const returnTo = extractLogoutReturnTo(options)
    if (returnTo) {
      authLog('JARJWTLogin.logout redirecting after logout', { returnTo })
      this.redirectAfterLogout(returnTo)
      return
    }

    authLog('JARJWTLogin.logout completed without redirect')
  }

  protected redirectAfterLogout(returnTo: string): void {
    window.location.assign(returnTo)
  }
}

export { AuthSPAService, JARJWTLogin, createAuthLoginPlugin }
