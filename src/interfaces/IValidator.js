/**
 * Validation interface for input validation
 */
export class IValidator {
  /**
   * Validate data
   * @param {*} data - Data to validate
   * @returns {Promise<{valid: boolean, errors: Array<string>}>} Validation result
   */
  async validate(data) {
    throw new Error('validate() must be implemented by validator');
  }
}

