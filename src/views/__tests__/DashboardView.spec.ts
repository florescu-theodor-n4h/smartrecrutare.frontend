import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DashboardView from '../DashboardView.vue'
import i18n from '../../i18n'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    user: ref({
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/avatar.png',
    }),
    isAuthenticated: ref(true),
    isLoading: ref(false),
  }),
}))

vi.mock('../../services/api', () => ({
  default: {
    getJobs: vi.fn(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] })),
    getCandidates: vi.fn(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] })),
  },
}))

describe('DashboardView', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows basic stats', async () => {
    const wrapper = mount(DashboardView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Data loaded')
  })
})
