const LOCAL_USER_ROLES = ['ADMIN', 'MANAGER', 'AUDITOR', 'GOVERNMENTAL_USER', 'USER'] as const

type LocalUserRole = (typeof LOCAL_USER_ROLES)[number]

type AuditFields = {
  creatLa?: string | null
  creatDe?: string | null
  modificatLa?: string | null
  modificatDe?: string | null
}

type VersionFields = {
  versiune?: number
  version?: number
}

type PaginaModel<TItem> = {
  continut?: TItem[]
  pagina?: number
  dimensiune?: number
  totalElemente?: number
  totalPagini?: number
  content?: TItem[]
  items?: TItem[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  total?: number
  number?: number
}

type VersionQuery = {
  version: number
}

function isLocalUserRole(value: unknown): value is LocalUserRole {
  return typeof value === 'string' && LOCAL_USER_ROLES.includes(value as LocalUserRole)
}

function withVersionParam(version: number): { params: VersionQuery } {
  return {
    params: {
      version,
    },
  }
}

export type { AuditFields, LocalUserRole, PaginaModel, VersionFields, VersionQuery }
export { isLocalUserRole, LOCAL_USER_ROLES, withVersionParam }
