function normalizeAuth0Domain(domain: string): string {
  return domain.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export { normalizeAuth0Domain }