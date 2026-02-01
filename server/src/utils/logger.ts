/**
 * Production Logger
 * Configurable logging system with different levels to control log output and costs
 * 
 * Usage:
 *   - Set LOG_LEVEL environment variable: none, error, warn, info, debug
 *   - Production recommendation: LOG_LEVEL=error (minimal costs)
 *   - Zero cost option: LOG_LEVEL=none (no logs at all)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 999  // Never log anything
};

const currentLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
const currentLevelNum = LOG_LEVELS[currentLevel] || LOG_LEVELS.info;

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= currentLevelNum;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', this.formatTimestamp(), ...args);
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.log('[INFO]', this.formatTimestamp(), ...args);
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', this.formatTimestamp(), ...args);
    }
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', this.formatTimestamp(), ...args);
    }
  }

  // Game-specific convenience methods
  gameEvent(event: string, roomCode: string, data?: any) {
    this.info(`🎮 ${event}`, `Room: ${roomCode}`, data || '');
  }

  cleanup(message: string, data?: any) {
    this.info(`🧹 ${message}`, data || '');
  }

  memory(message: string, data?: any) {
    this.debug(`💾 ${message}`, data || '');
  }

  connection(message: string, data?: any) {
    this.debug(`🔌 ${message}`, data || '');
  }
}

export const logger = new Logger();

// Example usage:
// logger.info('Server started on port', PORT);
// logger.error('Failed to create room', error);
// logger.gameEvent('Room created', 'ABC123', { players: 2 });
// logger.cleanup('Cleaned up stale rooms', { count: 3 });
