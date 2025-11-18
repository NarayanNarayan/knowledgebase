/**
 * Base domain error class
 */
export class DomainError extends Error {
  constructor(message, code = 'DOMAIN_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON representation
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends DomainError {
  constructor(message, field = null, value = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
    this.value = value;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    };
  }
}

/**
 * Permission error
 */
export class PermissionError extends DomainError {
  constructor(message, resource = null, operation = null) {
    super(message, 'PERMISSION_ERROR', 403);
    this.resource = resource;
    this.operation = operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      operation: this.operation,
    };
  }
}

/**
 * Not found error
 */
export class NotFoundError extends DomainError {
  constructor(message, resource = null, id = null) {
    super(message, 'NOT_FOUND', 404);
    this.resource = resource;
    this.id = id;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      id: this.id,
    };
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends DomainError {
  constructor(message, configKey = null) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.configKey = configKey;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
    };
  }
}

