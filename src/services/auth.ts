import type { Auth0VueClient } from '@auth0/auth0-vue'
import { createAuthLoginPlugin } from './auth_auth0'
import { AuthLoginKey, AuthLoginService, useAuthLoginPlugin } from './auth.contract'
import { createLocalAuthLoginPlugin } from './server-auth-user-pass'

type AuthMode = 'auth0' | 'local'

type AuthEnvironmentConfig = {
  VITE_PREFERRED_AUTH?: string
  VITE_PREFFERRED_AUTH?: string
  VITE_PREFERRED_LOGIN?: string
  VITE_DISABLE_LOCAL_LOGIN?: string
  VITE_REQUIRE_PAR?: string
  VITE_REQUIRE_JAR?: string
  VITE_USE_JAR_JWT_LOGIN?: string
}

type CreateAuthLoginServiceArgs = {
  auth0Client?: Auth0VueClient
  config: AuthEnvironmentConfig
}

type AuthEnvironmentSource = {
  VITE_PREFERRED_AUTH?: unknown
  VITE_PREFFERRED_AUTH?: unknown
  VITE_PREFERRED_LOGIN?: unknown
  VITE_DISABLE_LOCAL_LOGIN?: unknown
  VITE_REQUIRE_PAR?: unknown
  VITE_REQUIRE_JAR?: unknown
  VITE_USE_JAR_JWT_LOGIN?: unknown
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.replace(/\s+#.*$/, '').trim()
  return normalized.length > 0 ? normalized : undefined
}

function getAuthEnvironmentConfig(source: AuthEnvironmentSource): AuthEnvironmentConfig {
  return {
    VITE_PREFERRED_AUTH: readString(source.VITE_PREFERRED_AUTH),
    VITE_PREFFERRED_AUTH: readString(source.VITE_PREFFERRED_AUTH),
    VITE_PREFERRED_LOGIN: readString(source.VITE_PREFERRED_LOGIN),
    VITE_DISABLE_LOCAL_LOGIN: readString(source.VITE_DISABLE_LOCAL_LOGIN),
    VITE_REQUIRE_PAR: readString(source.VITE_REQUIRE_PAR),
    VITE_REQUIRE_JAR: readString(source.VITE_REQUIRE_JAR),
    VITE_USE_JAR_JWT_LOGIN: readString(source.VITE_USE_JAR_JWT_LOGIN),
  }
}

function sanitizeEnvValue(value?: string): string {
  return (value || '').replace(/\s+#.*$/, '').trim().toLowerCase()
}

function isTrueFlag(value?: string): boolean {
  return sanitizeEnvValue(value) === 'true'
}

function normalizeAuthMode(value?: string): AuthMode | null {
  const normalized = sanitizeEnvValue(value)

  if (normalized === 'auth0') {
    return 'auth0'
  }

  if (normalized === 'local') {
    return 'local'
  }

  return null
}

function getPreferredAuthMode(config: AuthEnvironmentConfig): AuthMode {
  const primaryPreferred = normalizeAuthMode(config.VITE_PREFERRED_AUTH)
  if (primaryPreferred) {
    return primaryPreferred
  }

  const explicitPreferred =
    normalizeAuthMode(config.VITE_PREFFERRED_AUTH) ||
    normalizeAuthMode(config.VITE_PREFERRED_LOGIN)

  const mode = explicitPreferred || 'auth0'

  if (mode === 'local' && isTrueFlag(config.VITE_DISABLE_LOCAL_LOGIN)) {
    return 'auth0'
  }

  return mode
}

function createAuthLoginService({
  auth0Client,
  config,
}: CreateAuthLoginServiceArgs): AuthLoginService {
  const mode = getPreferredAuthMode(config)

  if (mode === 'local') {
    return createLocalAuthLoginPlugin()
  }

  if (!auth0Client) {
    throw new Error('Auth0 client is required when preferred auth mode is auth0')
  }

  return createAuthLoginPlugin(auth0Client)
}

export type { AuthEnvironmentConfig, AuthMode, CreateAuthLoginServiceArgs }
export {
  AuthLoginKey,
  AuthLoginService,
  createAuthLoginService,
  getAuthEnvironmentConfig,
  getPreferredAuthMode,
  useAuthLoginPlugin,
}
