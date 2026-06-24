// plugins/pinia-theme.plugin.ts
import type { PiniaPluginContext } from 'pinia'
import { serviciuCookies } from '@/services/cookie.service'
import { themeService } from '@/services/theme.service'

export function piniaThemePlugin({ store }: PiniaPluginContext) {
  if (store.$id !== 'theme') return

  // hydrate from cookie
  const saved = serviciuCookies.get('dark')
  if (saved) {
    store.set(saved === 'true')
  }

  // react to changes
  store.$subscribe((_, state) => {
    serviciuCookies.set('dark', String(state.dark))
    themeService.applyDark(state.dark)
  })
}
