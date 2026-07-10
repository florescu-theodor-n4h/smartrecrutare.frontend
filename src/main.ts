import './decorators/symbol-metadata.ts'
import './assets/theme.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

// auth

import auth0Config from './auth0.config'
import { Auth0Plugin, createAuth0, type Auth0VueClient } from '@auth0/auth0-vue'
import {
  createAuthLoginService,
  getAuthEnvironmentConfig,
  getPreferredAuthMode,
} from './services/auth'
import { authBanner, authLog, authWarn } from './services/auth-debug'
import { normalizeAuth0Domain } from './services/auth-utils'
import { useAuthSessionStore } from './stores/auth.store'

//import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()

//pinia.use(piniaThemePlugin)
app.use(pinia)

const authConfig = getAuthEnvironmentConfig(import.meta.env)

const authMode = getPreferredAuthMode(authConfig)
authBanner('Application bootstrap auth mode resolved', { authMode })

let auth0Client: Auth0VueClient | undefined
const canBootstrapAuth0 = Boolean(auth0Config.domain && auth0Config.clientId)

if (authMode === 'local' && !canBootstrapAuth0) {
  const search = new URLSearchParams(window.location.search)
  const authError = search.get('error')
  const authState = search.get('state')

  if (authError && authState) {
    authWarn('Removing stale auth callback query params while in local mode', {
      authError,
      hadState: true,
      path: window.location.pathname,
    })
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

if (canBootstrapAuth0) {
  const normalizedDomain = normalizeAuth0Domain(auth0Config.domain)
  authBanner('Bootstrapping Auth0 plugin', {
    domain: normalizedDomain,
    clientIdSuffix: auth0Config.clientId.slice(-6),
  })

  const auth0: Auth0Plugin = createAuth0({
    domain: normalizedDomain,
    clientId: auth0Config.clientId,
    authorizationParams: auth0Config.authorizationParams,
  })

  auth0Client = auth0
  app.use(auth0)
}

const authLoginPlugin = createAuthLoginService({ auth0Client, config: authConfig })
authLog('Auth login plugin created and ready for installation')

/*
 * Rehidrateaza starea de autentificare din cookie-ul persistent
 * inainte ca restul aplicatiei sa se monteze, astfel incat starea
 * este disponibila la primul render.
 */
useAuthSessionStore().hydrate()

app.use(router)
app.use(i18n)
app.use(authLoginPlugin)
authBanner('Auth login plugin installed into Vue app')

const debugEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

app.config.performance = debugEnabled

app.mount('#app')
