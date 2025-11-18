import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { RetrievalEvaluator } from '../utils/RetrievalEvaluator.js';
import { QueryRefiner } from '../utils/QueryRefiner.js';
import { RAGContextBuilder } from '../utils/RAGContextBuilder.js';
import { PromptTemplates } from '../prompts/PromptTemplates.js';

/**
 * RAG Agent - Handles document retrieval and question answering
 * Supports:
 * - Hybrid retrieval (vector + graph-based)
 * - Dynamic/Iterative RAG with query refinement and multi-pass retrieval
 * Refactored to use extracted utility classes
 */
export class RAGAgent {
  constructor(modelFactory, storageService, embeddingService, retrievalEvaluator = null, queryRefiner = null, contextBuilder = null) {
    this.modelFactory = modelFactory;
    this.storage = storageService;
    this.embedding = embeddingService;
    
    // Use injected utilities or create new ones
    this.evaluator = retrievalEvaluator || new RetrievalEvaluator(modelFactory);
    this.refiner = queryRefiner || new QueryRefiner(modelFactory);
    this.contextBuilder = contextBuilder || new RAGContextBuilder();
  }

  /**
   * Execute RAG query with hybrid and iterative capabilities
   * @param {string} prompt - User query
   * @param {object} context - Execution context
   * @param {object} context.useHybrid - Use hybrid search (vector + graph) (default: true)
   * @param {object} context.useIterative - Use iterative refinement (default: false)
   * @param {object} context.maxIterations - Maximum iterations for iterative RAG (default: 3)
   * @param {object} context.confidenceThreshold - Minimum confidence to stop iterating (default: 0.8)
   * @param {object} context.graphDepth - Graph traversal depth for hybrid search (default: 1)
   * @param {object} context.ragLimit - Number of documents to retrieve (default: 5)
   * @param {object} context.ragThreshold - Similarity threshold (default: 0.7)
   */
  async execute(prompt, context = {}) {
    const model = this.modelFactory.getModel(context.model || 'gemini-pro');
    const useHybrid = context.useHybrid !== false; // Default to true
    const useIterative = context.useIterative === true; // Default to false
    const maxIterations = context.maxIterations || 3;
    const confidenceThreshold = context.confidenceThreshold || 0.8;
    const graphDepth = context.graphDepth || 1;
    const ragLimit = context.ragLimit || 5;
    const ragThreshold = context.ragThreshold || 0.7;

    if (useIterative) {
      return await this.executeIterative(prompt, {
        ...context,
        model,
        useHybrid,
        maxIterations,
        confidenceThreshold,
        graphDepth,
        ragLimit,
        ragThreshold,
      });
    } else {
      return await this.executeSinglePass(prompt, {
        ...context,
        model,
        useHybrid,
        graphDepth,
        ragLimit,
        ragThreshold,
      });
    }
  }

