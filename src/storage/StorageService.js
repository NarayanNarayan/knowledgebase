import { PostgresService } from './PostgresService.js';
import { Neo4jService } from './Neo4jService.js';
import { HybridSearchStrategy } from '../strategies/HybridSearchStrategy.js';

/**
 * Unified Storage Service orchestrating PostgreSQL and Neo4j
 * Refactored to use strategy pattern for hybrid search
 */
export class StorageService {
  constructor(hybridSearchStrategy = null) {
    this.postgres = new PostgresService();
    this.neo4j = new Neo4jService();
    this.hybridSearchStrategy = hybridSearchStrategy || new HybridSearchStrategy(this.postgres, this.neo4j);
  }

  /**
   * Initialize all storage systems
   */
  async initialize() {
    await Promise.all([
      this.postgres.initialize(),
      this.neo4j.initialize(),
    ]);
    console.log('Storage services initialized');
  }

  /**
   * Hybrid search: Combine vector search with graph traversal
   * Delegates to HybridSearchStrategy
   */
  async hybridSearch(query, queryEmbedding, options = {}) {
    return await this.hybridSearchStrategy.retrieve(query, queryEmbedding, options);
  }

  /**
   * Store document with both vector embeddings and graph relationships
   */
  async storeDocumentComplete(docId, docData, embeddings, entities = []) {
    // Store document in PostgreSQL
    await this.postgres.storeDocument(
      docId,
      docData.title,
      docData.content,
      docData.source,
      docData.metadata
    );

    // Store embeddings
    for (let i = 0; i < embeddings.length; i++) {
      await this.postgres.storeEmbedding(
        docId,
        i,
        embeddings[i].content,
        embeddings[i].embedding,
        embeddings[i].metadata
      );
    }

    // Create document node in Neo4j
    await this.neo4j.upsertEntity(docId, 'Document', {
      title: docData.title,
      source: docData.source,
    });

    // Create entity relationships in graph
    if (entities.length > 0) {
      await this.neo4j.linkDocumentToEntities(docId, entities);
    }

    return { docId, embeddingsCount: embeddings.length, entitiesLinked: entities.length };
  }

  /**
   * Get user context (profile + relevant knowledge)
   */
  async getUserContext(userId, query = null, queryEmbedding = null) {
    const profile = await this.postgres.getUserProfile(userId);
    
    let relevantKnowledge = null;
    if (query && queryEmbedding) {
      relevantKnowledge = await this.hybridSearch(query, queryEmbedding, {
        vectorLimit: 3,
        graphDepth: 1,
      });
    }

    return {
      profile,
      relevantKnowledge,
    };
  }

  /**
   * Close all connections
   */
  async close() {
    await Promise.all([
      this.postgres.close(),
      this.neo4j.close(),
    ]);
  }
}

