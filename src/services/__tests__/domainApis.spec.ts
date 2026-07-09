import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../httpClient'
import { candidatesApi } from '../candidatesApi'
import { employersApi } from '../employersApi'
import { jobsApi } from '../jobsApi'

describe('domain APIs routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes employers CRUD endpoints', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await employersApi.listEmployers()
    await employersApi.createEmployer({ nume: 'Companie X' })
    await employersApi.getEmployer(5)
    await employersApi.updateEmployer(5, { nume: 'Companie Y' })
    await employersApi.deleteEmployer(5)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/employers')
    expect(postSpy).toHaveBeenCalledWith('/api/employers', { nume: 'Companie X' })
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/employers/5')
    expect(putSpy).toHaveBeenCalledWith('/api/employers/5', { nume: 'Companie Y' })
    expect(deleteSpy).toHaveBeenCalledWith('/api/employers/5')
  })

  it('routes jobs CRUD, search and active endpoints', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await jobsApi.listJobs()
    await jobsApi.createJob({ titlu: 'Dev' })
    await jobsApi.getJob(11)
    await jobsApi.updateJob(11, { locatie: 'Bucuresti' })
    await jobsApi.deleteJob(11)
    await jobsApi.searchJobs({ q: 'java', page: 1, size: 10 })
    await jobsApi.listActiveJobs()

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/jobs')
    expect(postSpy).toHaveBeenCalledWith('/api/jobs', { titlu: 'Dev' })
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/jobs/11')
    expect(putSpy).toHaveBeenCalledWith('/api/jobs/11', { locatie: 'Bucuresti' })
    expect(deleteSpy).toHaveBeenCalledWith('/api/jobs/11')
    expect(getSpy).toHaveBeenNthCalledWith(3, '/api/jobs/cauta', {
      params: { q: 'java', page: 1, size: 10 },
    })
    expect(getSpy).toHaveBeenNthCalledWith(4, '/api/jobs/active')
  })

  it('routes candidates endpoints including delete by id and name', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await candidatesApi.listCandidates()
    await candidatesApi.createCandidate({
      numePrenume: 'Ana Maria',
      mail: 'ana@example.test',
    })
    await candidatesApi.getCandidate(8)
    await candidatesApi.updateCandidate(8, { tel: '0700000000' })
    await candidatesApi.deleteCandidateByName('Ana Maria')
    await candidatesApi.deleteCandidateById(8)

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/candidati')
    expect(postSpy).toHaveBeenCalledWith('/api/candidati', {
      numePrenume: 'Ana Maria',
      mail: 'ana@example.test',
    })
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/candidati/8')
    expect(putSpy).toHaveBeenCalledWith('/api/candidati/8', { tel: '0700000000' })
    expect(deleteSpy).toHaveBeenNthCalledWith(1, '/api/candidati/Ana%20Maria')
    expect(deleteSpy).toHaveBeenNthCalledWith(2, '/api/candidati/id/8')
  })
})
