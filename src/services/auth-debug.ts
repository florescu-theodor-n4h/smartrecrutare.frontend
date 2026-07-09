type LogLevel = 'log' | 'warn' | 'error' | 'info'

function toRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value as Record<string, unknown>
}

function safeConsoleWrite(level: LogLevel, message: string, details?: unknown): void {
  try {
    const timestamp = new Date().toISOString()
    const prefix = '[AUTH-TRACE]'
    const header = `${prefix} ${timestamp} ${message}`
    // refactor no ? operator
    let consoleTarget: (message?: unknown, ...optionalParams: unknown[]) => void = console.log
    switch (level) {
      case 'warn':
        consoleTarget = console.warn || console.log
        break
      case 'error':
        consoleTarget = console.error || console.log
        break
      case 'info':
        consoleTarget = console.info || console.log
        break
      default:
        consoleTarget = console.log
    }

    if (!consoleTarget) {
      return
    }

    if (details === undefined) {
      consoleTarget.call(console, header)
      return
    }

    const detailsRecord = toRecord(details)
    if (!detailsRecord) {
      consoleTarget.call(console, header, details)
      return
    }

    const safeDetails: Record<string, unknown> = {}
    const keys = Object.keys(detailsRecord)
    for (const key of keys) {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        safeDetails[key] = '[REDACTED]'
      } else {
        safeDetails[key] = detailsRecord[key]
      }
    }

    consoleTarget.call(console, header, safeDetails)
  } catch {
    // Intentionally swallow diagnostics errors to avoid impacting runtime behavior.
  }
}

function authBanner(message: string, details?: unknown): void {
  safeConsoleWrite('log', '============================================================')
  safeConsoleWrite('log', `AUTH EVENT: ${message}`, details)
  safeConsoleWrite('log', '============================================================')
}

function authLog(message: string, details?: unknown): void {
  safeConsoleWrite('log', message, details)
}

function authWarn(message: string, details?: unknown): void {
  safeConsoleWrite('warn', message, details)
}

function authError(message: string, details?: unknown): void {
  safeConsoleWrite('error', message, details)
}

function authInfo(message: string, details?: unknown): void {
  safeConsoleWrite('info', message, details)
}

export { authBanner, authError, authInfo, authLog, authWarn }
