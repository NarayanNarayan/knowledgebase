import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Vector Search Tool for RAG operations
 */
export class VectorSearchTool {
  constructor(storageService, embeddingService, permissionService) {
    this.storage = storageService;
    this.embedding = embeddingService;
    this.permissions = permissionService;
  }

  /**
   * Create semantic search tool
   */
  createSemanticSearchTool(chatType) {
    return new DynamicStructuredTool({
      name: 'semantic_search',
      description: 'Search for relevant documents using semantic similarity',
      schema: z.object({
        query: z.string().describe('Search query'),
        limit: z.number().optional().describe('Maximum number of results (default: 5)'),
        threshold: z.number().optional().describe('Similarity threshold 0-1 (default: 0.7)'),
      }),
      func: async ({ query, limit = 5, threshold = 0.7 }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'documents');
          
          // Generate query embedding
          const queryEmbedding = await this.embedding.embed(query);
          
          // Perform vector search
          const results = await this.storage.postgres.vectorSearch(queryEmbedding, limit, threshold);
          
          return JSON.stringify(results.map(r => ({
            title: r.title,
            content: r.content,
            source: r.source,
            similarity: r.similarity,
          })), null, 2);
        } catch (error) {
          return `Error performing semantic search: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create hybrid search tool (vector + graph)
   */
  createHybridSearchTool(chatType) {
    return new DynamicStructuredTool({
      name: 'hybrid_search',
      description: 'Advanced search combining semantic similarity and knowledge graph context',
      schema: z.object({
        query: z.string().describe('Search query'),
        limit: z.number().optional().describe('Maximum number of results (default: 5)'),
        graphDepth: z.number().optional().describe('Graph traversal depth (default: 1)'),
      }),
      func: async ({ query, limit = 5, graphDepth = 1 }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'documents');
          
          // Generate query embedding
          const queryEmbedding = await this.embedding.embed(query);
          
          // Perform hybrid search
          const results = await this.storage.hybridSearch(query, queryEmbedding, {
            vectorLimit: limit,
            graphDepth,
          });
          
          return JSON.stringify(results.map(r => ({
            title: r.title,
            content: r.content,
            source: r.source,
            similarity: r.similarity,
            graphContext: r.graphContext,
          })), null, 2);
        } catch (error) {
          return `Error performing hybrid search: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create get document tool
   */
  createGetDocumentTool(chatType) {
    return new DynamicStructuredTool({
      name: 'get_document',
      description: 'Retrieve a specific document by ID',
      schema: z.object({
        docId: z.string().describe('Document ID'),
      }),
      func: async ({ docId }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'documents');
          const doc = await this.storage.postgres.getDocument(docId);
          return doc ? JSON.stringify(doc, null, 2) : 'Document not found';
        } catch (error) {
          return `Error retrieving document: ${error.message}`;
        }
      },
    });
  }

  /**
   * Get all vector search tools based on permissions
   */
  getAllTools(chatType) {
    return [
      this.createSemanticSearchTool(chatType),
      this.createHybridSearchTool(chatType),
      this.createGetDocumentTool(chatType),
    ];
  }
}

