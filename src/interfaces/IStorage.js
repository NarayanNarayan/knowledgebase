/**
 * Storage abstraction interface
 * Defines contract for storage operations
 */
export class IStorage {
  /**
   * Initialize storage service
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  /**
   * Close storage connections
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('close() must be implemented');
  }
}

/**
 * Vector storage interface for RAG operations
 */
export class IVectorStorage extends IStorage {
  /**
   * Perform vector similarity search
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {number} limit - Maximum results
   * @param {number} threshold - Similarity threshold
   * @returns {Promise<Array>} Search results
   */
  async vectorSearch(queryEmbedding, limit, threshold) {
    throw new Error('vectorSearch() must be implemented');
  }

  /**
   * Store document embedding
   * @param {string} docId - Document ID
   * @param {number} chunkIndex - Chunk index
   * @param {string} content - Chunk content
   * @param {Array<number>} embedding - Embedding vector
   * @param {object} metadata - Additional metadata
   * @returns {Promise<string>} Embedding ID
   */
  async storeEmbedding(docId, chunkIndex, content, embedding, metadata) {
    throw new Error('storeEmbedding() must be implemented');
  }
}

/**
 * Graph storage interface for knowledge graph operations
 */
export class IGraphStorage extends IStorage {
  /**
   * Get entity with relationships
   * @param {string} entityId - Entity ID
   * @param {number} depth - Relationship depth
   * @returns {Promise<object>} Entity with relationships
   */
  async getEntityWithRelationships(entityId, depth) {
    throw new Error('getEntityWithRelationships() must be implemented');
  }

  /**
   * Search entities
   * @param {string} searchTerm - Search term
   * @param {Array<string>} fields - Fields to search
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} Search results
   */
  async searchEntities(searchTerm, fields, limit) {
    throw new Error('searchEntities() must be implemented');
  }
}

