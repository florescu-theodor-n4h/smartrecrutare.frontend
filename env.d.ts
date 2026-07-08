/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND?: string
  readonly VITE_API_HOST?: string
  readonly VITE_PREFERRED_AUTH?: 'auth0' | 'local'
  readonly VITE_PREFFERRED_AUTH?: 'auth0' | 'local'
  readonly VITE_PREFERRED_LOGIN?: 'auth0' | 'local'
  readonly VITE_DISABLE_LOCAL_LOGIN?: string
  readonly VITE_REQUIRE_PAR?: string
  readonly VITE_REQUIRE_JAR?: string
  readonly VITE_USE_JAR_JWT_LOGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
