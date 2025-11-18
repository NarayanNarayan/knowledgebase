/**
 * Response Formatter
 * Formats responses consistently
 */
export class ResponseFormatter {
  /**
   * Format successful response
   * @param {*} data - Response data
   * @param {object} metadata - Optional metadata
   * @returns {object} Formatted response
   */
  static success(data, metadata = {}) {
    return {
      success: true,
      data,
      ...metadata,
    };
  }

  /**
   * Format error response
   * @param {Error} error - Error object
   * @param {object} metadata - Optional metadata
   * @returns {object} Formatted error response
   */
  static error(error, metadata = {}) {
    return {
      success: false,
      error: {
        message: error.message || 'An error occurred',
        name: error.name || 'Error',
        ...(error.code && { code: error.code }),
        ...(error.statusCode && { statusCode: error.statusCode }),
      },
      ...metadata,
    };
  }

  /**
   * Format agent response
   * @param {string} response - Agent response text
   * @param {Array<string>} agentsUsed - Agents used
   * @param {object} metadata - Additional metadata
   * @returns {object} Formatted agent response
   */
  static agentResponse(response, agentsUsed = [], metadata = {}) {
    return {
      success: true,
      response,
      agentsUsed,
      ...metadata,
    };
  }

  /**
   * Format paginated response
   * @param {Array} items - Items array
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @returns {object} Formatted paginated response
   */
  static paginated(items, page, limit, total) {
    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}

