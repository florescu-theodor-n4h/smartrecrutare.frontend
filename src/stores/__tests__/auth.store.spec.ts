import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

/* --- mock serviciu cookies --- */
vi.mock('../../services/cookie.service', () => ({
  serviciuCookies: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { serviciuCookies } from '../../services/cookie.service'
import { useAuthSessionStore } from '../auth.store'

const AUTH_COOKIE_KEY = 'auth.session'

function buildSnapshot(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    isAuthenticated: false,
    savingUserIntention: false,
    userIntention: null,
    disclaimer: '',
    ...overrides,
  })
}

describe('useAuthSessionStore — persistenta cookie', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  /* --- smoke: stare initiala --- */
  it('porneste cu isAuthenticated=false si stare vida', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()

    expect(store.isAuthenticated).toBe(false)
    expect(store.savingUserIntention).toBe(false)
    expect(store.userIntention).toBeNull()
    expect(store.disclaimer).toBe('')
  })

  /* --- hidratare din cookie --- */
  it('hydrate() restaureaza starea din cookie', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(
      buildSnapshot({ isAuthenticated: true, userIntention: 'login' }),
    )

    const store = useAuthSessionStore()
    store.hydrate()

    expect(store.isAuthenticated).toBe(true)
    expect(store.userIntention).toBe('login')
  })

  it('hydrate() ignora cookie invalid (JSON corupt)', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue('{corupt json]]]')

    const store = useAuthSessionStore()
    store.hydrate()

    expect(store.isAuthenticated).toBe(false)
  })

  it('hydrate() ignora cookie lipsa', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.hydrate()

    expect(store.isAuthenticated).toBe(false)
  })

  /* --- persistenta la setAuthenticated --- */
  it('setAuthenticated(true) actualizeaza starea si scrie cookie', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setAuthenticated(true)

    expect(store.isAuthenticated).toBe(true)
    expect(vi.mocked(serviciuCookies.set)).toHaveBeenCalledWith(
      AUTH_COOKIE_KEY,
      expect.stringContaining('"isAuthenticated":true'),
    )
  })

  it('setAuthenticated(false) scrie cookie cu isAuthenticated=false', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setAuthenticated(true)
    store.setAuthenticated(false)

    const lastCall = vi.mocked(serviciuCookies.set).mock.calls.at(-1)!
    const written = JSON.parse(lastCall[1]) as Record<string, unknown>
    expect(written.isAuthenticated).toBe(false)
  })

  /* --- persistenta la setSavingUserIntention --- */
  it('setSavingUserIntention(true) scrie cookie cu savingUserIntention=true', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setSavingUserIntention(true)

    expect(store.savingUserIntention).toBe(true)
    const lastCall = vi.mocked(serviciuCookies.set).mock.calls.at(-1)!
    const written = JSON.parse(lastCall[1]) as Record<string, unknown>
    expect(written.savingUserIntention).toBe(true)
  })

  /* --- setUserIntention --- */
  it('setUserIntention persista intentia in cookie', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setUserIntention('register')

    expect(store.userIntention).toBe('register')
    const lastCall = vi.mocked(serviciuCookies.set).mock.calls.at(-1)!
    const written = JSON.parse(lastCall[1]) as Record<string, unknown>
    expect(written.userIntention).toBe('register')
  })

  /* --- setDisclaimer --- */
  it('setDisclaimer persista textul in cookie fara sa expuna implementarea', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setDisclaimer('Sesiunea ta poate fi pastrata intre vizite')

    expect(store.disclaimer).toBe('Sesiunea ta poate fi pastrata intre vizite')
    const lastCall = vi.mocked(serviciuCookies.set).mock.calls.at(-1)!
    const written = JSON.parse(lastCall[1]) as Record<string, unknown>
    expect(written.disclaimer).toBe('Sesiunea ta poate fi pastrata intre vizite')
  })

  /* --- ciclu complet: persist + hydrate --- */
  it('persist() si hydrate() formeaza un ciclu consistent', () => {
    vi.mocked(serviciuCookies.get).mockReturnValue(undefined)

    const store = useAuthSessionStore()
    store.setAuthenticated(true)
    store.setSavingUserIntention(true)
    store.setUserIntention('login')

    // Simuleaza ce ar citi din cookie la urmatoarea incarcare
    const writtenValue = vi.mocked(serviciuCookies.set).mock.calls.at(-1)![1]
    vi.mocked(serviciuCookies.get).mockReturnValue(writtenValue)

    const freshStore = useAuthSessionStore()
    freshStore.hydrate()

    expect(freshStore.isAuthenticated).toBe(true)
    expect(freshStore.savingUserIntention).toBe(true)
    expect(freshStore.userIntention).toBe('login')
  })
})
