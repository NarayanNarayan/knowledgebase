/**
 * Agent execution configuration
 * Encapsulates agent-specific configuration with defaults
 */
export class AgentConfig {
  constructor(options = {}) {
    this.model = options.model || null;
    this.chatType = options.chatType || 'user';
    this.useGraph = options.useGraph !== false;
    this.useRAG = options.useRAG !== false;
    this.processData = options.processData !== false;
    this.userProfile = options.userProfile || null;
    this.chatHistory = options.chatHistory || [];
    this.permissions = options.permissions || null;
    
    // RAG config if provided
    this.ragConfig = options.ragConfig || null;
    
    this.validate();
  }

  /**
   * Validate configuration values
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (this.chatType && !['admin', 'user'].includes(this.chatType)) {
      throw new Error('chatType must be "admin" or "user"');
    }
    
    if (this.chatHistory && !Array.isArray(this.chatHistory)) {
      throw new Error('chatHistory must be an array');
    }
  }

  /**
   * Merge with another config, overriding with provided values
   * @param {object} overrides - Configuration overrides
   * @returns {AgentConfig} New merged configuration
   */
  merge(overrides) {
    return new AgentConfig({
      model: overrides.model ?? this.model,
      chatType: overrides.chatType ?? this.chatType,
      useGraph: overrides.useGraph ?? this.useGraph,
      useRAG: overrides.useRAG ?? this.useRAG,
      processData: overrides.processData ?? this.processData,
      userProfile: overrides.userProfile ?? this.userProfile,
      chatHistory: overrides.chatHistory ?? this.chatHistory,
      permissions: overrides.permissions ?? this.permissions,
      ragConfig: overrides.ragConfig ?? this.ragConfig,
    });
  }

  /**
   * Convert to plain object for serialization
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      model: this.model,
      chatType: this.chatType,
      useGraph: this.useGraph,
      useRAG: this.useRAG,
      processData: this.processData,
      userProfile: this.userProfile ? { ...this.userProfile } : null,
      chatHistory: [...this.chatHistory],
      permissions: this.permissions ? { ...this.permissions } : null,
      ragConfig: this.ragConfig ? this.ragConfig.toObject() : null,
    };
  }
}

