import { httpClient } from '@/services/httpClient'
import type { AuditFields, LocalUserRole, PaginaModel, VersionFields } from './api-primitives'

type LocalUserResponse = AuditFields &
  VersionFields & {
    id: number
    username: string
    email: string
    enabled: boolean
    locked: boolean
    roles: LocalUserRole[]
    managedEmployerIds: number[]
    lastLoginAt: string | null
  }

type LocalUserCreateRequest = {
  username: string
  email: string
  password: string
  roles: LocalUserRole[]
}

type LocalUserUpdateRequest = {
  username?: string
  email?: string
  enabled?: boolean
  locked?: boolean
}

type LocalUserRolesRequest = {
  roles: LocalUserRole[]
}

type LocalUserPasswordRequest = {
  password: string
}

type ManagerEmployerAssignmentRequest = {
  employerId: number
}

type PaginaModelLocalUserResponse = PaginaModel<LocalUserResponse>

const localUsersApi = {
  listLocalUsers(params: { page?: number; size?: number } = {}) {
    return httpClient.get<PaginaModelLocalUserResponse>('/api/admin/local-users', { params })
  },

  createLocalUser(payload: LocalUserCreateRequest) {
    return httpClient.post<LocalUserResponse>('/api/admin/local-users', payload)
  },

  getLocalUser(id: number) {
    return httpClient.get<LocalUserResponse>(`/api/admin/local-users/${id}`)
  },

  updateLocalUser(id: number, payload: LocalUserUpdateRequest) {
    return httpClient.put<LocalUserResponse>(`/api/admin/local-users/${id}`, payload)
  },

  updateLocalUserRoles(id: number, payload: LocalUserRolesRequest) {
    return httpClient.put<LocalUserResponse>(`/api/admin/local-users/${id}/roles`, payload)
  },

  updateLocalUserPassword(id: number, payload: LocalUserPasswordRequest) {
    return httpClient.put<void>(`/api/admin/local-users/${id}/password`, payload)
  },

  assignManagedEmployer(id: number, payload: ManagerEmployerAssignmentRequest) {
    return httpClient.post<LocalUserResponse>(
      `/api/admin/local-users/${id}/managed-employers`,
      payload,
    )
  },

  unassignManagedEmployer(id: number, employerId: number) {
    return httpClient.delete<LocalUserResponse>(
      `/api/admin/local-users/${id}/managed-employers/${employerId}`,
    )
  },
}

export type {
  LocalUserCreateRequest,
  LocalUserPasswordRequest,
  LocalUserResponse,
  LocalUserRolesRequest,
  LocalUserUpdateRequest,
  ManagerEmployerAssignmentRequest,
  PaginaModelLocalUserResponse,
}
export { localUsersApi }
