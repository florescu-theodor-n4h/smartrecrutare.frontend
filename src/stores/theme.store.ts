// stores/theme.store.ts

import { serviciuCookies } from '@/services/cookie.service'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: false,
  }),

  actions: {
    /**
     * Citeste preferinta salvata din cookie.
     * Se apeleaza o singura data la pornirea aplicatiei.
     */
    init() {
      const saved = serviciuCookies.get('dark')

      if (saved != null) {
        this.dark = saved === 'true'
      }
    },

    /**
     * Comuta tema si persista automat noua valoare.
     */
    toggle() {
      this.dark = !this.dark
      serviciuCookies.set('dark', String(this.dark))
    },

    /**
     * Seteaza explicit tema si persista automat.
     */
    set(value: boolean) {
      this.dark = value
      serviciuCookies.set('dark', String(value))
    },
  },
})
