import './assets/theme.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { piniaThemePlugin } from './plugins/pinia-theme.plugin'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaThemePlugin)
app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
