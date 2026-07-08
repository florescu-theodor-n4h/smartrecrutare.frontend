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
  getPreferredAuthMode,
  type AuthEnvironmentConfig,
} from './services/auth'

//import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()

const authConfig: AuthEnvironmentConfig = {
  VITE_PREFERRED_AUTH: import.meta.env.VITE_PREFERRED_AUTH,
  VITE_PREFFERRED_AUTH: import.meta.env.VITE_PREFFERRED_AUTH,
  VITE_PREFERRED_LOGIN: import.meta.env.VITE_PREFERRED_LOGIN,
  VITE_DISABLE_LOCAL_LOGIN: import.meta.env.VITE_DISABLE_LOCAL_LOGIN,
  VITE_REQUIRE_PAR: import.meta.env.VITE_REQUIRE_PAR,
  VITE_REQUIRE_JAR: import.meta.env.VITE_REQUIRE_JAR,
  VITE_USE_JAR_JWT_LOGIN: import.meta.env.VITE_USE_JAR_JWT_LOGIN,
}

const authMode = getPreferredAuthMode(authConfig)

let auth0Client: Auth0VueClient | undefined

if (authMode === 'auth0') {
  const auth0: Auth0Plugin = createAuth0({
    domain: auth0Config.domain,
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
