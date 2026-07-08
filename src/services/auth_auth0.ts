import { ref, type Ref } from 'vue'
import { AuthLoginService } from '@/services/auth'
import type { Auth0VueClient } from '@auth0/auth0-vue'

/**
 * Implementare a serviciului de autentificare pentru Auth0 SPA (Single Page Application).
 *
 * Aceasta clasa integreaza SDK-ul Auth0 Vue pentru a gestiona autentificarea
 * utilizatorilor intr-o aplicatie single page folosind protocolul OAuth2/OIDC.
 */
export class AuthSPAService extends AuthLoginService {
  /**
   * Referinta reactiva la starea de autentificare de la Auth0 SDK.
   */
  public readonly isAuthenticated: Ref<boolean>

  /**
   * Clientul Auth0 Vue folosit pentru operatiile de autentificare.
   */
  private readonly auth0: Auth0VueClient

  /**
   * Construieste o instanta de AuthSPAService.
   *
   * @param {Auth0VueClient} auth0 - Clientul Auth0 Vue configurat
   */
  public constructor(auth0: Auth0VueClient) {
    super()

    this.auth0 = auth0
    this.isAuthenticated = auth0.isAuthenticated
  }

  /**
   * Redirecrioneaza utilizatorul catre pagina de logare Auth0.
   *
   * @param {unknown} options - Optiuni specifice Auth0 pentru procesul de logare
   * @returns {Promise<void>} Promisiune care se rezolva cand redirectarea este initiata
   */
  public async loginWithRedirect(options?: unknown): Promise<void> {
    await this.auth0.loginWithRedirect(options as never)
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
  }

  /**
   * Realizeaza delogarea utilizatorului din Auth0.
   *
   * @param {unknown} options - Optiuni specifice Auth0 pentru procesul de delogare
   * @returns {Promise<void>} Promisiune care se rezolva cand delogarea este completa
   */
  public async logout(options?: unknown): Promise<void> {
    await this.auth0.logout(options as never)
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
export class JARJWTLogin extends AuthLoginService {
  /**
   * Starea reactiva de autentificare, initializata ca false.
   */
  public readonly isAuthenticated: Ref<boolean> = ref(false)

  /**
   * URL-ul de baza al API-ului backend.
   */
  private readonly apiBaseUrl: string

  /**
   * Construieste o instanta de JARJWTLogin.
   *
   * @param {string} apiBaseUrl - URL-ul de baza al API-ului, implicit '/api'
   */
  public constructor(apiBaseUrl = import.meta.env.VITE_BACKEND) {
    super()

    this.apiBaseUrl = `${apiBaseUrl.replace(/\/$/, '')}/auth`
  }

  /**
   * Redirectioneaza utilizatorul catre endpoint-ul de logare al API-ului.
   *
   * @returns {Promise<void>} Promisiune care se rezolva cand redirectarea este initiata
   */
  public async loginWithRedirect(): Promise<void> {
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
    const response = await fetch(`${this.apiBaseUrl}/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.status === 401) {
      this.isAuthenticated.value = false
      return
    }

    if (!response.ok) {
      this.isAuthenticated.value = false
      throw new Error(`Failed to check authentication: ${response.status}`)
    }

    const data = (await response.json()) as MeResponse

    this.isAuthenticated.value = data.authenticated === true
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
  public async logout(): Promise<void> {
    await fetch(`${this.apiBaseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Avoid leaving the frontend stuck as authenticated
      // if logout endpoint is missing or temporarily unavailable.
    })

    this.isAuthenticated.value = false
  }
}

/**
 * Creaza un plugin de autentificare pentru Vue, alegand implementarea potrivita
 * @param auth0 - Clientul Auth0 Vue, daca se foloseste Auth0 SPA
 * @returns   {AuthLoginService} Instanta a serviciului de autentificare ales
 */
export function createAuthLoginPlugin(auth0: Auth0VueClient): AuthLoginService {
  const useJarJwtLogin =
    import.meta.env.VITE_USE_JAR_JWT_LOGIN === 'true' ||
    import.meta.env.VITE_REQUIRE_PAR === 'true' ||
    import.meta.env.VITE_REQUIRE_JAR === 'true'

  if (useJarJwtLogin) {
    return new JARJWTLogin('/api')
  }

  return new AuthSPAService(auth0)
}
