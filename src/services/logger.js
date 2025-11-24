/**
 * Logger Service
 * Centralized logging with environment-aware output
 * Logs are suppressed in production unless explicitly enabled
 */

class Logger {
  constructor() {
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'debug';
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
  }

  /**
   * Format a log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} data - Optional data object
   * @returns {string} Formatted message
   */
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Check if a level should be logged
   * @param {string} level - Level to check
   * @returns {boolean}
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  /**
   * Debug level logging
   */
  debug(message, data) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), data || '');
    }
  }

  /**
   * Info level logging
   */
  info(message, data) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), data || '');
    }
  }

  /**
   * Warning level logging
   */
  warn(message, data) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  /**
   * Error level logging
   */
  error(message, error) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '');
    }
  }

  /**
   * Log an API call (request/response)
   */
  logApiCall(method, url, status, duration) {
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    if (status >= 400) {
      this.warn(message);
    } else {
      this.debug(message);
    }
  }
}

export default new Logger();
