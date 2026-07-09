import { httpClient } from '@/services/httpClient'
import type { AuditFields, VersionFields } from './api-primitives'

type CandidateResponse = AuditFields &
  VersionFields & {
    id?: number
    numePrenume: string
    mail: string
    tel?: string
  }

type CandidateCreateRequest = {
  numePrenume: string
  mail: string
  tel?: string
}

type CandidateUpdateRequest = Partial<CandidateCreateRequest> & {
  versiune?: number
}

const candidatesApi = {
  listCandidates() {
    return httpClient.get<CandidateResponse[]>('/api/candidati')
  },

  createCandidate(payload: CandidateCreateRequest) {
    return httpClient.post<CandidateResponse>('/api/candidati', payload)
  },

  getCandidate(id: number) {
    return httpClient.get<CandidateResponse>(`/api/candidati/${id}`)
  },

  updateCandidate(id: number, payload: CandidateUpdateRequest) {
    return httpClient.put<CandidateResponse>(`/api/candidati/${id}`, payload)
  },

  deleteCandidateByName(numeCandidate: string) {
    return httpClient.delete<void>(`/api/candidati/${encodeURIComponent(numeCandidate)}`)
  },

  deleteCandidateById(id: number) {
    return httpClient.delete<boolean>(`/api/candidati/id/${id}`)
  },
}

export type { CandidateCreateRequest, CandidateResponse, CandidateUpdateRequest }
export { candidatesApi }
