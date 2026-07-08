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

function isTrueFlag(value?: string): boolean {
  return (value || '').trim().toLowerCase() === 'true'
}

function normalizeAuthMode(value?: string): AuthMode | null {
  const normalized = (value || '').trim().toLowerCase()

  if (normalized === 'auth0') {
    return 'auth0'
  }

  if (normalized === 'local') {
    return 'local'
  }

  return null
}

function getPreferredAuthMode(config: AuthEnvironmentConfig): AuthMode {
  const explicitPreferred =
    normalizeAuthMode(config.VITE_PREFERRED_AUTH) ||
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
  getPreferredAuthMode,
  useAuthLoginPlugin,
}
