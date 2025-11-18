import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for exposing tools and model routing
 */
export class MCPServer {
  constructor(storageService, modelFactory, permissionService) {
    this.storage = storageService;
    this.modelFactory = modelFactory;
    this.permissions = permissionService;
    this.server = new Server(
      {
        name: 'ai-knowledge-base-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP handlers
   */
  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.executeTool(name, args);
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.getResourceDefinitions(),
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return await this.readResource(uri);
    });
  }

  /**
   * Get tool definitions
   */
  getToolDefinitions() {
    return [
      {
        name: 'semantic_search',
        description: 'Search the knowledge base using semantic similarity',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'graph_search',
        description: 'Search entities in the knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'Term to search for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
              default: 10,
            },
          },
          required: ['searchTerm'],
        },
      },
      {
        name: 'get_entity',
        description: 'Get entity details with relationships from knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            entityId: {
              type: 'string',
              description: 'Entity ID',
            },
            depth: {
              type: 'number',
              description: 'Relationship depth',
              default: 1,
            },
          },
          required: ['entityId'],
        },
      },
      {
        name: 'ingest_document',
        description: 'Ingest a document into the knowledge base (admin only)',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Document content',
            },
            title: {
              type: 'string',
              description: 'Document title',
            },
            source: {
              type: 'string',
              description: 'Document source',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'query_with_model',
        description: 'Query using a specific AI model',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Query prompt',
            },
            model: {
              type: 'string',
              description: 'Model to use (gemini-pro, gpt-4, claude-3-opus, etc.)',
              default: 'gemini-pro',
            },
          },
          required: ['prompt'],
        },
      },
    ];
  }

  /**
   * Get resource definitions
   */
  getResourceDefinitions() {
    return [
      {
        uri: 'knowledge://graph/stats',
        name: 'Knowledge Graph Statistics',
        description: 'Statistics about the knowledge graph',
        mimeType: 'application/json',
      },
      {
        uri: 'knowledge://models/available',
        name: 'Available AI Models',
        description: 'List of available AI models',
        mimeType: 'application/json',
      },
    ];
  }

  /**
   * Execute tool
   */
  async executeTool(toolName, args) {
    try {
      switch (toolName) {
        case 'semantic_search': {
          const { EmbeddingService } = await import('../services/EmbeddingService.js');
          const embedding = new EmbeddingService();
          const queryEmbedding = await embedding.embed(args.query);
          const results = await this.storage.postgres.vectorSearch(
            queryEmbedding,
            args.limit || 5,
            0.7
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        case 'graph_search': {
          const results = await this.storage.neo4j.searchEntities(
            args.searchTerm,
            ['name', 'description'],
            args.limit || 10
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        case 'get_entity': {
          const result = await this.storage.neo4j.getEntityWithRelationships(
            args.entityId,
            args.depth || 1
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'ingest_document': {
          const { IngestionService } = await import('../services/IngestionService.js');
          const ingestion = new IngestionService(this.storage);
          const result = await ingestion.ingestDocument(args.content, {
            title: args.title || 'Untitled',
            source: args.source || 'mcp',
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'query_with_model': {
          const model = this.modelFactory.getModel(args.model || 'gemini-pro');
          const response = await model.invoke(args.prompt);
          return {
            content: [
              {
                type: 'text',
                text: response.content,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Read resource
   */
  async readResource(uri) {
    try {
      if (uri === 'knowledge://graph/stats') {
        const stats = await this.storage.neo4j.getStats();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      } else if (uri === 'knowledge://models/available') {
        const models = this.modelFactory.listAvailableModels();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(models, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Error reading resource: ${error.message}`,
          },
        ],
      };
    }
  }

  /**
   * Start MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server started on stdio');
  }
}

