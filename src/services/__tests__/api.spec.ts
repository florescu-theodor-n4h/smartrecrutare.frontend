import { beforeEach, describe, expect, it, vi } from 'vitest'
import api, { Candidate, Job } from '../api'
import { httpClient } from '../httpClient'

describe('api technical routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes jobs requests to documented endpoints', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: [] } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await api.getJobs()
    await api.getJob(7)
    await api.createJob(new Job())
    await api.updateJob(7, new Job())
    await api.deleteJob(7)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/jobs')
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/jobs/7')
    expect(postSpy).toHaveBeenCalledWith('/api/jobs', expect.any(Job))
    expect(putSpy).toHaveBeenCalledWith('/api/jobs/7', expect.any(Job))
    expect(deleteSpy).toHaveBeenCalledWith('/api/jobs/7')
  })

  it('routes candidates requests to documented endpoints and encodes delete name', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: [] } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await api.getCandidates()
    await api.createCandidate(new Candidate())
    await api.updateCandidate(11, new Candidate())
    await api.deleteCandidate('Ana Maria')

    expect(getSpy).toHaveBeenCalledWith('/api/candidati')
    expect(postSpy).toHaveBeenCalledWith('/api/candidati', expect.any(Candidate))
    expect(putSpy).toHaveBeenCalledWith('/api/candidati/11', expect.any(Candidate))
    expect(deleteSpy).toHaveBeenCalledWith('/api/candidati/Ana%20Maria')
  })

  it('exposes shared axios instance', () => {
    expect(api.axios).toBe(httpClient)
  })
})
