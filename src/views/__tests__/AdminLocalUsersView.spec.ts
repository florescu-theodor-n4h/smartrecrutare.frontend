import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AdminLocalUsersView from '../AdminLocalUsersView.vue'
import i18n from '../../i18n'

/* --- mock serviciu utilizatori locali --- */
vi.mock('../../services/localUsersApi', () => ({
  localUsersApi: {
    listLocalUsers: vi.fn<(...args: unknown[]) => unknown>(),
    createLocalUser: vi.fn<(...args: unknown[]) => unknown>(),
    getLocalUser: vi.fn<(...args: unknown[]) => unknown>(),
    updateLocalUser: vi.fn<(...args: unknown[]) => unknown>(),
    updateLocalUserRoles: vi.fn<(...args: unknown[]) => unknown>(),
    updateLocalUserPassword: vi.fn<(...args: unknown[]) => unknown>(),
    assignManagedEmployer: vi.fn<(...args: unknown[]) => unknown>(),
    unassignManagedEmployer: vi.fn<(...args: unknown[]) => unknown>(),
  },
}))

import { localUsersApi } from '../../services/localUsersApi'

/* --- date de test --- */
const USER_STUB = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  enabled: true,
  locked: false,
  roles: ['USER'],
  managedEmployerIds: [],
  lastLoginAt: '2026-07-09T15:04:04Z',
  creatLa: '2026-07-09T14:00:00Z',
  creatDe: 'system',
  modificatLa: '2026-07-09T15:04:04Z',
  modificatDe: 'system',
  versiune: 4,
}

const PAGE_STUB = {
  continut: [USER_STUB],
  pagina: 0,
  dimensiune: 20,
  totalElemente: 1,
  totalPagini: 1,
}

function mockListSuccess(data = PAGE_STUB) {
  vi.mocked(localUsersApi.listLocalUsers).mockResolvedValue({ data } as never)
}

describe('AdminLocalUsersView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  /* --- smoke: stare incarcare --- */
  it('arata indicatorul de incarcare cat timp API-ul este in asteptare', async () => {
    vi.mocked(localUsersApi.listLocalUsers).mockReturnValue(new Promise(() => {}) as never)

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await nextTick()

    expect(wrapper.find('.state-msg').exists()).toBe(true)
    expect(wrapper.find('.table').exists()).toBe(false)
  })

  /* --- smoke: randare tabel utilizatori --- */
  it('randeaza tabelul cu utilizatorii dupa incarcare reusita', async () => {
    mockListSuccess()

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.table').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.text()).toContain('admin@example.com')
    expect(wrapper.text()).toContain('USER')
  })

  /* --- smoke: stare eroare --- */
  it('arata mesajul de eroare cand API-ul esueaza', async () => {
    vi.mocked(localUsersApi.listLocalUsers).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.table').exists()).toBe(false)
  })

  /* --- smoke: deschide modal creare --- */
  it('deschide modalul de creare la apasarea butonului Create', async () => {
    mockListSuccess()

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.modal').exists()).toBe(false)
    await wrapper.find('.btn').trigger('click')
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  /* --- smoke: deschide modal editare cu datele utilizatorului --- */
  it('deschide modalul de editare cu datele utilizatorului selectat', async () => {
    mockListSuccess()

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    const editBtn = wrapper.find('.btn-small')
    await editBtn.trigger('click')

    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.find('.edit-header').text()).toContain('admin')
    expect(wrapper.find('.tabs').exists()).toBe(true)
  })

  /* --- unitate: creare utilizator trimite datele corecte --- */
  it('apeleaza createLocalUser cu datele din formular', async () => {
    mockListSuccess()
    vi.mocked(localUsersApi.createLocalUser).mockResolvedValue({
      data: { ...USER_STUB, id: 2 },
    } as never)

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    await wrapper.find('.btn').trigger('click') // deschide modal
    await nextTick()

    const inputs = wrapper.findAll('.modal-content input')
    const [usernameInput, emailInput, passwordInput] = inputs
    await usernameInput!.setValue('ionel')
    await emailInput!.setValue('ionel@example.com')
    await passwordInput!.setValue('parola12345')

    await wrapper.find('.modal-content .btn').trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(vi.mocked(localUsersApi.createLocalUser)).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'ionel', email: 'ionel@example.com' }),
    )
  })

  /* --- unitate: salveaza profilul utilizatorului --- */
  it('apeleaza updateLocalUser cu datele din tab-ul de profil', async () => {
    mockListSuccess()
    vi.mocked(localUsersApi.updateLocalUser).mockResolvedValue({ data: USER_STUB } as never)

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    await wrapper.find('.btn-small').trigger('click') // deschide editare
    await nextTick()

    await wrapper.find('.tab-content .btn').trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(vi.mocked(localUsersApi.updateLocalUser)).toHaveBeenCalledWith(
      USER_STUB.id,
      expect.objectContaining({ username: 'admin' }),
    )
  })

  /* --- unitate: validare parola prea scurta --- */
  it('afiseaza eroare de validare cand parola are sub 10 caractere', async () => {
    mockListSuccess()

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    await wrapper.find('.btn-small').trigger('click')
    await nextTick()

    // Schimba pe tab-ul parola
    const tabs = wrapper.findAll('.tab')
    const pwTab = tabs.find((t) => t.text().includes('Parola') || t.text().includes('Password'))
    await pwTab?.trigger('click')
    await nextTick()

    const pwInput = wrapper.find('input[type="password"]')
    await pwInput.setValue('scurt')

    await wrapper.find('.tab-content .btn').trigger('click')
    await nextTick()

    expect(vi.mocked(localUsersApi.updateLocalUserPassword)).not.toHaveBeenCalled()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  /* --- unitate: inchide modalul la click pe Anulare --- */
  it('inchide modalul de editare la click pe butonul de inchidere', async () => {
    mockListSuccess()

    const wrapper = mount(AdminLocalUsersView, { global: { plugins: [i18n] } })
    await new Promise((r) => setTimeout(r, 0))

    await wrapper.find('.btn-small').trigger('click')
    await nextTick()

    expect(wrapper.find('.modal').exists()).toBe(true)

    await wrapper.find('.btn-icon').trigger('click')
    await nextTick()

    expect(wrapper.find('.modal').exists()).toBe(false)
  })
})
