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
import { createAuthLoginPlugin } from './services/auth_auth0.ts'

//import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()

const auth0: Auth0Plugin = createAuth0({
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  authorizationParams: auth0Config.authorizationParams,
})
const auth0Client: Auth0VueClient = auth0
const authLoginPlugin = createAuthLoginPlugin(auth0Client)

//pinia.use(piniaThemePlugin)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(auth0)
app.use(authLoginPlugin)

app.mount('#app')
