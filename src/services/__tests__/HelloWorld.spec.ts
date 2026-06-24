// oxlint-disable-next-line no-unused-vars
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { themeService } from '../theme.service'
// Test serviciu tema
describe('ThemeService', () => {
  beforeEach(() => {
    // reset HTML classes before each test
    document.documentElement.className = ''
  })

  it('should add dark class when isDark is true', () => {
    themeService.applyDark(true)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should remove dark class when isDark is false', () => {
    document.documentElement.classList.add('dark')

    themeService.applyDark(false)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should toggle correctly from light to dark and back', () => {
    themeService.applyDark(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    themeService.applyDark(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
