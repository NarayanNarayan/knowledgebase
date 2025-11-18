import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PromptTemplates } from '../prompts/PromptTemplates.js';
import { AGENT_TYPES } from '../constants/AgentTypes.js';

/**
 * Router Agent - Analyzes prompts and routes to appropriate agents
 * Refactored to use constants and prompt templates
 */
export class RouterAgent {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  /**
   * Analyze prompt and determine routing
   */
  async route(prompt, data, context) {
    const model = this.modelFactory.getModel(context.model || 'gemini-pro');

    const routingPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.ROUTER_SYSTEM_PROMPT],
      ['user', PromptTemplates.format(PromptTemplates.ROUTER_USER_PROMPT, {
        prompt,
        hasData: data ? 'yes' : 'no',
        chatType: context.chatType || 'user',
      })],
    ]);

    const chain = routingPrompt.pipe(model);
    const response = await chain.invoke({
      prompt,
      hasData: data ? 'yes' : 'no',
      chatType: context.chatType || 'user',
    });

    try {
      // Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure agents array uses constants
        if (parsed.agents) {
          parsed.agents = parsed.agents.map(agent => {
            // Map string agent names to constants
            const upperAgent = agent.toUpperCase();
            if (Object.values(AGENT_TYPES).includes(upperAgent)) {
              return upperAgent;
            }
            return agent;
          });
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing routing response:', error);
    }

    // Default routing using constant
    return {
      agents: [AGENT_TYPES.DIRECT_RESPONSE],
      reasoning: 'Default routing',
      needsModel: true,
      dataProcessing: 'none',
    };
  }
}

