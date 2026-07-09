import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, type Ref } from 'vue'
import AuthPill from '../AuthPill.vue'
import i18n from '../../i18n'
import { AuthLoginKey } from '@/services/auth.contract'

const mockGetAuthEnvironmentConfig = vi.fn()
const mockGetPreferredAuthMode = vi.fn()
const mockCreateLocalAuthLoginPlugin = vi.fn()

vi.mock('@/services/auth', () => ({
  getAuthEnvironmentConfig: (...args: unknown[]) => mockGetAuthEnvironmentConfig(...args),
  getPreferredAuthMode: (...args: unknown[]) => mockGetPreferredAuthMode(...args),
}))

vi.mock('@/services/server-auth-user-pass', () => ({
  createLocalAuthLoginPlugin: () => mockCreateLocalAuthLoginPlugin(),
}))

type AuthServiceMock = {
  isAuthenticated: Ref<boolean>
  loginWithRedirect: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
  register: ReturnType<typeof vi.fn>
  checkAuth: ReturnType<typeof vi.fn>
  setSavingUserIntention: ReturnType<typeof vi.fn>
  saveLoginStatus: ReturnType<typeof vi.fn>
  isLocalPiniaSaveable: ReturnType<typeof vi.fn>
  getDisclaimer: ReturnType<typeof vi.fn>
}

function createAuthServiceMock(): AuthServiceMock {
  return {
    isAuthenticated: ref(false),
    loginWithRedirect: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    checkAuth: vi.fn().mockResolvedValue(undefined),
    setSavingUserIntention: vi.fn(),
    saveLoginStatus: vi.fn(),
    isLocalPiniaSaveable: vi.fn().mockReturnValue(true),
    getDisclaimer: vi
      .fn()
      .mockReturnValue(
        'Local auth can persist your session in a browser cookie-backed Pinia store.',
      ),
  }
}

function mountAuthPill(masterAuthPlugin: AuthServiceMock) {
  return mount(AuthPill, {
    global: {
      plugins: [i18n],
      provide: {
        [AuthLoginKey as symbol]: masterAuthPlugin,
      },
    },
  })
}

describe('AuthPill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateLocalAuthLoginPlugin.mockReset()
  })

  it('local mode: opens modal and validates required credentials', async () => {
    mockGetAuthEnvironmentConfig.mockReturnValue({ VITE_DISABLE_LOCAL_LOGIN: 'false' })
    mockGetPreferredAuthMode.mockReturnValue('local')

    const masterAuthPlugin = createAuthServiceMock()
    const wrapper = mountAuthPill(masterAuthPlugin)

    await wrapper.find('.auth-pill.login').trigger('click')
    expect(wrapper.find('.local-login-modal').exists()).toBe(true)

    await wrapper.find('.local-action-submit').trigger('click')

    expect(wrapper.text()).toContain('Username and password are required.')
    expect(masterAuthPlugin.loginWithRedirect).not.toHaveBeenCalled()
  })

  it('pure sso mode: redirects directly without opening modal', async () => {
    mockGetAuthEnvironmentConfig.mockReturnValue({ VITE_DISABLE_LOCAL_LOGIN: 'true' })
    mockGetPreferredAuthMode.mockReturnValue('auth0')

    const masterAuthPlugin = createAuthServiceMock()
    const wrapper = mountAuthPill(masterAuthPlugin)

    await wrapper.find('.auth-pill.login').trigger('click')

    expect(masterAuthPlugin.loginWithRedirect).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.local-login-modal').exists()).toBe(false)
  })

  it('dual mode: uses local service for local tab sign in and updates master auth state', async () => {
    mockGetAuthEnvironmentConfig.mockReturnValue({ VITE_DISABLE_LOCAL_LOGIN: 'false' })
    mockGetPreferredAuthMode.mockReturnValue('auth0')

    const masterAuthPlugin = createAuthServiceMock()
    const localService = createAuthServiceMock()
    mockCreateLocalAuthLoginPlugin.mockReturnValue(localService)

    const wrapper = mountAuthPill(masterAuthPlugin)

    await wrapper.find('.auth-pill.login').trigger('click')
    const topTabButtons = wrapper.findAll('.local-login-header .tab-pill')
    await topTabButtons[1]!.trigger('click')

    const inputs = wrapper.findAll('.field-input')
    await inputs[0]!.setValue('enterprise.user')
    await inputs[1]!.setValue('StrongPass#123')

    const rememberCheckbox = wrapper.find('.remember-label input[type="checkbox"]')
    await rememberCheckbox.setValue(true)

    await wrapper.find('.local-action-submit').trigger('click')

    expect(localService.setSavingUserIntention).toHaveBeenCalledWith(true)
    expect(localService.loginWithRedirect).toHaveBeenCalledWith({
      username: 'enterprise.user',
      password: 'StrongPass#123',
    })
    expect(masterAuthPlugin.saveLoginStatus).toHaveBeenCalledWith(true)
  })

  it('enterprise controls: toggles password visibility and clears active form', async () => {
    mockGetAuthEnvironmentConfig.mockReturnValue({ VITE_DISABLE_LOCAL_LOGIN: 'false' })
    mockGetPreferredAuthMode.mockReturnValue('local')

    const masterAuthPlugin = createAuthServiceMock()
    const wrapper = mountAuthPill(masterAuthPlugin)

    await wrapper.find('.auth-pill.login').trigger('click')

    const passwordInput = wrapper.find('#local-login-password')
    expect(passwordInput.attributes('type')).toBe('password')

    const toggleButton = wrapper.find('.field-toggle')
    await toggleButton.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')

    await wrapper.find('#local-login-username').setValue('temp.user')
    await passwordInput.setValue('temp-password')

    const clearButton = wrapper
      .findAll('.quick-action')
      .find((button) => button.text().toLowerCase().includes('clear'))
    expect(clearButton).toBeDefined()

    await clearButton!.trigger('click')
    expect((wrapper.find('#local-login-username').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#local-login-password').element as HTMLInputElement).value).toBe('')
  })
})
