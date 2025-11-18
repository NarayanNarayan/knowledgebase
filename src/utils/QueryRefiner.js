import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PromptTemplates } from '../prompts/PromptTemplates.js';
import { ValidationError } from '../errors/DomainError.js';

/**
 * Query Refiner
 * Refines search queries based on evaluation feedback
 */
export class QueryRefiner {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  /**
   * Refine query based on evaluation and current context
   * @param {string} originalQuery - Original user query
   * @param {string} currentContext - Current retrieved context
   * @param {object} evaluation - Evaluation result from RetrievalEvaluator
   * @param {object} model - LLM model to use
   * @returns {Promise<string>} Refined query
   */
  async refine(originalQuery, currentContext, evaluation, model = null) {
    if (!model) {
      throw new ValidationError('Model is required for query refinement', 'model');
    }

    const refinementPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.QUERY_REFINEMENT_SYSTEM],
      ['user', PromptTemplates.format(PromptTemplates.QUERY_REFINEMENT_USER, {
        originalQuery,
        currentContext: currentContext.substring(0, 1500),
        missingInfo: evaluation.missingInformation || 'general information',
        reasoning: evaluation.reasoning || '',
      })],
    ]);

    const chain = refinementPrompt.pipe(model);
    const response = await chain.invoke({
      originalQuery,
      currentContext: currentContext.substring(0, 1500),
      missingInfo: evaluation.missingInformation || 'general information',
      reasoning: evaluation.reasoning || '',
    });

    // Extract the refined query (take first line or paragraph)
    const refinedQuery = response.content.trim().split('\n')[0].trim();
    return refinedQuery || originalQuery;
  }
}

