import { httpClient } from '@/services/httpClient'
import type { AuditFields, PaginaModel, VersionFields } from './api-primitives'

type EmployerStatus = 'ACTIV' | 'INACTIV' | 'SUSPENDAT' | 'IN_VERIFICARE'

type Employer = AuditFields &
  VersionFields & {
    id?: number
    nume: string
    denumireLegala?: string
    status?: EmployerStatus
    codFiscal?: string
    website?: string
    adresa?: string
    emailContact?: string
    telefonContact?: string
    activ?: boolean
  }

type EmployerCreateRequest = {
  nume: string
  denumireLegala?: string
  status?: EmployerStatus
  codFiscal?: string
  website?: string
  adresa?: string
  emailContact?: string
  telefonContact?: string
}

type EmployerUpdateRequest = {
  nume?: string
  denumireLegala?: string
  status?: EmployerStatus
  codFiscal?: string
  website?: string
  adresa?: string
  emailContact?: string
  telefonContact?: string
  activ?: boolean
  versiune?: number
}

const employersApi = {
  listEmployers(params: { page?: number; size?: number } = {}) {
    if (params.page === undefined && params.size === undefined) {
      return httpClient.get<PaginaModel<Employer>>('/api/employers')
    }

    return httpClient.get<PaginaModel<Employer>>('/api/employers', { params })
  },

  createEmployer(payload: EmployerCreateRequest) {
    return httpClient.post<Employer>('/api/employers', payload)
  },

  getEmployer(id: number) {
    return httpClient.get<Employer>(`/api/employers/${id}`)
  },

  updateEmployer(id: number, payload: EmployerUpdateRequest) {
    return httpClient.put<Employer>(`/api/employers/${id}`, payload)
  },

  deleteEmployer(id: number) {
    return httpClient.delete<void>(`/api/employers/${id}`)
  },
}

export type { Employer, EmployerCreateRequest, EmployerStatus, EmployerUpdateRequest }
export { employersApi }
