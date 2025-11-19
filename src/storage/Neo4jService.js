import neo4j from 'neo4j-driver';
import { databaseConfig } from '../../config/database.config.js';

/**
 * Neo4j Service for knowledge graph operations
 */
export class Neo4jService {
  constructor() {
    this.driver = neo4j.driver(
      databaseConfig.neo4j.uri,
      neo4j.auth.basic(databaseConfig.neo4j.user, databaseConfig.neo4j.password)
    );
    this.initialized = false;
  }

  /**
   * Initialize graph database with constraints and indexes
   */
  async initialize() {
    if (this.initialized) return;

    const session = this.driver.session();
    try {
      // Create constraints for unique nodes
      await session.run(`
        CREATE CONSTRAINT entity_id IF NOT EXISTS
        FOR (e:Entity) REQUIRE e.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT document_id IF NOT EXISTS
        FOR (d:Document) REQUIRE d.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT user_id IF NOT EXISTS
        FOR (u:User) REQUIRE u.id IS UNIQUE
      `);

      // Create indexes for better query performance
      await session.run(`
        CREATE INDEX entity_type IF NOT EXISTS
        FOR (e:Entity) ON (e.type)
      `);

      this.initialized = true;
      console.log('Neo4j initialized successfully');
    } catch (error) {
      console.error('Error initializing Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Create or update an entity node
   */
  async upsertEntity(id, type, properties = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MERGE (e:Entity {id: $id})
        SET e.type = $type,
            e += $properties,
            e.updated_at = datetime()
        RETURN e
        `,
        { id, type, properties }
      );
      return result.records[0]?.get('e').properties;
    } finally {
      await session.close();
    }
  }

  /**
   * Create relationship between entities
   */
  async createRelationship(fromId, toId, relationshipType, properties = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (from:Entity {id: $fromId})
        MATCH (to:Entity {id: $toId})
        MERGE (from)-[r:${relationshipType}]->(to)
        SET r += $properties,
            r.updated_at = datetime()
        RETURN r
        `,
        { fromId, toId, properties }
      );
      return result.records[0]?.get('r').properties;
    } finally {
      await session.close();
    }
  }

  /**
   * Query entities by type
   */
  async getEntitiesByType(type, limit = 100) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (e:Entity {type: $type})
        RETURN e
        LIMIT $limit
        `,
        { type, limit }
      );
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  /**
   * Get entity by ID
   */
  async getEntity(id) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (e:Entity {id: $id})
        RETURN e
        `,
        { id }
      );
      return result.records[0]?.get('e').properties || null;
    } finally {
      await session.close();
    }
  }

  /**
   * Get entity with relationships
   */
  async getEntityWithRelationships(id, depth = 1) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH path = (e:Entity {id: $id})-[*0..${depth}]-(related)
        RETURN e, collect(distinct related) as related_entities,
               [r in relationships(path) | {type: type(r), properties: properties(r)}] as relationships
        `,
        { id }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
        entity: record.get('e').properties,
        related: record.get('related_entities').map(n => n.properties),
        relationships: record.get('relationships'),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Search entities by properties
   */
  async searchEntities(searchTerm, properties = ['name', 'description'], limit = 20) {
    const session = this.driver.session();
    try {
      const whereClause = properties.map(prop => `e.${prop} CONTAINS $searchTerm`).join(' OR ');
      const result = await session.run(
        `
        MATCH (e:Entity)
        WHERE ${whereClause}
        RETURN e
        LIMIT $limit
        `,
        { searchTerm, limit }
      );
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  /**
   * Delete entity
   */
  async deleteEntity(id) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (e:Entity {id: $id})
        DETACH DELETE e
        RETURN count(e) as deleted
        `,
        { id }
      );
      return result.records[0]?.get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(fromId, toId, relationshipType) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (from:Entity {id: $fromId})-[r:${relationshipType}]->(to:Entity {id: $toId})
        DELETE r
        RETURN count(r) as deleted
        `,
        { fromId, toId }
      );
      return result.records[0]?.get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Execute custom Cypher query
   */
  async executeCypher(query, parameters = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(query, parameters);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }

  /**
   * Link document to entities
   */
  async linkDocumentToEntities(docId, entityIds) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (d:Document {id: $docId})
        UNWIND $entityIds as entityId
        MATCH (e:Entity {id: entityId})
        MERGE (d)-[r:MENTIONS]->(e)
        RETURN count(r) as links_created
        `,
        { docId, entityIds }
      );
      return result.records[0]?.get('links_created').toNumber();
    } finally {
      await session.close();
    }
  }

  /**
   * Get graph statistics
   */
  async getStats() {
    const session = this.driver.session();
    try {
      // Get node count
      const nodeCountResult = await session.run(`
        MATCH (e:Entity)
        RETURN count(e) as nodeCount
      `);
      
      // Get node types with counts
      const nodeTypesResult = await session.run(`
        MATCH (e:Entity)
        WHERE e.type IS NOT NULL
        RETURN e.type as type, count(*) as count
        ORDER BY count DESC
      `);
      
      // Get relationship count
      const relCountResult = await session.run(`
        MATCH ()-[r]->()
        RETURN count(r) as relationshipCount
      `);
      
      // Get relationship types with counts
      const relTypesResult = await session.run(`
        MATCH ()-[r]->()
        RETURN type(r) as type, count(*) as count
        ORDER BY count DESC
      `);
      
      const nodeCount = nodeCountResult.records[0]?.get('nodeCount').toNumber() || 0;
      const relationshipCount = relCountResult.records[0]?.get('relationshipCount').toNumber() || 0;
      
      // Convert node types to object
      const nodeTypes = {};
      nodeTypesResult.records.forEach(record => {
        const type = record.get('type');
        const count = record.get('count').toNumber();
        if (type) {
          nodeTypes[type] = count;
        }
      });
      
      // Convert relationship types to object
      const relationshipTypes = {};
      relTypesResult.records.forEach(record => {
        const type = record.get('type');
        const count = record.get('count').toNumber();
        if (type) {
          relationshipTypes[type] = count;
        }
      });
      
      return {
        nodeCount,
        relationshipCount,
        nodeTypes,
        relationshipTypes,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Close driver connection
   */
  async close() {
    await this.driver.close();
  }
}

