import { IValidator } from '../interfaces/IValidator.js';
import { ValidationError } from '../errors/DomainError.js';

/**
 * Context Validator
 * Validates execution context objects
 */
export class ContextValidator extends IValidator {
  /**
   * Validate context object
   * @param {object} context - Context to validate
   * @returns {Promise<{valid: boolean, errors: Array<string>}>} Validation result
   */
  async validate(context) {
    const errors = [];

    if (!context) {
      errors.push('Context is required');
      return { valid: false, errors };
    }

    // Validate model
    if (context.model && typeof context.model !== 'string') {
      errors.push('Context.model must be a string');
    }

    // Validate chatType
    if (context.chatType && !['admin', 'user'].includes(context.chatType)) {
      errors.push('Context.chatType must be "admin" or "user"');
    }

    // Validate permissions
    if (context.permissions && typeof context.permissions !== 'object') {
      errors.push('Context.permissions must be an object');
    }

    // Validate chatHistory
    if (context.chatHistory && !Array.isArray(context.chatHistory)) {
      errors.push('Context.chatHistory must be an array');
    }

    // Validate RAG-specific options
    if (context.useHybrid !== undefined && typeof context.useHybrid !== 'boolean') {
      errors.push('Context.useHybrid must be a boolean');
    }

    if (context.useIterative !== undefined && typeof context.useIterative !== 'boolean') {
      errors.push('Context.useIterative must be a boolean');
    }

    if (context.maxIterations !== undefined) {
      if (typeof context.maxIterations !== 'number' || context.maxIterations < 1 || context.maxIterations > 10) {
        errors.push('Context.maxIterations must be a number between 1 and 10');
      }
    }

    if (context.confidenceThreshold !== undefined) {
      if (typeof context.confidenceThreshold !== 'number' || 
          context.confidenceThreshold < 0 || context.confidenceThreshold > 1) {
        errors.push('Context.confidenceThreshold must be a number between 0 and 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and throw if invalid
   * @param {object} context - Context to validate
   * @throws {ValidationError} If validation fails
   */
  async validateOrThrow(context) {
    const result = await this.validate(context);
    if (!result.valid) {
      throw new ValidationError(
        `Context validation failed: ${result.errors.join(', ')}`,
        'context',
        context
      );
    }
    return result;
  }
}

