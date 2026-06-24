import { describe, it, expect } from 'vitest'
import api from '../api'

describe('api wrapper', () => {
  it('uses default base URL when env not set', () => {
    expect(api.axios.defaults.baseURL).toBe('http://192.168.2.1:8080')
  })
})
