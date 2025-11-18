import { IRetriever } from '../interfaces/IRetriever.js';

/**
 * Vector Retrieval Strategy
 * Simple vector similarity search
 * Implements IRetriever interface
 */
export class VectorRetrievalStrategy extends IRetriever {
  constructor(postgresService) {
    super();
    this.postgres = postgresService;
  }

  /**
   * Get strategy name
   * @returns {string} Strategy name
   */
  getName() {
    return 'vector';
  }

  /**
   * Retrieve documents using vector search only
   * @param {string} query - Search query
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {object} options - Retrieval options
   * @param {number} options.limit - Maximum results (alias for vectorLimit)
   * @param {number} options.vectorLimit - Maximum vector results
   * @param {number} options.threshold - Similarity threshold (alias for vectorThreshold)
   * @param {number} options.vectorThreshold - Similarity threshold
   * @returns {Promise<Array>} Retrieved documents
   */
  async retrieve(query, queryEmbedding, options = {}) {
    const {
      limit,
      vectorLimit = limit || 5,
      threshold,
      vectorThreshold = threshold || 0.7,
    } = options;

    return await this.postgres.vectorSearch(
      queryEmbedding,
      vectorLimit,
      vectorThreshold
    );
  }
}

