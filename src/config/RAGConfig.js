/**
 * RAG Configuration class
 * Encapsulates RAG-specific configuration with defaults and validation
 */
export class RAGConfig {
  constructor(options = {}) {
    this.useHybrid = options.useHybrid !== false; // Default: true
    this.useIterative = options.useIterative === true; // Default: false
    this.maxIterations = options.maxIterations || 3;
    this.confidenceThreshold = options.confidenceThreshold || 0.8;
    this.graphDepth = options.graphDepth || 1;
    this.ragLimit = options.ragLimit || 5;
    this.ragThreshold = options.ragThreshold || 0.7;
    
    this.validate();
  }

  /**
   * Validate configuration values
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (this.maxIterations < 1 || this.maxIterations > 10) {
      throw new Error('maxIterations must be between 1 and 10');
    }
    
    if (this.confidenceThreshold < 0 || this.confidenceThreshold > 1) {
      throw new Error('confidenceThreshold must be between 0 and 1');
    }
    
    if (this.graphDepth < 1 || this.graphDepth > 5) {
      throw new Error('graphDepth must be between 1 and 5');
    }
    
    if (this.ragLimit < 1 || this.ragLimit > 50) {
      throw new Error('ragLimit must be between 1 and 50');
    }
    
    if (this.ragThreshold < 0 || this.ragThreshold > 1) {
      throw new Error('ragThreshold must be between 0 and 1');
    }
  }

  /**
   * Merge with another config, overriding with provided values
   * @param {object} overrides - Configuration overrides
   * @returns {RAGConfig} New merged configuration
   */
  merge(overrides) {
    return new RAGConfig({
      useHybrid: overrides.useHybrid ?? this.useHybrid,
      useIterative: overrides.useIterative ?? this.useIterative,
      maxIterations: overrides.maxIterations ?? this.maxIterations,
      confidenceThreshold: overrides.confidenceThreshold ?? this.confidenceThreshold,
      graphDepth: overrides.graphDepth ?? this.graphDepth,
      ragLimit: overrides.ragLimit ?? this.ragLimit,
      ragThreshold: overrides.ragThreshold ?? this.ragThreshold,
    });
  }

  /**
   * Convert to plain object for serialization
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      useHybrid: this.useHybrid,
      useIterative: this.useIterative,
      maxIterations: this.maxIterations,
      confidenceThreshold: this.confidenceThreshold,
      graphDepth: this.graphDepth,
      ragLimit: this.ragLimit,
      ragThreshold: this.ragThreshold,
    };
  }
}

