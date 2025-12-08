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
  let responseData = error?.response?.data || {};
  let message = error?.message || 'An error occurred';

  // Handle blob responses (e.g., from PDF download endpoints with errors)
  if (responseData instanceof Blob) {
    // For blob, we can't extract the message synchronously
    // Just indicate it's a blob error
    message = `Server error (HTTP ${status})`;
  } else if (typeof responseData === 'object' && responseData !== null) {
    message = responseData?.message || message;
  } else if (typeof responseData === 'string') {
    message = responseData;
  }

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
