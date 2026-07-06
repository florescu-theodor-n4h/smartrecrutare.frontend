import axios from 'axios'
// oxlint-disable-next-line no-unused-vars
import { Exclude } from '@/decorators/Exclude'
// oxlint-disable-next-line no-unused-vars
import { Field } from '@/decorators/Field'
import { AbstractDTOEntity } from '@/models/AbstractDTOEntity'
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
  id?: number
  titlu: string = 'Job default'
  locatie: string = 'Romania'
  descriere?: string

  actualizatLa?: string
  companie: string = 'Companie Default'
  creatLa: string = 'astazi'
  salariu /*este optional, coform Job.java*/?: string
  tipContract: TipContract = TipContract.Contract

  activ: boolean = false
}

/**
 * Model pentru candidat conform Swagger.
 */
export class Candidate {
  id?: number
  numePrenume: string = 'Nume'
  mail: string = 'E.Mail@example.com'
  tel: string = '0700000000'
}

//type PostCandidate = Omit<Candidate, 'id'>

/**
 * Adresa implicită a backend-ului.
 */
//const DEFAULT_HOST = 'http://192.168.2.1:8081/web/'
//const DEFAULT_HOST = 'http://localhost:8080'
//const BACKEND_URL=
const BACKEND_URL = import.meta.env.VITE_BACKEND

/**
 * Poate fi suprascrisă din fișierul .env
 */
const API_HOST = (import.meta.env.VITE_API_HOST as string) || BACKEND_URL

/**
 * Instanța Axios folosită pentru toate apelurile REST.
 */
const api = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default {
  // =========================
  // JOBS
  // =========================

  /**
   * Obține toate joburile.
   */
  getJobs() {
    return api.get('/api/jobs')
  },

  /**
   * Obține un job după ID.
   */
  getJob(id: string | number) {
    return api.get(`/api/jobs/${id}`)
  },

  /**
   * Creează un job nou.
   */
  createJob(payload: Job) {
    return api.post('/api/jobs', payload)
  },

  /**
   * Actualizează un job existent.
   */
  updateJob(id: string | number, payload: Job) {
    return api.put(`/api/jobs/${id}`, payload)
  },

  /**
   * Șterge un job după ID.
   */
  deleteJob(id: string | number) {
    return api.delete(`/api/jobs/${id}`)
  },

  // =========================
  // CANDIDAȚI
  // =========================

  /**
   * Obține lista tuturor candidaților.
   */
  getCandidates() {
    return api.get('/api/candidati')
  },

  /**
   * Adaugă un candidat nou.
   */
  createCandidate(payload: Candidate) {
    return api.post('/api/candidati', payload)
  },

  /**
   * Modifică datele unui candidat.
   */
  updateCandidate(id: number, payload: Candidate) {
    return api.put(`/api/candidati/${id}`, payload)
  },

  /**
   * Șterge un candidat după nume.
   * Conform endpoint-ului din Swagger:
   * DELETE /api/candidati/{numeCandidat}
   */
  deleteCandidate(numeCandidat: string) {
    return api.delete(`/api/candidati/${encodeURIComponent(numeCandidat)}`)
  },

  /**
   * Expune instanța Axios pentru utilizări avansate.
   */
  axios: api,
}
