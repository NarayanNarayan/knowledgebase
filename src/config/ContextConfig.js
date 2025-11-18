/**
 * Context building configuration
 * Configures how context is built from various sources
 */
export class ContextConfig {
  constructor(options = {}) {
    this.includeUserProfile = options.includeUserProfile !== false; // Default: true
    this.includeChatHistory = options.includeChatHistory !== false; // Default: true
    this.chatHistoryLimit = options.chatHistoryLimit || 10;
    this.includeGraphContext = options.includeGraphContext !== false; // Default: true
    this.maxContextLength = options.maxContextLength || 10000; // Max characters
    this.contextFormat = options.contextFormat || 'text'; // 'text' | 'structured'
    
    this.validate();
  }

  /**
   * Validate configuration values
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (this.chatHistoryLimit < 0 || this.chatHistoryLimit > 100) {
      throw new Error('chatHistoryLimit must be between 0 and 100');
    }
    
    if (this.maxContextLength < 100 || this.maxContextLength > 100000) {
      throw new Error('maxContextLength must be between 100 and 100000');
    }
    
    if (!['text', 'structured'].includes(this.contextFormat)) {
      throw new Error('contextFormat must be "text" or "structured"');
    }
  }

  /**
   * Merge with another config
   * @param {object} overrides - Configuration overrides
   * @returns {ContextConfig} New merged configuration
   */
  merge(overrides) {
    return new ContextConfig({
      includeUserProfile: overrides.includeUserProfile ?? this.includeUserProfile,
      includeChatHistory: overrides.includeChatHistory ?? this.includeChatHistory,
      chatHistoryLimit: overrides.chatHistoryLimit ?? this.chatHistoryLimit,
      includeGraphContext: overrides.includeGraphContext ?? this.includeGraphContext,
      maxContextLength: overrides.maxContextLength ?? this.maxContextLength,
      contextFormat: overrides.contextFormat ?? this.contextFormat,
    });
  }

  /**
   * Convert to plain object
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      includeUserProfile: this.includeUserProfile,
      includeChatHistory: this.includeChatHistory,
      chatHistoryLimit: this.chatHistoryLimit,
      includeGraphContext: this.includeGraphContext,
      maxContextLength: this.maxContextLength,
      contextFormat: this.contextFormat,
    };
  }
}

