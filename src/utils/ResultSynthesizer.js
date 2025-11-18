import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PromptTemplates } from '../prompts/PromptTemplates.js';

/**
 * Result Synthesizer
 * Synthesizes results from multiple agents into a coherent response
 */
export class ResultSynthesizer {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  /**
   * Synthesize results from multiple agents
   * @param {string} prompt - Original user prompt
   * @param {Array<{agent: string, result: object}>} agentResults - Results from agents
   * @param {object} context - Execution context
   * @returns {Promise<string>} Synthesized response
   */
  async synthesize(prompt, agentResults, context) {
    if (!agentResults || agentResults.length === 0) {
      throw new ValidationError('No agent results to synthesize', 'agentResults');
    }

    const model = this.modelFactory.getModel(context.model);

    // Compile all agent results
    const resultsText = agentResults.map(ar => {
      return `\n=== ${ar.agent} ===\n${JSON.stringify(ar.result, null, 2)}`;
    }).join('\n');

    const synthesisPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.RESULT_SYNTHESIS_SYSTEM],
      ['user', PromptTemplates.RESULT_SYNTHESIS_USER],
    ]);

    const chain = synthesisPrompt.pipe(model);
    const response = await chain.invoke({
      results: resultsText,
      prompt,
    });

    return response.content;
  }

  /**
   * Format agent results for display
   * @param {Array<{agent: string, result: object}>} agentResults - Agent results
   * @returns {object} Formatted results
   */
  formatResults(agentResults) {
    return {
      agents: agentResults.map(ar => ar.agent),
      results: agentResults.map(ar => ({
        agent: ar.agent,
        response: ar.result.response || ar.result,
        sources: ar.result.sources || null,
        metadata: this.extractMetadata(ar.result),
      })),
    };
  }

  /**
   * Extract metadata from agent result
   * @param {object} result - Agent result
   * @returns {object} Extracted metadata
   */
  extractMetadata(result) {
    const metadata = {};
    
    if (result.retrievalMethod) {
      metadata.retrievalMethod = result.retrievalMethod;
    }
    
    if (result.iterations) {
      metadata.iterations = result.iterations;
    }
    
    if (result.totalResultsRetrieved) {
      metadata.totalResultsRetrieved = result.totalResultsRetrieved;
    }
    
    if (result.graphData) {
      metadata.hasGraphData = true;
    }
    
    return metadata;
  }
}

