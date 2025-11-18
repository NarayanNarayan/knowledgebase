import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { EmbeddingService } from './EmbeddingService.js';
import { StorageService } from '../storage/StorageService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ingestion Service for processing and storing documents
 */
export class IngestionService {
  constructor(storageService = null, embeddingService = null) {
    this.storage = storageService || new StorageService();
    this.embedding = embeddingService || new EmbeddingService();
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  /**
   * Ingest a document
   */
  async ingestDocument(content, metadata = {}) {
    const docId = metadata.docId || uuidv4();
    
    // Split document into chunks
    const chunks = await this.textSplitter.splitText(content);
    
    // Generate embeddings for chunks
    const embeddedChunks = await this.embedding.embedChunks(chunks);
    
    // Extract entities (basic implementation - can be enhanced with NER)
    const entities = this.extractEntities(content);
    
    // Store document with embeddings and graph relationships
    const result = await this.storage.storeDocumentComplete(
      docId,
      {
        title: metadata.title || 'Untitled',
        content,
        source: metadata.source || 'unknown',
        metadata,
      },
      embeddedChunks,
      entities.map(e => e.id)
    );

    // Create entity nodes in graph
    for (const entity of entities) {
      await this.storage.neo4j.upsertEntity(entity.id, entity.type, entity.properties);
    }

    return {
      ...result,
      entitiesExtracted: entities.length,
    };
  }

  /**
   * Ingest multiple documents
   */
  async ingestDocuments(documents) {
    const results = [];
    
    for (const doc of documents) {
      const result = await this.ingestDocument(doc.content, doc.metadata);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Extract entities from text (basic implementation)
   * Can be enhanced with NER models or LLM-based extraction
   */
  extractEntities(text) {
    const entities = [];
    
    // Basic entity extraction using patterns
    // Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => {
      entities.push({
        id: `email_${email}`,
        type: 'Email',
        properties: { value: email },
      });
    });

    // Phone numbers (simple pattern)
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach(phone => {
      entities.push({
        id: `phone_${phone}`,
        type: 'Phone',
        properties: { value: phone },
      });
    });

    // URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];
    urls.forEach(url => {
      entities.push({
        id: `url_${url}`,
        type: 'URL',
        properties: { value: url },
      });
    });

    return entities;
  }

  /**
   * Update text splitter configuration
   */
  configureTextSplitter(chunkSize, chunkOverlap) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  }
}

