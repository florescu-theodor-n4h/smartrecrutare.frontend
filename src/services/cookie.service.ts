// Serviciu de stocare persistenta in Cookies.
import Cookies from 'js-cookie'

/***
 * @
 *//**
 * Clasa ServiciuCookies oferă o interfață simplă și centralizată
 * pentru lucrul cu cookie-urile în aplicație.
 *
 * Scopul acestei clase este să encapsuleze accesul direct la biblioteca
 * Cookies (de exemplu js-cookie) și să ofere o API mai curată, ușor
 * de întreținut și de reutilizat în diferite părți ale aplicației.
 *
 * Prin utilizarea acestei clase, se evită apelurile directe repetate
 * către Cookies.get sau Cookies.set și se poate extinde ușor logica
 * (de exemplu: criptare, logging, validare, prefixare de chei etc.).
 */
class ServiciuCookies {
  /**
   * Returnează valoarea asociată unei chei din cookie-uri.
   *
   * Dacă cookie-ul nu există sau a expirat, metoda va returna `undefined`.
   *
   * @param key - cheia cookie-ului pe care dorim să o citim.
   * Aceasta reprezintă identificatorul unic sub care valoarea este stocată
   * în browser.
   *
   * @returns valoarea cookie-ului sub formă de string sau `undefined`
   * dacă acesta nu există.
   *
   * Exemple de utilizare:
   * ```ts
   * const token = serviciuCookies.get("auth_token");
   * ```
   */
  get(key: string): string | undefined {
    return Cookies.get(key)
  }

  /**
   * Stochează o valoare în cookie-uri pentru o perioadă determinată.
   *
   * Cookie-ul este salvat cu o durată de viață implicită de 365 de zile,
   * ceea ce înseamnă că va rămâne persistent în browser timp de un an,
   * dacă nu este șters manual sau suprascris.
   *
   * Această metodă poate fi folosită pentru stocarea unor informații
   * precum token-uri de autentificare, preferințe ale utilizatorului
   * sau alte date de tip lightweight.
   *
   * @param key - cheia sub care se va salva valoarea în cookie.
   * Trebuie să fie un identificator unic și stabil.
   *
   * @param value - valoarea care va fi stocată în cookie.
   * Aceasta trebuie să fie un string; dacă se dorește stocarea de obiecte,
   * acestea trebuie serializate înainte (de exemplu JSON.stringify).
   *
   * @returns void - metoda nu returnează nimic, dar produce efect lateral
   * prin scrierea în browser.
   *
   * Exemple de utilizare:
   * ```ts
   * serviciuCookies.set("theme", "dark");
   * ```
   */
  set(key: string, value: string): void {
    Cookies.set(key, value, { expires: 365 })
  }
}

/**
 * Instanța globală a serviciului de cookies.
 *
 * Această instanță este exportată pentru a fi folosită direct în aplicație,
 * fără a fi nevoie de instanțieri multiple. Practic, funcționează ca un
 * singleton ușor, potrivit pentru servicii stateless.
 */
export const serviciuCookies = new ServiciuCookies()