  /**
   * Execute single-pass RAG (with optional hybrid search)
   */
  async executeSinglePass(prompt, context) {
    const { model, useHybrid, graphDepth, ragLimit, ragThreshold } = context;

    // Generate query embedding
    const queryEmbedding = await this.embedding.embed(prompt);

    // Perform retrieval (hybrid or vector-only)
    let searchResults;
    if (useHybrid) {
      searchResults = await this.storage.hybridSearch(prompt, queryEmbedding, {
        vectorLimit: ragLimit,
        vectorThreshold: ragThreshold,
        graphDepth,
      });
    } else {
      searchResults = await this.storage.postgres.vectorSearch(
        queryEmbedding,
        ragLimit,
        ragThreshold
      );
    }

    if (searchResults.length === 0) {
      return {
        response: 'No relevant documents found in the knowledge base.',
        sources: [],
        retrievalMethod: useHybrid ? 'hybrid' : 'vector',
      };
    }

    // Build context from search results (including graph context if available)
    const contextText = this.contextBuilder.buildContextText(searchResults, useHybrid);

    const ragPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.RAG_SYSTEM_PROMPT],
      ['user', PromptTemplates.RAG_USER_PROMPT],
    ]);

    const chain = ragPrompt.pipe(model);
    const response = await chain.invoke({
      context: contextText,
      question: prompt,
    });

    return {
      response: response.content,
      sources: this.contextBuilder.formatSources(searchResults),
      retrievalMethod: useHybrid ? 'hybrid' : 'vector',
    };
  }

  /**
   * Execute iterative/dynamic RAG with query refinement
   */
  async executeIterative(prompt, context) {
    const {
      model,
      useHybrid,
      maxIterations,
      confidenceThreshold,
      graphDepth,
      ragLimit,
      ragThreshold,
    } = context;

    let currentQuery = prompt;
    let allResults = [];
    let iteration = 0;
    let previousContext = '';
    const seenDocIds = new Set();

    while (iteration < maxIterations) {
      iteration++;

      // Generate query embedding (potentially refined)
      const queryEmbedding = await this.embedding.embed(currentQuery);

      // Perform retrieval
      let searchResults;
      if (useHybrid) {
        searchResults = await this.storage.hybridSearch(currentQuery, queryEmbedding, {
          vectorLimit: ragLimit * 2, // Get more results for iterative refinement
          vectorThreshold: ragThreshold * 0.9, // Lower threshold for broader search
          graphDepth,
        });
      } else {
        searchResults = await this.storage.postgres.vectorSearch(
          queryEmbedding,
          ragLimit * 2,
          ragThreshold * 0.9
        );
      }

      // Filter out already seen documents and add new ones
      const newResults = searchResults.filter(r => !seenDocIds.has(r.doc_id));
      newResults.forEach(r => seenDocIds.add(r.doc_id));
      allResults.push(...newResults);

      if (newResults.length === 0 && allResults.length === 0) {
        return {
          response: 'No relevant documents found in the knowledge base after iterative search.',
          sources: [],
          retrievalMethod: useHybrid ? 'iterative-hybrid' : 'iterative-vector',
          iterations: iteration,
        };
      }

      // Build context from accumulated results
      const contextText = this.contextBuilder.buildContextText(allResults.slice(0, ragLimit * 2), useHybrid);

      // Evaluate if we have enough information or need to refine
      if (iteration < maxIterations) {
        const evaluation = await this.evaluator.evaluate(
          prompt,
          contextText,
          previousContext,
          model
        );

        if (evaluation.confidence >= confidenceThreshold && evaluation.needsRefinement === false) {
          // Sufficient information found, generate final response
          break;
        }

        // Refine query if needed
        if (evaluation.needsRefinement) {
          currentQuery = await this.refiner.refine(
            prompt,
            contextText,
            evaluation,
            model
          );
          previousContext = contextText;
        } else {
          // We have enough but confidence is low, continue to gather more
          previousContext = contextText;
        }
      } else {
        previousContext = contextText;
      }
    }

    // Generate final response with accumulated context
    const finalContextText = this.contextBuilder.buildContextText(
      allResults.slice(0, ragLimit),
      useHybrid
    );

    const ragPrompt = ChatPromptTemplate.fromMessages([
      ['system', PromptTemplates.RAG_ITERATIVE_SYSTEM_PROMPT],
      ['user', PromptTemplates.RAG_USER_PROMPT],
    ]);

    const chain = ragPrompt.pipe(model);
    const response = await chain.invoke({
      context: finalContextText,
      question: prompt,
    });

    return {
      response: response.content,
      sources: this.contextBuilder.formatSources(allResults.slice(0, ragLimit)),
      retrievalMethod: useHybrid ? 'iterative-hybrid' : 'iterative-vector',
      iterations: iteration,
      totalResultsRetrieved: allResults.length,
    };
  }

  /**
   * Ingest user profile into context
   */
  async executeWithProfile(prompt, userProfile, context) {
    if (userProfile) {
      const profileContext = this.formatProfile(userProfile);
      const enhancedPrompt = `${profileContext}\n\nUser question: ${prompt}`;
      return await this.execute(enhancedPrompt, context);
    }
    return await this.execute(prompt, context);
  }

  /**
   * Format user profile for context
   */
  formatProfile(profile) {
    const parts = [];
    if (profile.username) parts.push(`User: ${profile.username}`);
    if (profile.email) parts.push(`Email: ${profile.email}`);
    if (profile.preferences) parts.push(`Preferences: ${JSON.stringify(profile.preferences)}`);
    return parts.join('\n');
  }
}

