// services/theme.service.ts

/**
 * Serviciu pentru gestionarea temei aplicației (dark / light).
 *
 * Această clasă oferă o interfață simplă pentru aplicarea modului dark
 * la nivel de document. Scopul ei este să evite manipularea directă
 * a DOM-ului în mai multe locuri din aplicație și să centralizeze logica
 * de schimbare a temei.
 *
 * În viitor, poate fi extinsă pentru a include:
 * - persistență în cookies/localStorage
 * - detectarea automată a preferinței sistemului
 * - tranziții între teme
 */
class ThemeService {
  /**
   * Aplică sau elimină tema dark la nivel global.
   *
   * Metoda adaugă sau elimină clasa `dark` de pe elementul `<html>`,
   * în funcție de valoarea primită.
   *
   * @param isDark - dacă este `true`, activează tema dark,
   * dacă este `false`, revine la tema light.
   *
   * Exemple de utilizare:
   *
   * themeService.applyDark(true)
   */
  applyDark(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark)
  }
}

/**
 * Instanța globală a serviciului de temă.
 *
 * Este exportată ca singleton pentru a fi folosită direct în aplicație,
 * fără a crea multiple instanțe inutile.
 */
export const themeService = new ThemeService()
