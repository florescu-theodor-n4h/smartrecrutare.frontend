import { Exclude } from '@/decorators/Exclude'
import { Field } from '@/decorators/Field'
import { AbstractDTOEntity } from '@/models/AbstractDTOEntity'
import { httpClient } from '@/services/httpClient'
import type { AxiosInstance, AxiosResponse } from 'axios'

export enum TipContract {
  FullTime = 'Full-time',
  PartTime = 'Part-time',
  Contract = 'Contract',
  Internship = 'Internship',
}

/**
 * Model pentru un job/post disponibil.
 */
export class Job extends AbstractDTOEntity {
  @Exclude()
  id?: number

  @Field()
  titlu: string = 'Job default'

  @Field()
  locatie: string = 'Romania'

  @Field()
  descriere?: string

  @Field()
  actualizatLa?: string

  @Field()
  companie: string = 'Companie Default'

  @Field()
  creatLa: string = 'astazi'

  @Field()
  salariu /*este optional, coform Job.java*/?: string

  @Field()
  tipContract: TipContract = TipContract.Contract

  @Field()
  activ: boolean = false
}

/**
 * Model pentru candidat conform Swagger.
 */
export class Candidate {
  @Exclude()
  id?: number

  @Field()
  numePrenume: string = 'Nume'

  @Field()
  mail: string = 'E.Mail@example.com'

  @Field()
  tel: string = '0700000000'
}

//type PostCandidate = Omit<Candidate, 'id'>

export interface IJobsApi {
  getJobs(): Promise<AxiosResponse<Job[]>>
  getJob(id: string | number): Promise<AxiosResponse<Job>>
  createJob(payload: Job): Promise<AxiosResponse<Job>>
  updateJob(id: string | number, payload: Job): Promise<AxiosResponse<Job>>
  deleteJob(id: string | number): Promise<AxiosResponse<void>>
}

export interface ICandidatesApi {
  getCandidates(): Promise<AxiosResponse<Candidate[]>>
  createCandidate(payload: Candidate): Promise<AxiosResponse<Candidate>>
  updateCandidate(id: number, payload: Candidate): Promise<AxiosResponse<Candidate>>
  deleteCandidate(numeCandidat: string): Promise<AxiosResponse<void>>
}

export abstract class BaseApiService {
  constructor(protected readonly api: AxiosInstance) {}
}

export class JobsApiService extends BaseApiService implements IJobsApi {
  getJobs(): Promise<AxiosResponse<Job[]>> {
    return this.api.get('/api/jobs')
  }

  getJob(id: string | number): Promise<AxiosResponse<Job>> {
    return this.api.get(`/api/jobs/${id}`)
  }

  createJob(payload: Job): Promise<AxiosResponse<Job>> {
    return this.api.post('/api/jobs', payload)
  }

  updateJob(id: string | number, payload: Job): Promise<AxiosResponse<Job>> {
    return this.api.put(`/api/jobs/${id}`, payload)
  }

  deleteJob(id: string | number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/api/jobs/${id}`)
  }
}

export class CandidatesApiService extends BaseApiService implements ICandidatesApi {
  getCandidates(): Promise<AxiosResponse<Candidate[]>> {
    return this.api.get('/api/candidati')
  }

  createCandidate(payload: Candidate): Promise<AxiosResponse<Candidate>> {
    return this.api.post('/api/candidati', payload)
  }

  updateCandidate(id: number, payload: Candidate): Promise<AxiosResponse<Candidate>> {
    return this.api.put(`/api/candidati/${id}`, payload)
  }

  deleteCandidate(numeCandidat: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/api/candidati/${encodeURIComponent(numeCandidat)}`)
  }
}

export class ApiFacade implements IJobsApi, ICandidatesApi {
  constructor(
    private readonly jobsApi: IJobsApi,
    private readonly candidatesApi: ICandidatesApi,
    public readonly axios: AxiosInstance,
  ) {}

  getJobs(): Promise<AxiosResponse<Job[]>> {
    return this.jobsApi.getJobs()
  }

  getJob(id: string | number): Promise<AxiosResponse<Job>> {
    return this.jobsApi.getJob(id)
  }

  createJob(payload: Job): Promise<AxiosResponse<Job>> {
    return this.jobsApi.createJob(payload)
  }

  updateJob(id: string | number, payload: Job): Promise<AxiosResponse<Job>> {
    return this.jobsApi.updateJob(id, payload)
  }

  deleteJob(id: string | number): Promise<AxiosResponse<void>> {
    return this.jobsApi.deleteJob(id)
  }

  getCandidates(): Promise<AxiosResponse<Candidate[]>> {
    return this.candidatesApi.getCandidates()
  }

  createCandidate(payload: Candidate): Promise<AxiosResponse<Candidate>> {
    return this.candidatesApi.createCandidate(payload)
  }

  updateCandidate(id: number, payload: Candidate): Promise<AxiosResponse<Candidate>> {
    return this.candidatesApi.updateCandidate(id, payload)
  }

  deleteCandidate(numeCandidat: string): Promise<AxiosResponse<void>> {
    return this.candidatesApi.deleteCandidate(numeCandidat)
  }
}

export const apiClient = new ApiFacade(
  new JobsApiService(httpClient),
  new CandidatesApiService(httpClient),
  httpClient,
)

export default apiClient
