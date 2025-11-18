import { VectorRetrievalStrategy } from './VectorRetrievalStrategy.js';
import { HybridSearchStrategy } from './HybridSearchStrategy.js';
import { IRetriever } from '../interfaces/IRetriever.js';

/**
 * Retrieval Strategy Factory
 * Creates appropriate retrieval strategy based on type
 */
export class RetrievalStrategyFactory {
  /**
   * Create retrieval strategy
   * @param {string} strategyType - Strategy type ('vector' or 'hybrid')
   * @param {object} postgresService - PostgreSQL service
   * @param {object} neo4jService - Neo4j service (required for hybrid)
   * @returns {IRetriever} Retrieval strategy instance
   */
  static create(strategyType, postgresService, neo4jService = null) {
    switch (strategyType) {
      case 'vector':
        return new VectorRetrievalStrategy(postgresService);
      
      case 'hybrid':
        if (!neo4jService) {
          throw new Error('Neo4j service is required for hybrid search strategy');
        }
        return new HybridSearchStrategy(postgresService, neo4jService);
      
      default:
        throw new Error(`Unknown retrieval strategy type: ${strategyType}`);
    }
  }

  /**
   * Create strategy based on configuration
   * @param {object} config - Configuration object
   * @param {boolean} config.useHybrid - Whether to use hybrid search
   * @param {object} postgresService - PostgreSQL service
   * @param {object} neo4jService - Neo4j service
   * @returns {IRetriever} Retrieval strategy instance
   */
  static createFromConfig(config, postgresService, neo4jService) {
    const strategyType = config.useHybrid !== false ? 'hybrid' : 'vector';
    return this.create(strategyType, postgresService, neo4jService);
  }

  /**
   * Get available strategy types
   * @returns {Array<string>} Available strategy types
   */
  static getAvailableStrategies() {
    return ['vector', 'hybrid'];
  }
}

