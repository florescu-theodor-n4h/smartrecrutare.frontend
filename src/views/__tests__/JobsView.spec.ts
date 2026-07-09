import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JobsView from '../JobsView.vue'
import i18n from '../../i18n'

vi.mock('../../services/api', () => ({
  default: {
    getJobs: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({ data: [{ id: 1, titlu: 'Dev', locatie: 'Remote' }] })),
    createJob: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({})),
    updateJob: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({})),
    deleteJob: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve({})),
  },
}))

describe('JobsView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders job list', async () => {
    const wrapper = mount(JobsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Dev')
  })

  it('opens create modal', async () => {
    const wrapper = mount(JobsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.get('button').trigger('click')
    expect(wrapper.html()).toContain('Create')
  })
})
