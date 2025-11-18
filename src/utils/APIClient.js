/**
 * API Client for v1/v2 integration
 */
export class APIClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  }

  /**
   * Create chat session
   */
  async createChat(chatType, userId = null, metadata = {}) {
    return await this.fetch('/chat/create', {
      method: 'POST',
      body: JSON.stringify({ chatType, userId, metadata }),
    });
  }

  /**
   * Send query to specific chat
   */
  async query(chatId, prompt, data = null, options = {}) {
    return await this.fetch('/query', {
      method: 'POST',
      body: JSON.stringify({ chatId, prompt, data, options }),
    });
  }

  /**
   * Direct query (no chat context)
   */
  async queryDirect(prompt, data = null, options = {}) {
    return await this.fetch('/query/direct', {
      method: 'POST',
      body: JSON.stringify({ prompt, data, options }),
    });
  }

  /**
   * Ingest document
   */
  async ingestDocument(content, metadata = {}) {
    return await this.fetch('/ingest', {
      method: 'POST',
      body: JSON.stringify({ content, metadata }),
    });
  }

  /**
   * Get chat history
   */
  async getChatHistory(chatId, limit = 50, offset = 0) {
    return await this.fetch(`/chat/${chatId}/history?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    return await this.fetch(`/profile/${userId}`);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    return await this.fetch('/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, ...profileData }),
    });
  }

  /**
   * Get knowledge graph entity
   */
  async getEntity(entityId, depth = 1) {
    return await this.fetch(`/knowledge/${entityId}?depth=${depth}`);
  }

  /**
   * Get graph statistics
   */
  async getGraphStats() {
    return await this.fetch('/stats/graph');
  }

  /**
   * List available models
   */
  async listModels() {
    return await this.fetch('/models');
  }

  /**
   * Health check
   */
  async healthCheck() {
    return await this.fetch('/health');
  }
}

// Export for Node.js
export default APIClient;

