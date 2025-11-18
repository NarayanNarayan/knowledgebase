import pg from 'pg';
import { databaseConfig, postgresSchemas } from '../../config/database.config.js';

const { Pool } = pg;

/**
 * PostgreSQL Service for managing structured data, vectors, and RAG
 */
export class PostgresService {
  constructor() {
    this.pool = new Pool({
      connectionString: databaseConfig.postgres.connectionString,
    });
    this.initialized = false;
  }

  /**
   * Initialize database tables
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const client = await this.pool.connect();
      
      // Create all tables
      for (const schema of Object.values(postgresSchemas)) {
        await client.query(schema);
      }
      
      client.release();
      this.initialized = true;
      console.log('PostgreSQL initialized successfully');
    } catch (error) {
      console.error('Error initializing PostgreSQL:', error);
      throw error;
    }
  }

  // ========== User Profile Operations ==========

  /**
   * Create or update user profile
   */
  async upsertUserProfile(userId, profileData) {
    const { username, email, phone, address, preferences, customFields } = profileData;
    
    const query = `
      INSERT INTO user_profiles (user_id, username, email, phone, address, preferences, custom_fields, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        username = COALESCE($2, user_profiles.username),
        email = COALESCE($3, user_profiles.email),
        phone = COALESCE($4, user_profiles.phone),
        address = COALESCE($5, user_profiles.address),
        preferences = COALESCE($6, user_profiles.preferences),
        custom_fields = COALESCE($7, user_profiles.custom_fields),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const result = await this.pool.query(query, [
      userId,
      username,
      email,
      phone,
      address,
      JSON.stringify(preferences || {}),
      JSON.stringify(customFields || {}),
    ]);
    
    return result.rows[0];
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId) {
    const query = 'DELETE FROM user_profiles WHERE user_id = $1 RETURNING *';
    const result = await this.pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  // ========== Chat Operations ==========

  /**
   * Create a new chat session
   */
  async createChat(chatId, chatType, userId = null, metadata = {}) {
    const query = `
      INSERT INTO chats (chat_id, chat_type, user_id, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const result = await this.pool.query(query, [
      chatId,
      chatType,
      userId,
      JSON.stringify(metadata),
    ]);
    
    return result.rows[0];
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId) {
    const query = 'SELECT * FROM chats WHERE chat_id = $1';
    const result = await this.pool.query(query, [chatId]);
    return result.rows[0] || null;
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId) {
    const query = 'SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Update chat metadata
   */
  async updateChatMetadata(chatId, metadata) {
    const query = `
      UPDATE chats 
      SET metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE chat_id = $1
      RETURNING *;
    `;
    
    const result = await this.pool.query(query, [chatId, JSON.stringify(metadata)]);
    return result.rows[0];
  }

  /**
   * Delete chat
   */
  async deleteChat(chatId) {
    const query = 'DELETE FROM chats WHERE chat_id = $1 RETURNING *';
    const result = await this.pool.query(query, [chatId]);
    return result.rows[0];
  }

  // ========== Chat Message Operations ==========

  /**
   * Add message to chat
   */
  async addChatMessage(messageId, chatId, role, content, metadata = {}) {
    const query = `
      INSERT INTO chat_messages (message_id, chat_id, role, content, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const result = await this.pool.query(query, [
      messageId,
      chatId,
      role,
      content,
      JSON.stringify(metadata),
    ]);
    
    return result.rows[0];
  }

  /**
   * Get chat history
   */
  async getChatHistory(chatId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM chat_messages 
      WHERE chat_id = $1 
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3;
    `;
    
    const result = await this.pool.query(query, [chatId, limit, offset]);
    return result.rows;
  }

  /**
   * Get recent chat messages
   */
  async getRecentMessages(chatId, count = 10) {
    const query = `
      SELECT * FROM chat_messages 
      WHERE chat_id = $1 
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    
    const result = await this.pool.query(query, [chatId, count]);
    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(chatId) {
    const query = 'DELETE FROM chat_messages WHERE chat_id = $1';
    await this.pool.query(query, [chatId]);
  }

  // ========== Document Operations ==========

  /**
   * Store document
   */
  async storeDocument(docId, title, content, source, metadata = {}) {
    const query = `
      INSERT INTO documents (doc_id, title, content, source, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (doc_id) 
      DO UPDATE SET 
        title = $2,
        content = $3,
        source = $4,
        metadata = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const result = await this.pool.query(query, [
      docId,
      title,
      content,
      source,
      JSON.stringify(metadata),
    ]);
    
    return result.rows[0];
  }

  /**
   * Get document
   */
  async getDocument(docId) {
    const query = 'SELECT * FROM documents WHERE doc_id = $1';
    const result = await this.pool.query(query, [docId]);
    return result.rows[0] || null;
  }

  /**
   * Delete document and its embeddings
   */
  async deleteDocument(docId) {
    const query = 'DELETE FROM documents WHERE doc_id = $1 RETURNING *';
    const result = await this.pool.query(query, [docId]);
    return result.rows[0];
  }

  // ========== Embedding Operations ==========

  /**
   * Store embedding
   */
  async storeEmbedding(docId, chunkIndex, content, embedding, metadata = {}) {
    const query = `
      INSERT INTO embeddings (doc_id, chunk_index, content, embedding, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    const result = await this.pool.query(query, [
      docId,
      chunkIndex,
      content,
      JSON.stringify(embedding),
      JSON.stringify(metadata),
    ]);
    
    return result.rows[0].id;
  }

  /**
   * Vector similarity search
   */
  async vectorSearch(queryEmbedding, limit = 5, threshold = 0.7) {
    const query = `
      SELECT 
        e.doc_id,
        e.content,
        e.metadata,
        d.title,
        d.source,
        1 - (e.embedding <=> $1::vector) as similarity
      FROM embeddings e
      JOIN documents d ON e.doc_id = d.doc_id
      WHERE 1 - (e.embedding <=> $1::vector) > $2
      ORDER BY e.embedding <=> $1::vector
      LIMIT $3;
    `;
    
    const result = await this.pool.query(query, [
      JSON.stringify(queryEmbedding),
      threshold,
      limit,
    ]);
    
    return result.rows;
  }

  /**
   * Get embeddings for a document
   */
  async getDocumentEmbeddings(docId) {
    const query = 'SELECT * FROM embeddings WHERE doc_id = $1 ORDER BY chunk_index';
    const result = await this.pool.query(query, [docId]);
    return result.rows;
  }

  /**
   * Close connection pool
   */
  async close() {
    await this.pool.end();
  }
}

