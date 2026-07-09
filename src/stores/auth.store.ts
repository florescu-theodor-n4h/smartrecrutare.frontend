import { defineStore, getActivePinia } from 'pinia'
import { serviciuCookies } from '@/services/cookie.service'
import { clearHttpAuthBearerToken, setHttpAuthBearerToken } from '@/services/httpClient'

type AuthUserIntention = 'login' | 'register' | null

type AuthSessionSnapshot = {
  isAuthenticated: boolean
  savingUserIntention: boolean
  userIntention: AuthUserIntention
  disclaimer: string
  accessToken: string | null
}

const AUTH_SESSION_COOKIE_KEY = 'auth.session'

function readSnapshot(): Partial<AuthSessionSnapshot> | null {
  const rawSnapshot = serviciuCookies.get(AUTH_SESSION_COOKIE_KEY)
  if (!rawSnapshot) {
    return null
  }

  try {
    return JSON.parse(rawSnapshot) as Partial<AuthSessionSnapshot>
  } catch {
    return null
  }
}

export const useAuthSessionStore = defineStore('auth-session', {
  state: (): AuthSessionSnapshot => ({
    isAuthenticated: false,
    savingUserIntention: false,
    userIntention: null,
    disclaimer: '',
    accessToken: null,
  }),

  actions: {
    hydrate(): void {
      const snapshot = readSnapshot()
      if (!snapshot) {
        return
      }

      if (typeof snapshot.isAuthenticated === 'boolean') {
        this.isAuthenticated = snapshot.isAuthenticated
      }

      if (typeof snapshot.savingUserIntention === 'boolean') {
        this.savingUserIntention = snapshot.savingUserIntention
      }

      if (snapshot.userIntention === 'login' || snapshot.userIntention === 'register') {
        this.userIntention = snapshot.userIntention
      }

      if (typeof snapshot.disclaimer === 'string') {
        this.disclaimer = snapshot.disclaimer
      }

      if (typeof snapshot.accessToken === 'string' && snapshot.accessToken.trim()) {
        this.accessToken = snapshot.accessToken
      } else {
        this.accessToken = null
      }

      if (this.isAuthenticated && this.accessToken) {
        setHttpAuthBearerToken(this.accessToken)
      } else {
        clearHttpAuthBearerToken()
      }
    },

    persist(): void {
      serviciuCookies.set(
        AUTH_SESSION_COOKIE_KEY,
        JSON.stringify({
          isAuthenticated: this.isAuthenticated,
          savingUserIntention: this.savingUserIntention,
          userIntention: this.userIntention,
          disclaimer: this.disclaimer,
          accessToken: this.accessToken,
        }),
      )
    },

    setAuthenticated(isAuthenticated: boolean): void {
      this.isAuthenticated = isAuthenticated
      this.persist()
    },

    setSavingUserIntention(savingUserIntention: boolean): void {
      this.savingUserIntention = savingUserIntention
      this.persist()
    },

    setUserIntention(userIntention: AuthUserIntention): void {
      this.userIntention = userIntention
      this.persist()
    },

    setDisclaimer(disclaimer: string): void {
      this.disclaimer = disclaimer
      this.persist()
    },

    setAccessToken(accessToken: string | null): void {
      this.accessToken = accessToken && accessToken.trim() ? accessToken : null

      if (this.accessToken) {
        setHttpAuthBearerToken(this.accessToken)
      } else {
        clearHttpAuthBearerToken()
      }

      this.persist()
    },
  },
})

function useAuthSessionStoreSafely(): ReturnType<typeof useAuthSessionStore> | null {
  if (!getActivePinia()) {
    return null
  }

  const store = useAuthSessionStore()
  store.hydrate()
  return store
}

export type { AuthSessionSnapshot, AuthUserIntention }
export { AUTH_SESSION_COOKIE_KEY, useAuthSessionStoreSafely }
