import { httpClient } from '@/services/httpClient'
import { withVersionParam } from './api-primitives'
import type { PaginaModel } from './api-primitives'

type AnalyticsPattern = {
  id?: string
  tiparId?: string
  nume?: string
  descriere?: string
  versiune?: number
  [key: string]: unknown
}

type AnalyticsPatternCreateRequest = {
  nume: string
  descriere?: string
  tipar?: {
    nume?: string
    descriere?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type AnalyticsPatternUpdateRequest = {
  nume?: string
  descriere?: string
  versiune?: number
  tipar?: {
    nume?: string
    descriere?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type CandidateProfile = {
  candidatId?: number
  profil?: Record<string, unknown>
  versiune?: number
  [key: string]: unknown
}

type CandidateProfileCreateRequest = {
  profil?: Record<string, unknown>
  candidatId?: number
  [key: string]: unknown
}

type CandidateProfileUpdateRequest = {
  profil?: Record<string, unknown>
  versiune?: number
  candidatId?: number
  [key: string]: unknown
}

type AnalyticsMatch = {
  id?: number
  candidatId?: number
  jobId?: number
  scor?: number
  [key: string]: unknown
}

type AnalyticsDashboard = {
  [key: string]: unknown
}

type AnalyticsRun = {
  executieId?: string
  status?: string
  startedAt?: string
  finishedAt?: string | null
  [key: string]: unknown
}

type AnalyticsRunCreateRequest = {
  [key: string]: unknown
}

const analyticsApi = {
  listPatterns() {
    return httpClient.get<PaginaModel<AnalyticsPattern>>('/api/admin/analytics/patterns')
  },

  createPattern(payload: AnalyticsPatternCreateRequest) {
    return httpClient.post<AnalyticsPattern>('/api/admin/analytics/patterns', payload)
  },

  getPattern(tiparId: string | number) {
    return httpClient.get<AnalyticsPattern>(`/api/admin/analytics/patterns/${tiparId}`)
  },

  updatePattern(tiparId: string | number, payload: AnalyticsPatternUpdateRequest) {
    return httpClient.put<AnalyticsPattern>(`/api/admin/analytics/patterns/${tiparId}`, payload)
  },

  deletePattern(tiparId: string | number, version: number) {
    return httpClient.delete<void>(
      `/api/admin/analytics/patterns/${tiparId}`,
      withVersionParam(version),
    )
  },

  listCandidateProfiles() {
    return httpClient.get<PaginaModel<CandidateProfile>>('/api/admin/analytics/candidate-profiles')
  },

  createCandidateProfile(candidatId: number, payload: CandidateProfileCreateRequest = {}) {
    return httpClient.post<CandidateProfile>(
      `/api/admin/analytics/candidate-profiles/${candidatId}`,
      payload,
    )
  },

  getCandidateProfile(candidatId: number) {
    return httpClient.get<CandidateProfile>(`/api/admin/analytics/candidate-profiles/${candidatId}`)
  },

  updateCandidateProfile(candidatId: number, payload: CandidateProfileUpdateRequest) {
    return httpClient.put<CandidateProfile>(
      `/api/admin/analytics/candidate-profiles/${candidatId}`,
      payload,
    )
  },

  deleteCandidateProfile(candidatId: number, version: number) {
    return httpClient.delete<void>(
      `/api/admin/analytics/candidate-profiles/${candidatId}`,
      withVersionParam(version),
    )
  },

  listMatches() {
    return httpClient.get<PaginaModel<AnalyticsMatch>>('/api/admin/analytics/matches')
  },

  getDashboard() {
    return httpClient.get<AnalyticsDashboard>('/api/admin/analytics/dashboard')
  },

  listRuns() {
    return httpClient.get<PaginaModel<AnalyticsRun>>('/api/admin/analytics/runs')
  },

  createRun(payload: AnalyticsRunCreateRequest = {}) {
    return httpClient.post<AnalyticsRun>('/api/admin/analytics/runs', payload)
  },

  getRun(executieId: string | number) {
    return httpClient.get<AnalyticsRun>(`/api/admin/analytics/runs/${executieId}`)
  },
}

export type {
  AnalyticsDashboard,
  AnalyticsMatch,
  AnalyticsPattern,
  AnalyticsPatternCreateRequest,
  AnalyticsPatternUpdateRequest,
  AnalyticsRun,
  AnalyticsRunCreateRequest,
  CandidateProfile,
  CandidateProfileCreateRequest,
  CandidateProfileUpdateRequest,
}
export { analyticsApi }
