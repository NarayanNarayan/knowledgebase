import { ModelFactory } from '../models/ModelFactory.js';

/**
 * Embedding Service for generating document embeddings
 */
export class EmbeddingService {
  constructor(embeddingModel = null) {
    this.modelFactory = new ModelFactory();
    this.embeddingModel = embeddingModel;
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text) {
    const embeddings = await this.modelFactory.getEmbeddings(this.embeddingModel);
    const result = await embeddings.embedQuery(text);
    return result;
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async embedBatch(texts) {
    const embeddings = await this.modelFactory.getEmbeddings(this.embeddingModel);
    const results = await embeddings.embedDocuments(texts);
    return results;
  }

  /**
   * Generate embeddings for document chunks
   */
  async embedChunks(chunks) {
    const texts = chunks.map(chunk => chunk.pageContent || chunk.content || chunk);
    const embeddings = await this.embedBatch(texts);
    
    return chunks.map((chunk, index) => ({
      content: typeof chunk === 'string' ? chunk : chunk.pageContent || chunk.content,
      embedding: embeddings[index],
      metadata: typeof chunk === 'object' ? chunk.metadata : {},
    }));
  }

  /**
   * Get embedding model info
   */
  getModelInfo() {
    return {
      model: this.embeddingModel || this.modelFactory.config.defaultEmbeddingModel,
      provider: this.modelFactory.detectProvider(this.embeddingModel || this.modelFactory.config.defaultEmbeddingModel),
    };
  }
}

