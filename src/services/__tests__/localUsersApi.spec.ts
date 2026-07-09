import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../httpClient'
import { localUsersApi } from '../localUsersApi'

describe('localUsersApi routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes list and CRUD endpoints for local users', async () => {
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as never)
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const putSpy = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as never)

    await localUsersApi.listLocalUsers({ page: 2, size: 50 })
    await localUsersApi.createLocalUser({
      username: 'maria',
      email: 'maria@example.test',
      password: 'secret',
      roles: ['MANAGER'],
    })
    await localUsersApi.getLocalUser(4)
    await localUsersApi.updateLocalUser(4, { email: 'maria.updated@example.test' })
    await localUsersApi.updateLocalUserRoles(4, { roles: ['ADMIN', 'AUDITOR'] })
    await localUsersApi.updateLocalUserPassword(4, { password: 'new-secret' })

    expect(getSpy).toHaveBeenNthCalledWith(1, '/api/admin/local-users', {
      params: { page: 2, size: 50 },
    })
    expect(postSpy).toHaveBeenCalledWith('/api/admin/local-users', {
      username: 'maria',
      email: 'maria@example.test',
      password: 'secret',
      roles: ['MANAGER'],
    })
    expect(getSpy).toHaveBeenNthCalledWith(2, '/api/admin/local-users/4')
    expect(putSpy).toHaveBeenNthCalledWith(1, '/api/admin/local-users/4', {
      email: 'maria.updated@example.test',
    })
    expect(putSpy).toHaveBeenNthCalledWith(2, '/api/admin/local-users/4/roles', {
      roles: ['ADMIN', 'AUDITOR'],
    })
    expect(putSpy).toHaveBeenNthCalledWith(3, '/api/admin/local-users/4/password', {
      password: 'new-secret',
    })
  })

  it('routes managed employers assignment endpoints', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as never)
    const deleteSpy = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as never)

    await localUsersApi.assignManagedEmployer(7, { employerId: 21 })
    await localUsersApi.unassignManagedEmployer(7, 21)

    expect(postSpy).toHaveBeenCalledWith('/api/admin/local-users/7/managed-employers', {
      employerId: 21,
    })
    expect(deleteSpy).toHaveBeenCalledWith('/api/admin/local-users/7/managed-employers/21')
  })
})
