import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const rawHost =
  (import.meta.env.VITE_API_HOST as string | undefined) ||
  (import.meta.env.VITE_BACKEND as string | undefined)

function normalizeBaseUrl(value?: string): string {
  const trimmed = value?.trim()
  if (trimmed) {
    return trimmed.replace(/\/$/, '')
  }

  // Safe fallback for local development when env files are missing.
  return 'http://localhost:8080'
}

const API_BASE_URL = normalizeBaseUrl(rawHost)

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authBearerToken: string | null = null

interface HttpLogger {
  info(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
}

class BrowserConsoleHttpLogger implements HttpLogger {
  info(message: string, meta: Record<string, unknown> = {}): void {
    console.info(`[HTTP] ${message}`, meta)
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    console.error(`[HTTP] ${message}`, meta)
  }
}

const logger: HttpLogger = new BrowserConsoleHttpLogger()

function fullUrl(config: InternalAxiosRequestConfig): string {
  return `${config.baseURL ?? API_BASE_URL}${config.url ?? ''}`
}

httpClient.interceptors.request.use((config) => {
  if (authBearerToken && !config.headers?.Authorization) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${authBearerToken}`)
    config.headers = headers
  }

  logger.info('Request started', {
    method: (config.method || 'GET').toUpperCase(),
    url: fullUrl(config),
  })
  return config
})

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.info('Request completed', {
      method: (response.config.method || 'GET').toUpperCase(),
      url: fullUrl(response.config as InternalAxiosRequestConfig),
      status: response.status,
    })
    return response
  },
  (error: AxiosError) => {
    logger.error('Request failed', {
      method: (error.config?.method || 'GET').toUpperCase(),
      url: error.config ? fullUrl(error.config as InternalAxiosRequestConfig) : 'unknown',
      status: error.response?.status,
      message: error.message,
    })
    return Promise.reject(error)
  },
)

function getActiveApiBaseUrl(): string {
  return API_BASE_URL
}

function setHttpAuthBearerToken(token: string): void {
  authBearerToken = token
}

function clearHttpAuthBearerToken(): void {
  authBearerToken = null
}

function getHttpAuthBearerToken(): string | null {
  return authBearerToken
}

export {
  API_BASE_URL,
  clearHttpAuthBearerToken,
  getActiveApiBaseUrl,
  getHttpAuthBearerToken,
  httpClient,
  setHttpAuthBearerToken,
}
