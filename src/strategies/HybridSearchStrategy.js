import { IRetriever } from '../interfaces/IRetriever.js';

/**
 * Hybrid Search Strategy
 * Combines vector search with graph traversal
 * Implements IRetriever interface
 */
export class HybridSearchStrategy extends IRetriever {
  constructor(postgresService, neo4jService) {
    super();
    this.postgres = postgresService;
    this.neo4j = neo4jService;
  }

  /**
   * Get strategy name
   * @returns {string} Strategy name
   */
  getName() {
    return 'hybrid';
  }

  /**
   * Retrieve documents using hybrid search (vector + graph)
   * @param {string} query - Search query
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {object} options - Retrieval options
   * @param {number} options.vectorLimit - Maximum vector results
   * @param {number} options.vectorThreshold - Similarity threshold
   * @param {number} options.graphDepth - Graph traversal depth
   * @returns {Promise<Array>} Retrieved documents with graph context
   */
  async retrieve(query, queryEmbedding, options = {}) {
    const {
      vectorLimit = 5,
      vectorThreshold = 0.7,
      graphDepth = 1,
    } = options;

    // Perform vector search
    const vectorResults = await this.postgres.vectorSearch(
      queryEmbedding,
      vectorLimit,
      vectorThreshold
    );

    // For each result, get related entities from graph
    const enrichedResults = await Promise.all(
      vectorResults.map(async (result) => {
        const graphData = await this.neo4j.getEntityWithRelationships(
          result.doc_id,
          graphDepth
        );
        
        return {
          ...result,
          graphContext: graphData,
        };
      })
    );

    return enrichedResults;
  }
}

