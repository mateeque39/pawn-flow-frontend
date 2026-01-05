/**
 * API Configuration Service
 * Centralized configuration for all API calls
 * Supports environment-based configuration for dev, staging, and production
 */

class ApiConfig {
  constructor() {
    // Runtime detection: check if running on Railway by hostname
    // This allows the same build to work in dev, staging, and production
    let baseURL = process.env.REACT_APP_API_URL;
    
    // If no env var, detect at runtime based on hostname
    if (!baseURL && typeof window !== 'undefined') {
      if (window.location.hostname.includes('railway.app')) {
        baseURL = 'https://pawnflow-backend-production.up.railway.app';
      } else if (window.location.hostname.includes('localhost')) {
        baseURL = 'http://localhost:5000';
      }
    }
    
    this.baseURL = baseURL || 'http://localhost:5000';
    this.timeout = parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 30000;
    this.env = process.env.REACT_APP_ENV || 'development';
    
    // Log configuration on initialization (for debugging)
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[ApiConfig] Environment: ${this.env}, Base URL: ${this.baseURL}`);
    }
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

const apiConfig = new ApiConfig();
export default apiConfig;
