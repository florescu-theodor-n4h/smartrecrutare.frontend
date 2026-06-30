import './assets/theme.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

// auth

import auth0Config from './auth0.config'
import { createAuth0 } from '@auth0/auth0-vue'

//import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()
const auth0 = createAuth0({
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  authorizationParams: auth0Config.authorizationParams,
})
//pinia.use(piniaThemePlugin)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(auth0)

app.mount('#app')
