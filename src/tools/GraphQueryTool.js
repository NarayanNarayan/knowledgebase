import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Graph Query Tool for Neo4j operations
 */
export class GraphQueryTool {
  constructor(neo4jService, permissionService) {
    this.neo4j = neo4jService;
    this.permissions = permissionService;
  }

  /**
   * Create search entities tool
   */
  createSearchEntitiesTool(chatType) {
    return new DynamicStructuredTool({
      name: 'search_graph_entities',
      description: 'Search for entities in the knowledge graph by name or description',
      schema: z.object({
        searchTerm: z.string().describe('Term to search for in entity properties'),
        limit: z.number().optional().describe('Maximum number of results (default: 10)'),
      }),
      func: async ({ searchTerm, limit = 10 }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'graph');
          const results = await this.neo4j.searchEntities(searchTerm, ['name', 'description'], limit);
          return JSON.stringify(results, null, 2);
        } catch (error) {
          return `Error searching entities: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create get entity tool
   */
  createGetEntityTool(chatType) {
    return new DynamicStructuredTool({
      name: 'get_graph_entity',
      description: 'Get a specific entity from the knowledge graph with its relationships',
      schema: z.object({
        entityId: z.string().describe('ID of the entity to retrieve'),
        depth: z.number().optional().describe('Relationship depth to traverse (default: 1)'),
      }),
      func: async ({ entityId, depth = 1 }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'graph');
          const result = await this.neo4j.getEntityWithRelationships(entityId, depth);
          return JSON.stringify(result, null, 2);
        } catch (error) {
          return `Error getting entity: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create entity tool (admin only)
   */
  createCreateEntityTool(chatType) {
    return new DynamicStructuredTool({
      name: 'create_graph_entity',
      description: 'Create a new entity in the knowledge graph',
      schema: z.object({
        entityId: z.string().describe('Unique ID for the entity'),
        type: z.string().describe('Type of the entity (e.g., Person, Location, Concept)'),
        properties: z.record(z.any()).describe('Properties of the entity'),
      }),
      func: async ({ entityId, type, properties }) => {
        try {
          this.permissions.validateOperation(chatType, 'write', 'graph');
          const result = await this.neo4j.upsertEntity(entityId, type, properties);
          return `Entity created: ${JSON.stringify(result, null, 2)}`;
        } catch (error) {
          return `Error creating entity: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create relationship tool (admin only)
   */
  createCreateRelationshipTool(chatType) {
    return new DynamicStructuredTool({
      name: 'create_graph_relationship',
      description: 'Create a relationship between two entities in the knowledge graph',
      schema: z.object({
        fromId: z.string().describe('ID of the source entity'),
        toId: z.string().describe('ID of the target entity'),
        relationshipType: z.string().describe('Type of relationship (e.g., KNOWS, WORKS_AT)'),
        properties: z.record(z.any()).optional().describe('Properties of the relationship'),
      }),
      func: async ({ fromId, toId, relationshipType, properties = {} }) => {
        try {
          this.permissions.validateOperation(chatType, 'write', 'graph');
          const result = await this.neo4j.createRelationship(fromId, toId, relationshipType, properties);
          return `Relationship created: ${JSON.stringify(result, null, 2)}`;
        } catch (error) {
          return `Error creating relationship: ${error.message}`;
        }
      },
    });
  }

  /**
   * Execute Cypher query tool (admin only)
   */
  createExecuteCypherTool(chatType) {
    return new DynamicStructuredTool({
      name: 'execute_cypher_query',
      description: 'Execute a custom Cypher query on the knowledge graph',
      schema: z.object({
        query: z.string().describe('Cypher query to execute'),
        parameters: z.record(z.any()).optional().describe('Query parameters'),
      }),
      func: async ({ query, parameters = {} }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'graph');
          const results = await this.neo4j.executeCypher(query, parameters);
          return JSON.stringify(results, null, 2);
        } catch (error) {
          return `Error executing query: ${error.message}`;
        }
      },
    });
  }

  /**
   * Get all graph tools based on permissions
   */
  getAllTools(chatType) {
    const tools = [
      this.createSearchEntitiesTool(chatType),
      this.createGetEntityTool(chatType),
      this.createExecuteCypherTool(chatType),
    ];

    if (this.permissions.hasPermission(chatType, 'write', 'graph')) {
      tools.push(this.createCreateEntityTool(chatType));
      tools.push(this.createCreateRelationshipTool(chatType));
    }

    return tools;
  }
}

