import { httpClient } from '@/services/httpClient'
import type { AuditFields, VersionFields } from './api-primitives'

type TipContract = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'

type JobEmployerSummary = {
  id: number
  nume: string
  denumireLegala?: string
}

type JobResponse = AuditFields &
  VersionFields & {
    id?: number
    titlu: string
    locatie?: string
    descriere?: string
    companie?: string
    salariu?: string
    tipContract?: TipContract
    status?: JobStatus
    employerId?: number
    employer?: JobEmployerSummary
    activ?: boolean
  }

type JobCreateRequest = {
  titlu: string
  employerId?: number
  locatie?: string
  descriere?: string
  companie?: string
  salariu?: string
  tipContract?: TipContract
  status?: JobStatus
  activ?: boolean
}

type JobUpdateRequest = Partial<JobCreateRequest> & {
  versiune?: number
}

type JobSearchParams = {
  titlu?: string
  q?: string
  locatie?: string
  tipContract?: TipContract
  page?: number
  size?: number
}

const jobsApi = {
  listJobs() {
    return httpClient.get<JobResponse[]>('/api/jobs')
  },

  createJob(payload: JobCreateRequest) {
    return httpClient.post<JobResponse>('/api/jobs', payload)
  },

  getJob(id: number) {
    return httpClient.get<JobResponse>(`/api/jobs/${id}`)
  },

  updateJob(id: number, payload: JobUpdateRequest) {
    return httpClient.put<JobResponse>(`/api/jobs/${id}`, payload)
  },

  deleteJob(id: number) {
    return httpClient.delete<void>(`/api/jobs/${id}`)
  },

  searchJobs(params: JobSearchParams = {}) {
    return httpClient.get<JobResponse[]>('/api/jobs/cauta', { params })
  },

  listActiveJobs() {
    return httpClient.get<JobResponse[]>('/api/jobs/active')
  },
}

export type { JobCreateRequest, JobResponse, JobSearchParams, JobUpdateRequest, TipContract }
export { jobsApi }
