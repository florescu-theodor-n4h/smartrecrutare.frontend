import { createI18n } from 'vue-i18n'
import en from './en.json'
import ro from './ro.json'

const messages = {
  en,
  ro,
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
