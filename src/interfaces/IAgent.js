/**
 * Base interface for all agents
 * Ensures consistent contract for agent implementations
 */
export class IAgent {
  /**
   * Execute agent with given prompt and context
   * @param {string} prompt - User prompt/query
   * @param {object} context - Execution context
   * @returns {Promise<object>} Agent execution result
   */
  async execute(prompt, context) {
    throw new Error('execute() must be implemented by agent');
  }

  /**
   * Get agent name/identifier
   * @returns {string} Agent name
   */
  getName() {
    throw new Error('getName() must be implemented by agent');
  }

  /**
   * Check if agent can handle the given prompt
   * @param {string} prompt - User prompt
   * @param {object} context - Execution context
   * @returns {Promise<boolean>} Whether agent can handle the prompt
   */
  async canHandle(prompt, context) {
    return true; // Default: agent can always handle
  }
}

