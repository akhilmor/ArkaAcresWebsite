interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, any>
}

class ServerLogBuffer {
  private logs: LogEntry[] = []
  private maxSize = 200

  append(level: LogEntry['level'], message: string, context?: Record<string, any>) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    })

    // Keep only last maxSize entries
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize)
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.append('info', message, context)
    console.log(`[INFO] ${message}`, context || '')
  }

  warn(message: string, context?: Record<string, any>) {
    this.append('warn', message, context)
    console.warn(`[WARN] ${message}`, context || '')
  }

  error(message: string, context?: Record<string, any>) {
    this.append('error', message, context)
    console.error(`[ERROR] ${message}`, context || '')
  }

  getLogs(limit?: number): LogEntry[] {
    const logs = [...this.logs].reverse() // Most recent first
    return limit ? logs.slice(0, limit) : logs
  }

  clear() {
    this.logs = []
  }
}

export const serverLogBuffer = new ServerLogBuffer()

