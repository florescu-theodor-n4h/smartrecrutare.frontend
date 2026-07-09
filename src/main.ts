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
import { normalizeAuth0Domain } from './services/auth-utils'

//import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()

const authConfig = getAuthEnvironmentConfig(import.meta.env)

const authMode = getPreferredAuthMode(authConfig)

let auth0Client: Auth0VueClient | undefined

if (authMode === 'auth0') {
  const auth0: Auth0Plugin = createAuth0({
    domain: normalizeAuth0Domain(auth0Config.domain),
    clientId: auth0Config.clientId,
    authorizationParams: auth0Config.authorizationParams,
  })

  auth0Client = auth0
  app.use(auth0)
}

const authLoginPlugin = createAuthLoginService({ auth0Client, config: authConfig })

//pinia.use(piniaThemePlugin)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(authLoginPlugin)

app.mount('#app')
