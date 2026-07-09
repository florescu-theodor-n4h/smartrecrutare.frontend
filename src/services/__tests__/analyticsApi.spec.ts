import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyticsApi } from '../analyticsApi'
import { httpClient } from '../httpClient'

describe('analyticsApi routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes analytics patterns endpoints with optimistic version delete', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await analyticsApi.listPatterns()
    await analyticsApi.createPattern({ nume: 'tipar-1' })
    await analyticsApi.getPattern(10)
    await analyticsApi.updatePattern(10, { descriere: 'actualizat' })
    await analyticsApi.deletePattern(10, 3)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/admin/analytics/patterns')
    expect(postSpy).toHaveBeenCalledWith('/api/admin/analytics/patterns', { nume: 'tipar-1' })
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/admin/analytics/patterns/10')
    expect(putSpy).toHaveBeenCalledWith('/api/admin/analytics/patterns/10', {
      descriere: 'actualizat',
    })
    expect(deleteSpy).toHaveBeenCalledWith('/api/admin/analytics/patterns/10', {
      params: { version: 3 },
    })
  })

  it('routes candidate profile, matches, dashboard, and runs endpoints', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await analyticsApi.listCandidateProfiles()
    await analyticsApi.createCandidateProfile(7, {})
    await analyticsApi.getCandidateProfile(7)
    await analyticsApi.updateCandidateProfile(7, { versiune: 1 })
    await analyticsApi.deleteCandidateProfile(7, 4)
    await analyticsApi.listMatches()
    await analyticsApi.getDashboard()
    await analyticsApi.listRuns()
    await analyticsApi.createRun({})
    await analyticsApi.getRun(19)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/admin/analytics/candidate-profiles')
    expect(postSpy).toHaveBeenNthCalledWith(1, '/api/admin/analytics/candidate-profiles/7', {})
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/admin/analytics/candidate-profiles/7')
    expect(putSpy).toHaveBeenCalledWith('/api/admin/analytics/candidate-profiles/7', {
      versiune: 1,
    })
    expect(deleteSpy).toHaveBeenCalledWith('/api/admin/analytics/candidate-profiles/7', {
      params: { version: 4 },
    })
    expect(getSpy).toHaveBeenNthCalledWith(3, '/api/admin/analytics/matches')
    expect(getSpy).toHaveBeenNthCalledWith(4, '/api/admin/analytics/dashboard')
    expect(getSpy).toHaveBeenNthCalledWith(5, '/api/admin/analytics/runs')
    expect(postSpy).toHaveBeenNthCalledWith(2, '/api/admin/analytics/runs', {})
    expect(getSpy).toHaveBeenNthCalledWith(6, '/api/admin/analytics/runs/19')
  })
})
