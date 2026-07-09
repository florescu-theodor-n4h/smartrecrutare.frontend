import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StatisticsView from '../StatisticsView.vue'
import i18n from '../../i18n'

/* --- mock-uri servicii --- */
vi.mock('../../services/analyticsApi', () => ({
  analyticsApi: {
    getDashboard: vi.fn(),
    listMatches: vi.fn(),
    listRuns: vi.fn(),
  },
}))

vi.mock('../../services/employersApi', () => ({
  employersApi: {
    listEmployers: vi.fn(),
  },
}))

import { analyticsApi } from '../../services/analyticsApi'
import { employersApi } from '../../services/employersApi'

/* --- utilitare --- */
function pendingPromise() {
  return new Promise(() => {}) as Promise<never>
}

function successMocks(
  opts: {
    jobs?: number
    candidates?: number
    matchesTotal?: number
    runsTotal?: number
    employersTotal?: number
  } = {},
) {
  const { jobs = 4, candidates = 7, matchesTotal = 3, runsTotal = 5, employersTotal = 2 } = opts

  vi.mocked(analyticsApi.getDashboard).mockResolvedValue({
    data: { jobs, candidates },
  } as never)
  vi.mocked(analyticsApi.listMatches).mockResolvedValue({
    data: { totalElemente: matchesTotal },
  } as never)
  vi.mocked(analyticsApi.listRuns).mockResolvedValue({
    data: { totalElemente: runsTotal },
  } as never)
  vi.mocked(employersApi.listEmployers).mockResolvedValue({
    data: { totalElemente: employersTotal },
  } as never)
}

describe('StatisticsView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  /* --- stare incarcare --- */
  it('arata mesajul de incarcare cat timp API-ul este in asteptare', async () => {
    vi.mocked(analyticsApi.getDashboard).mockReturnValue(pendingPromise())
    vi.mocked(analyticsApi.listMatches).mockReturnValue(pendingPromise())
    vi.mocked(analyticsApi.listRuns).mockReturnValue(pendingPromise())
    vi.mocked(employersApi.listEmployers).mockReturnValue(pendingPromise())

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    // Asteptam un tick pentru ca Vue sa aplice loading=true in DOM
    await nextTick()

    expect(wrapper.find('.info').exists()).toBe(true)
    expect(wrapper.find('.cards').exists()).toBe(false)
  })

  /* --- randare carduri --- */
  it('randeaza toate cardurile de statistici dupa incarcare reusita', async () => {
    successMocks({ matchesTotal: 3, runsTotal: 5, jobs: 4, candidates: 7, employersTotal: 2 })

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.cards').exists()).toBe(true)
    expect(wrapper.findAll('.card').length).toBe(5)

    const text = wrapper.text()
    expect(text).toContain('3') // potriviri
    expect(text).toContain('5') // rulari
    expect(text).toContain('4') // posturi
    expect(text).toContain('7') // candidati
    expect(text).toContain('2') // angajatori
  })

  /* --- randare carduri cu totalElemente 0 --- */
  it('afiseaza zerouri cand API-ul returneaza totalElemente 0', async () => {
    successMocks({ matchesTotal: 0, runsTotal: 0, jobs: 0, candidates: 0, employersTotal: 0 })

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.cards').exists()).toBe(true)
    // Toate valorile sunt 0 - verificam ca nu exista eroare
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  /* --- stare eroare --- */
  it('arata eroarea si ascunde cardurile cand API-ul esueaza', async () => {
    vi.mocked(analyticsApi.getDashboard).mockRejectedValue(new Error('Network error'))
    vi.mocked(analyticsApi.listMatches).mockRejectedValue(new Error('Network error'))
    vi.mocked(analyticsApi.listRuns).mockRejectedValue(new Error('Network error'))
    vi.mocked(employersApi.listEmployers).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.cards').exists()).toBe(false)
  })

  /* --- smoke: apeluri API corecte --- */
  it('apeleaza toate cele patru endpoint-uri la montare', async () => {
    successMocks()

    mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(vi.mocked(analyticsApi.getDashboard)).toHaveBeenCalledOnce()
    expect(vi.mocked(analyticsApi.listMatches)).toHaveBeenCalledOnce()
    expect(vi.mocked(analyticsApi.listRuns)).toHaveBeenCalledOnce()
    expect(vi.mocked(employersApi.listEmployers)).toHaveBeenCalledOnce()
  })

  /* --- smoke: buton refresh re-apeleaza API-ul --- */
  it('re-apeleaza API-ul la click pe butonul de refresh', async () => {
    successMocks()

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    vi.resetAllMocks()
    successMocks()

    await wrapper.find('.refresh').trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(vi.mocked(analyticsApi.getDashboard)).toHaveBeenCalledOnce()
    expect(vi.mocked(employersApi.listEmployers)).toHaveBeenCalledOnce()
  })

  /* --- smoke: citire continut din array direct --- */
  it('numara elementele din array cand lipseste totalElemente', async () => {
    vi.mocked(analyticsApi.getDashboard).mockResolvedValue({ data: {} } as never)
    vi.mocked(analyticsApi.listMatches).mockResolvedValue({
      data: { continut: [{}, {}, {}] },
    } as never)
    vi.mocked(analyticsApi.listRuns).mockResolvedValue({
      data: { continut: [{}, {}] },
    } as never)
    vi.mocked(employersApi.listEmployers).mockResolvedValue({
      data: { continut: [{}] },
    } as never)

    const wrapper = mount(StatisticsView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    const text = wrapper.text()
    expect(text).toContain('3') // matches din array
    expect(text).toContain('1') // angajatori din array
  })
})
