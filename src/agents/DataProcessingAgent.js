import { ChatPromptTemplate } from '@langchain/core/prompts';
import { DataTransformTool } from '../tools/DataTransformTool.js';
import { FileSystemTool } from '../tools/FileSystemTool.js';

/**
 * Data Processing Agent - Handles programmatic data processing and file operations
 */
export class DataProcessingAgent {
  constructor(modelFactory, permissionService) {
    this.modelFactory = modelFactory;
    this.permissions = permissionService;
    this.dataTool = new DataTransformTool(permissionService);
    this.fileTool = new FileSystemTool(process.cwd(), permissionService);
  }

  /**
   * Execute data processing
   */
  async execute(prompt, data, context) {
    const chatType = context.chatType || 'user';

    // Determine if we need model processing
    const needsModel = await this.determineProcessingType(prompt, data, context);

    if (needsModel === 'programmatic') {
      return await this.processProgrammatically(prompt, data, chatType);
    } else if (needsModel === 'model') {
      return await this.processWithModel(prompt, data, context);
    } else {
      // Both
      const programmaticResult = await this.processProgrammatically(prompt, data, chatType);
      const modelResult = await this.processWithModel(prompt, programmaticResult.processedData || data, context);
      return {
        response: modelResult.response,
        programmaticResult,
        modelAnalysis: modelResult.response,
      };
    }
  }

  /**
   * Determine processing type
   */
  async determineProcessingType(prompt, data, context) {
    if (!data) {
      return 'model';
    }

    const lowerPrompt = prompt.toLowerCase();
    
    // Keywords for programmatic processing
    const programmaticKeywords = ['filter', 'transform', 'aggregate', 'count', 'sum', 'average', 'sort'];
    if (programmaticKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'programmatic';
    }

    // Keywords for model processing
    const modelKeywords = ['analyze', 'explain', 'summarize', 'interpret', 'suggest'];
    if (modelKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'model';
    }

    return 'both';
  }

  /**
   * Process data programmatically
   */
  async processProgrammatically(prompt, data, chatType) {
    try {
      const lowerPrompt = prompt.toLowerCase();
      let result;

      if (lowerPrompt.includes('filter')) {
        // Extract filter criteria from prompt (simplified)
        result = data; // Implement filtering logic
      } else if (lowerPrompt.includes('count')) {
        result = Array.isArray(data) ? data.length : Object.keys(data).length;
      } else if (lowerPrompt.includes('sum') || lowerPrompt.includes('aggregate')) {
        // Implement aggregation
        result = data;
      } else {
        result = data;
      }

      return {
        type: 'programmatic',
        processedData: result,
        operation: 'data_transformation',
      };
    } catch (error) {
      return {
        type: 'programmatic',
        error: error.message,
      };
    }
  }

  /**
   * Process with model
   */
  async processWithModel(prompt, data, context) {
    const model = this.modelFactory.getModel(context.model || 'gemini-pro');

    const dataPrompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a data analysis expert. Analyze the provided data and answer the user's question.

Data:
{data}`],
      ['user', '{prompt}'],
    ]);

    const chain = dataPrompt.pipe(model);
    const response = await chain.invoke({
      data: JSON.stringify(data, null, 2),
      prompt,
    });

    return {
      type: 'model',
      response: response.content,
    };
  }

  /**
   * File operations
   */
  async executeFileOperation(operation, params, chatType) {
    const tools = this.fileTool.getAllTools(chatType);
    const tool = tools.find(t => t.name === operation);

    if (!tool) {
      throw new Error(`Unknown file operation: ${operation}`);
    }

    return await tool.func(params);
  }
}

