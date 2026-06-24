// services/theme.service.ts

import { defineStore } from 'pinia'

/**
 * ThemeService
 *
 * Fully self-contained service:
 * - owns Pinia instance
 * - owns store definition
 * - exposes clean OOP API
 */ /*
export class ThemeStore {
  // Nu se creaza o instanta pentru fiecare store.
  // private static pinia = createPinia()
  /** Variabile interne ale clasei. Acestea sunt statice.
   * /
  public static getStoreFunction = defineStore('theme', {
    state: () => ({
      dark: false,
    }),
  })
}*/

/**
 * O instanta a Serviciul de Teme.
 * Controleaza starea Dark mode a aplicatiei.
 */
export const themeStoreFactory = defineStore('theme', {
  state: () => ({
    dark: false,
  }),

  actions: {
    toggle() {
      this.dark = !this.dark
    },

    set(value: boolean) {
      this.dark = value
    },
  },
})
