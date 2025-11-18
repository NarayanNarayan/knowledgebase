import { AGENT_TYPES } from '../constants/AgentTypes.js';

/**
 * Agent Executor
 * Executes agents based on routing decisions
 */
export class AgentExecutor {
  constructor(ragAgent, graphAgent, dataAgent) {
    this.ragAgent = ragAgent;
    this.graphAgent = graphAgent;
    this.dataAgent = dataAgent;
  }

  /**
   * Execute agents based on routing decision
   * @param {string} prompt - User prompt
   * @param {object} data - Optional data
   * @param {object} routing - Routing decision
   * @param {object} context - Execution context
   * @returns {Promise<Array<{agent: string, result: object}>>} Agent results
   */
  async executeAgents(prompt, data, routing, context) {
    const agentResults = [];

    // Execute RAG Agent
    if (routing.agents.includes(AGENT_TYPES.RAG_AGENT) && context.useRAG) {
      const ragResult = context.userProfile
        ? await this.ragAgent.executeWithProfile(prompt, context.userProfile, context)
        : await this.ragAgent.execute(prompt, context);
      agentResults.push({ agent: AGENT_TYPES.RAG_AGENT, result: ragResult });
    }

    // Execute Knowledge Graph Agent
    if (routing.agents.includes(AGENT_TYPES.KNOWLEDGE_GRAPH_AGENT) && context.useGraph) {
      const graphResult = await this.graphAgent.execute(prompt, context);
      agentResults.push({ agent: AGENT_TYPES.KNOWLEDGE_GRAPH_AGENT, result: graphResult });
    }

    // Execute Data Processing Agent
    if (routing.agents.includes(AGENT_TYPES.DATA_PROCESSING_AGENT) && context.processData && data) {
      const dataResult = await this.dataAgent.execute(prompt, data, context);
      agentResults.push({ agent: AGENT_TYPES.DATA_PROCESSING_AGENT, result: dataResult });
    }

    return agentResults;
  }

  /**
   * Get list of agents used from routing
   * @param {object} routing - Routing decision
   * @param {object} context - Execution context
   * @returns {Array<string>} List of agent types
   */
  getAgentsUsed(routing, context) {
    const agentsUsed = [];

    if (routing.agents.includes(AGENT_TYPES.RAG_AGENT) && context.useRAG) {
      agentsUsed.push(AGENT_TYPES.RAG_AGENT);
    }

    if (routing.agents.includes(AGENT_TYPES.KNOWLEDGE_GRAPH_AGENT) && context.useGraph) {
      agentsUsed.push(AGENT_TYPES.KNOWLEDGE_GRAPH_AGENT);
    }

    if (routing.agents.includes(AGENT_TYPES.DATA_PROCESSING_AGENT) && context.processData) {
      agentsUsed.push(AGENT_TYPES.DATA_PROCESSING_AGENT);
    }

    return agentsUsed;
  }
}

