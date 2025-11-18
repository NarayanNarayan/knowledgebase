import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PromptTemplates } from '../prompts/PromptTemplates.js';

/**
 * Retrieval Evaluator
 * Evaluates retrieval quality and determines if refinement is needed
 */
export class RetrievalEvaluator {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  /**
   * Evaluate retrieval quality and determine if refinement is needed
   * @param {string} originalQuery - Original user query
   * @param {string} currentContext - Current retrieved context
   * @param {string} previousContext - Previous context (if any)
   * @param {object} model - LLM model to use
   * @returns {Promise<{confidence: number, needsRefinement: boolean, missingInformation: string|null, reasoning: string}>} Evaluation result
   */
  async evaluate(originalQuery, currentContext, previousContext = '', model = null) {
    if (!model) {
      throw new ValidationError('Model is required for evaluation', 'model');
    }

    const previousContextText = previousContext 
      ? `Previous Context (for comparison):\n${previousContext}` 
      : '';

    const evaluationPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.RETRIEVAL_EVALUATION_SYSTEM],
      ['user', PromptTemplates.format(PromptTemplates.RETRIEVAL_EVALUATION_USER, {
        query: originalQuery,
        currentContext: currentContext.substring(0, 2000),
        previousContext: previousContextText,
      })],
    ]);

    const chain = evaluationPrompt.pipe(model);
    const response = await chain.invoke({
      query: originalQuery,
      currentContext: currentContext.substring(0, 2000), // Limit context size
      previousContext: previousContext ? previousContext.substring(0, 1000) : '',
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0]);
        return {
          confidence: parseFloat(evaluation.confidence) || 0.5,
          needsRefinement: evaluation.needsRefinement === true,
          missingInformation: evaluation.missingInformation || null,
          reasoning: evaluation.reasoning || '',
        };
      }
    } catch (error) {
      console.error('Error parsing evaluation response:', error);
    }

    // Default evaluation
    return {
      confidence: 0.6,
      needsRefinement: false,
      missingInformation: null,
      reasoning: 'Unable to parse evaluation',
    };
  }
}

