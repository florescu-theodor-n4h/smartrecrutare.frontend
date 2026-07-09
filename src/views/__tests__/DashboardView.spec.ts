import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardView from '../DashboardView.vue'
import i18n from '../../i18n'

vi.mock('../../services/api', () => ({
  default: {
    getJobs: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] })),
    getCandidates: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] })),
  },
}))

describe('DashboardView', () => {
  beforeEach(() => vi.resetAllMocks())

  it('smoke: randeaza cardurile de sumar ale panoului de control', async () => {
    const wrapper = mount(DashboardView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('Open Jobs')
    expect(wrapper.text()).toContain('Recent Candidates')
    expect(wrapper.text()).toContain('Data loaded')
  })

  it('qa: randeaza continut si cand utilizatorul nu este autentificat', async () => {
    const wrapper = mount(DashboardView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Dashboard overview')
    expect(wrapper.text()).toContain('Dashboard content is loaded for all users')
    expect(wrapper.text()).toContain('Overview')
  })
})
