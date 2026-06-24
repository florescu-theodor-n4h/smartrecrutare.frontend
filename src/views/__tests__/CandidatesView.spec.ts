import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CandidatesView from '../CandidatesView.vue'
import i18n from '../../i18n'

vi.mock('../../services/api', () => ({
  default: {
    getCandidates: vi.fn(() =>
      Promise.resolve({ data: [{ id: 1, name: 'Ana', email: 'ana@example.com' }] }),
    ),
    createCandidate: vi.fn(() => Promise.resolve({})),
    updateCandidate: vi.fn(() => Promise.resolve({})),
    deleteCandidate: vi.fn(() => Promise.resolve({})),
  },
}))

describe('CandidatesView', () => {
  beforeEach(() => vi.resetAllMocks())

  it('renders candidates list', async () => {
    const wrapper = mount(CandidatesView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('ana@example.com')
  })
})
