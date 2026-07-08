import type { App, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

/**
 * Cheie de injectare pentru adaugarea Plugin-ului acestuia in
 * Composition API.
 */
const AuthLoginKey: InjectionKey<AuthLoginService> = Symbol('AuthLogin')

/**
 * Serviciu abstract pentru gestionarea autentificarii utilizatorilor.
 *
 * Aceasta clasa defineste interfata pentru operatiile de logare, verficare
 * a starii de autentificare si delogare.
 */
abstract class AuthLoginService {
  /**
   * Starea reactiva care indica daca utilizatorul este autentificat.
   *
   * @returns {Ref<boolean>} Referinta reactiva care este true daca utilizatorul este logat, false in caz contrar
   */
  public abstract readonly isAuthenticated: Ref<boolean>

  /**
   * Incepe procesul de logare cu redirectare catre pagina de autentificare.
   *
   * @param {unknown} options - Optiuni suplimentare pentru procesul de logare
   * @returns {Promise<void>} Promisiune care se rezolva cand procesul de logare este initiat
   */
  public abstract loginWithRedirect(options?: unknown): Promise<void>

  /**
   * Verifica starea curenta de autentificare a utilizatorului.
   *
   * Aceasta metoda verifica daca sesiunea utilizatorului este inca valida
   * si actualizeaza starea de autentificare daca este necesar.
   *
   * @returns {Promise<void>} Promisiune care se rezolva cand verificarea este completa
   */
  public abstract checkAuth(): Promise<void>

  /**
   * Realizeaza delogarea utilizatorului din aplicatie.
   *
   * Aceasta metoda termina sesiunea utilizatorului si il redirectioneaza
   * daca este necesare, in functie de optiunile furnizate.
   *
   * @param {unknown} options - Optiuni suplimentare pentru procesul de delogare
   * @returns {Promise<void>} Promisiune care se rezolva cand delogarea este finalizata
   */
  public abstract logout(options?: unknown): Promise<void>

  /**
   * Instaleaza serviciul de autentificare in aplicatie.
   * @param app - Instanta aplicatiei Vue in care se instaleaza serviciul
   */
  public install(app: App): void {
    app.provide(AuthLoginKey, this)
    app.config.globalProperties.$auth = this
  }
}

function useAuthLoginPlugin(): AuthLoginService {
  const authLogin = inject(AuthLoginKey)
  if (!authLogin) {
    alert('programming bug: AuthLogin plugin is not installed')
    throw new Error('AuthLogin plugin is not installed')
  }

  return authLogin
}

export { AuthLoginKey, AuthLoginService, useAuthLoginPlugin }
