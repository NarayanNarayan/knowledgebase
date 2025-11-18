import { ChatPromptTemplate } from '@langchain/core/prompts';
import { GraphQueryTool } from '../tools/GraphQueryTool.js';

/**
 * Knowledge Graph Agent - Handles graph operations and entity relationships
 */
export class KnowledgeGraphAgent {
  constructor(modelFactory, neo4jService, permissionService) {
    this.modelFactory = modelFactory;
    this.neo4j = neo4jService;
    this.permissions = permissionService;
    this.graphTool = new GraphQueryTool(neo4jService, permissionService);
  }

  /**
   * Execute graph query
   */
  async execute(prompt, context) {
    const model = this.modelFactory.getModel(context.model || 'gemini-pro');
    const chatType = context.chatType || 'user';

    // Get available tools based on permissions
    const tools = this.graphTool.getAllTools(chatType);

    const graphPrompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a knowledge graph expert. Help users query and understand entity relationships.

Available operations:
- Search for entities
- Get entity details and relationships
- ${this.permissions.hasPermission(chatType, 'write', 'graph') ? 'Create entities and relationships' : 'View entities (read-only)'}

Analyze the user's request and determine the best approach.`],
      ['user', '{prompt}'],
    ]);

    // First, understand what the user wants
    const analysisChain = graphPrompt.pipe(model);
    const analysis = await analysisChain.invoke({ prompt });

    // Execute appropriate graph operation
    const result = await this.executeGraphOperation(prompt, chatType);

    return {
      response: `${analysis.content}\n\nGraph Query Result:\n${result}`,
      graphData: result,
    };
  }

  /**
   * Execute graph operation based on prompt
   */
  async executeGraphOperation(prompt, chatType) {
    try {
      // Simple keyword-based routing (can be enhanced with LLM-based intent detection)
      const lowerPrompt = prompt.toLowerCase();

      if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
        // Extract search term (simple approach)
        const searchTerm = prompt.replace(/search|find|for|entities?|nodes?/gi, '').trim();
        const results = await this.neo4j.searchEntities(searchTerm, ['name', 'description'], 10);
        return JSON.stringify(results, null, 2);
      } else if (lowerPrompt.includes('relationship') || lowerPrompt.includes('connected')) {
        // Get entity with relationships
        const entityIdMatch = prompt.match(/entity[:\s]+([^\s]+)/i);
        if (entityIdMatch) {
          const result = await this.neo4j.getEntityWithRelationships(entityIdMatch[1], 2);
          return JSON.stringify(result, null, 2);
        }
      } else if (lowerPrompt.includes('stats') || lowerPrompt.includes('statistics')) {
        const stats = await this.neo4j.getStats();
        return JSON.stringify(stats, null, 2);
      }

      return 'Please provide more specific graph query details (search, entity ID, or stats).';
    } catch (error) {
      return `Error executing graph operation: ${error.message}`;
    }
  }

  /**
   * Extract entities from text (for admin operations)
   */
  async extractAndStoreEntities(text, context) {
    if (!this.permissions.hasPermission(context.chatType, 'write', 'graph')) {
      throw new Error('Permission denied: Cannot create entities');
    }

    const model = this.modelFactory.getModel(context.model || 'gemini-pro');

    const extractionPrompt = ChatPromptTemplate.fromMessages([
      ['system', `Extract entities from the text and output as JSON array:
[{"id": "unique_id", "type": "EntityType", "properties": {"name": "...", "description": "..."}}]`],
      ['user', '{text}'],
    ]);

    const chain = extractionPrompt.pipe(model);
    const response = await chain.invoke({ text });

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const entities = JSON.parse(jsonMatch[0]);
        
        // Store entities in graph
        for (const entity of entities) {
          await this.neo4j.upsertEntity(entity.id, entity.type, entity.properties);
        }

        return entities;
      }
    } catch (error) {
      console.error('Error extracting entities:', error);
    }

    return [];
  }
}

