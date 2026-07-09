import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsHamburgerMenu from '../SettingsHamburgerMenu.vue'
import i18n from '../../i18n'

describe('SettingsHamburgerMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('opens the settings menu and exposes the admin route', async () => {
    const wrapper = mount(SettingsHamburgerMenu, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
      attachTo: document.body,
    })

    expect(wrapper.find('.menu-panel').exists()).toBe(false)

    await wrapper.find('.settings-trigger').trigger('click')

    expect(wrapper.find('.menu-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('Admin')
  })
})
