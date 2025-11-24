/**
 * API Configuration Service
 * Centralized configuration for all API calls
 * Supports environment-based configuration for dev, staging, and production
 */

class ApiConfig {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.timeout = parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 30000;
    this.env = process.env.REACT_APP_ENV || 'development';
  }

  /**
   * Get the API base URL
   * @returns {string} API base URL
   */
  getBaseURL() {
    return this.baseURL;
  }

  /**
   * Get API timeout in milliseconds
   * @returns {number} Timeout in ms
   */
  getTimeout() {
    return this.timeout;
  }

  /**
   * Check if running in production
   * @returns {boolean}
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean}
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * Get default headers for all API requests
   * @returns {object} Headers object
   */
  getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Environment': this.env,
    };
  }

  /**
   * Validate configuration
   * @returns {object} Validation result with { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.baseURL) {
      errors.push('REACT_APP_API_URL is not configured');
    }

    if (this.timeout <= 0) {
      errors.push('REACT_APP_API_TIMEOUT must be greater than 0');
    }

    if (!['development', 'staging', 'production'].includes(this.env)) {
      errors.push(`REACT_APP_ENV must be one of: development, staging, production (got: ${this.env})`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new ApiConfig();
