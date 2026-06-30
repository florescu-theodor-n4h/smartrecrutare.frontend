import axios from 'axios'

/**
 * Model pentru un job/post disponibil.
 */
export interface Job {
  id?: string | number
  title: string
  location: string
  description?: string
}

/**
 * Model pentru candidat conform Swagger.
 */
export interface Candidate {
  id?: number
  numePrenume: string
  mail: string
  tel: string
}

/**
 * Adresa implicită a backend-ului.
 */
//const DEFAULT_HOST = 'http://192.168.2.1:8080/web/'
const DEFAULT_HOST = 'http://192.168.2.1:8080/web/'

/**
 * Poate fi suprascrisă din fișierul .env
 */
const API_HOST = (import.meta.env.VITE_API_HOST as string) || DEFAULT_HOST

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
