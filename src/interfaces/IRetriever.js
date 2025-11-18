/**
 * Retrieval strategy interface for RAG operations
 * Allows different retrieval strategies (vector, hybrid, etc.)
 */
export class IRetriever {
  /**
   * Retrieve documents based on query
   * @param {string} query - Search query
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {object} options - Retrieval options
   * @returns {Promise<Array>} Retrieved documents
   */
  async retrieve(query, queryEmbedding, options = {}) {
    throw new Error('retrieve() must be implemented by retriever');
  }

  /**
   * Get retriever name/type
   * @returns {string} Retriever name
   */
  getName() {
    throw new Error('getName() must be implemented by retriever');
  }
}

