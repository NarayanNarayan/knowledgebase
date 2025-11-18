import { IAgent } from '../interfaces/IAgent.js';
import { AGENT_TYPES } from '../constants/AgentTypes.js';

/**
 * Agent Registry
 * Manages agent registration and lookup for dynamic agent execution
 * Replaces hardcoded if statements with registry pattern
 */
export class AgentRegistry {
  constructor() {
    this.agents = new Map();
  }

  /**
   * Register an agent
   * @param {string} agentType - Agent type (from AGENT_TYPES)
   * @param {object} agent - Agent instance (must have execute method)
   */
  register(agentType, agent) {
    if (!Object.values(AGENT_TYPES).includes(agentType)) {
      throw new Error(`Invalid agent type: ${agentType}`);
    }
    
    if (!agent || typeof agent.execute !== 'function') {
      throw new Error('Agent must have an execute method');
    }
    
    this.agents.set(agentType, agent);
  }

  /**
   * Get agent by type
   * @param {string} agentType - Agent type
   * @returns {IAgent|null} Agent instance or null if not found
   */
  get(agentType) {
    return this.agents.get(agentType) || null;
  }

  /**
   * Check if agent is registered
   * @param {string} agentType - Agent type
   * @returns {boolean} Whether agent is registered
   */
  has(agentType) {
    return this.agents.has(agentType);
  }

  /**
   * Get all registered agent types
   * @returns {Array<string>} Array of registered agent types
   */
  getRegisteredTypes() {
    return Array.from(this.agents.keys());
  }

  /**
   * Execute agent if registered and enabled
   * @param {string} agentType - Agent type
   * @param {string} prompt - User prompt
   * @param {object} context - Execution context
   * @param {object} data - Optional data
   * @returns {Promise<object|null>} Agent result or null if not executed
   */
  async executeAgent(agentType, prompt, context, data = null) {
    const agent = this.get(agentType);
    
    if (!agent) {
      return null;
    }

    // Check if agent can handle this request
    if (await agent.canHandle && !(await agent.canHandle(prompt, context))) {
      return null;
    }

    // Execute agent
    return await agent.execute(prompt, { ...context, data });
  }

  /**
   * Execute multiple agents based on routing
   * @param {Array<string>} agentTypes - Array of agent types to execute
   * @param {string} prompt - User prompt
   * @param {object} context - Execution context
   * @param {object} data - Optional data
   * @returns {Promise<Array<{agent: string, result: object}>>} Array of agent results
   */
  async executeAgents(agentTypes, prompt, context, data = null) {
    const results = [];

    for (const agentType of agentTypes) {
      const result = await this.executeAgent(agentType, prompt, context, data);
      if (result) {
        results.push({
          agent: agentType,
          result,
        });
      }
    }

    return results;
  }

  /**
   * Clear all registered agents (useful for testing)
   */
  clear() {
    this.agents.clear();
  }
}

