// oxlint-disable-next-line no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ComponentHomePage from '@/components/ComponentHomePage.vue'

describe('ComponentHomePage', () => {
  beforeEach(() => {
    document.title = ''
  })

  it('renders default title when no prop is provided', () => {
    const wrapper = mount(ComponentHomePage)

    expect(wrapper.text()).toContain('Pagina Acasa')
  })

  it('computes image url correctly from urlImagine prop', () => {
    const wrapper = mount(ComponentHomePage, {
      props: {
        urlImagine: new URL('https://example.com/test.svg'),
      },
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/test.svg')
  })

  it('falls back to default image when no urlImagine is provided', () => {
    const wrapper = mount(ComponentHomePage)

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://proicons.com/icon/3392.svg')
  })

  it('sets document title on mounted', async () => {
    mount(ComponentHomePage, {
      props: {
        titlu: 'Test Page',
      },
    })

    await nextTick()

    expect(document.title).toBe('Test Page')
  })

  it('renders slot content in default slot', () => {
    const wrapper = mount(ComponentHomePage, {
      slots: {
        default: '<p>Custom content</p>',
      },
    })

    expect(wrapper.html()).toContain('Custom content')
  })

  it('renders title slot when provided', () => {
    const wrapper = mount(ComponentHomePage, {
      slots: {
        title: '<span>Overridden Title</span>',
      },
    })

    expect(wrapper.html()).toContain('Overridden Title')
  })

  it('renders sidebar slot when provided', () => {
    const wrapper = mount(ComponentHomePage, {
      slots: {
        sidebar: '<div class="sidebar-test">Sidebar</div>',
      },
    })

    expect(wrapper.find('.sidebar-test').exists()).toBe(true)
  })
})
