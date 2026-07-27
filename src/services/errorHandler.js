/**
 * HTTP Error Handler
 * Centralized error handling for API responses
 */

class HttpError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'HttpError';
  }
}

/**
 * Parse error response from server
 * @param {object} error - Axios error object
 * @returns {object} Normalized error object
 */
export function parseError(error) {
  const status = error?.response?.status || 0;
  const responseData = error?.response?.data || {};
  const message = responseData?.message || error?.message || 'An error occurred';

  return {
    status,
    message,
    data: responseData,
    isTimeout: error?.code === 'ECONNABORTED',
    isNetworkError: !error?.response && error?.request,
    isServerError: status >= 500,
    isClientError: status >= 400 && status < 500,
    isValidationError: status === 400 || status === 422,
  };
}

/**
 * Get user-friendly error message
 * @param {object} error - Parsed error object
 * @returns {string} User-friendly message
 */
export function getErrorMessage(error) {
  if (error.isTimeout) {
    return 'Request timed out. Please try again.';
  }

  if (error.isNetworkError) {
    return 'Network error. Please check your connection.';
  }

  if (error.isServerError) {
    return 'Server error. Please try again later or contact support.';
  }

  if (error.isValidationError) {
    return error.message || 'Invalid input. Please check your data.';
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export { HttpError };
