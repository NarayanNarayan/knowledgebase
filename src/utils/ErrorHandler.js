import { DomainError } from '../errors/DomainError.js';

/**
 * Error Handler Utility
 * Standardizes error handling and formatting
 */
export class ErrorHandler {
  /**
   * Handle error and format response
   * @param {Error} error - Error to handle
   * @param {object} options - Handler options
   * @returns {object} Formatted error response
   */
  static handle(error, options = {}) {
    const { includeStackTrace = false, logError = true } = options;

    if (logError) {
      console.error('Error handled:', error);
    }

    // If it's a domain error, use its toJSON method
    if (error instanceof DomainError) {
      const response = {
        success: false,
        error: {
          ...error.toJSON(),
        },
      };

      if (includeStackTrace && error.stack) {
        response.error.stack = error.stack;
      }

      return response;
    }

    // Generic error handling
    const response = {
      success: false,
      error: {
        name: error.name || 'Error',
        message: error.message || 'An unknown error occurred',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    };

    if (includeStackTrace && error.stack) {
      response.error.stack = error.stack;
    }

    return response;
  }

  /**
   * Handle async errors in a promise
   * @param {Promise} promise - Promise that might reject
   * @param {object} options - Handler options
   * @returns {Promise<{success: boolean, data?: any, error?: object}>} Result with success flag
   */
  static async handleAsync(promise, options = {}) {
    try {
      const data = await promise;
      return { success: true, data };
    } catch (error) {
      return this.handle(error, options);
    }
  }

  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function
   */
  static wrap(fn) {
    return async (...args) => {
      try {
        const result = await fn(...args);
        return { success: true, data: result };
      } catch (error) {
        return this.handle(error);
      }
    };
  }
}

