import { createI18n } from 'vue-i18n'
import en from './en.json'
import ro from './ro.json'
import homeEn from './home.en.json'
import homeRo from './home.ro.json'

const messages = {
  en: {
    ...en,
    home: homeEn,
  },
  ro: {
    ...ro,
    home: homeRo,
  },
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
