import { IValidator } from '../interfaces/IValidator.js';
import { ValidationError } from '../errors/DomainError.js';

/**
 * Request Validator
 * Validates API requests
 */
export class RequestValidator extends IValidator {
  /**
   * Validate request object
   * @param {object} request - Request to validate
   * @returns {Promise<{valid: boolean, errors: Array<string>}>} Validation result
   */
  async validate(request) {
    const errors = [];

    if (!request) {
      errors.push('Request is required');
      return { valid: false, errors };
    }

    // Validate prompt
    if (!request.prompt) {
      errors.push('Request.prompt is required');
    } else if (typeof request.prompt !== 'string') {
      errors.push('Request.prompt must be a string');
    } else if (request.prompt.trim().length === 0) {
      errors.push('Request.prompt cannot be empty');
    }

    // Validate chatId if provided
    if (request.chatId !== undefined && typeof request.chatId !== 'string') {
      errors.push('Request.chatId must be a string');
    }

    // Validate data if provided
    if (request.data !== undefined && request.data !== null && typeof request.data !== 'object') {
      errors.push('Request.data must be an object or null');
    }

    // Validate options if provided
    if (request.options !== undefined) {
      if (typeof request.options !== 'object') {
        errors.push('Request.options must be an object');
      } else {
        // Validate specific option fields
        if (request.options.model && typeof request.options.model !== 'string') {
          errors.push('Request.options.model must be a string');
        }

        if (request.options.chatType && !['admin', 'user'].includes(request.options.chatType)) {
          errors.push('Request.options.chatType must be "admin" or "user"');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and throw if invalid
   * @param {object} request - Request to validate
   * @throws {ValidationError} If validation fails
   */
  async validateOrThrow(request) {
    const result = await this.validate(request);
    if (!result.valid) {
      throw new ValidationError(
        `Request validation failed: ${result.errors.join(', ')}`,
        'request',
        request
      );
    }
    return result;
  }
}

