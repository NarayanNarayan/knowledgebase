import { AgentConfig } from '../config/AgentConfig.js';
import { ContextConfig } from '../config/ContextConfig.js';

/**
 * Context Builder utility
 * Builds execution context from options and services
 */
export class ContextBuilder {
  constructor(modelFactory, permissionService, chatService, userProfileService) {
    this.modelFactory = modelFactory;
    this.permissionService = permissionService;
    this.chatService = chatService;
    this.userProfileService = userProfileService;
  }

  /**
   * Build execution context from options
   * @param {object} options - Options object
   * @param {AgentConfig} baseConfig - Base agent config (optional)
   * @returns {Promise<object>} Execution context
   */
  async buildContext(options = {}, baseConfig = null) {
    const config = baseConfig || new AgentConfig(options);
    
    const context = {
      model: config.model || this.modelFactory.config.defaultProvider,
      chatType: config.chatType || 'user',
      permissions: config.permissions || this.permissionService.getPermissions(config.chatType || 'user'),
      userProfile: config.userProfile || null,
      chatHistory: config.chatHistory || [],
      useGraph: config.useGraph,
      useRAG: config.useRAG,
      processData: config.processData,
    };

    // Add RAG-specific options if RAG config exists
    if (config.ragConfig) {
      context.useHybrid = config.ragConfig.useHybrid;
      context.useIterative = config.ragConfig.useIterative;
      context.maxIterations = config.ragConfig.maxIterations;
      context.confidenceThreshold = config.ragConfig.confidenceThreshold;
      context.graphDepth = config.ragConfig.graphDepth;
      context.ragLimit = config.ragConfig.ragLimit;
      context.ragThreshold = config.ragConfig.ragThreshold;
    } else {
      // Default RAG options for backward compatibility
      context.useHybrid = options.useHybrid !== false;
      context.useIterative = options.useIterative === true;
      context.maxIterations = options.maxIterations || 3;
      context.confidenceThreshold = options.confidenceThreshold || 0.8;
      context.graphDepth = options.graphDepth || 1;
      context.ragLimit = options.ragLimit || 5;
      context.ragThreshold = options.ragThreshold || 0.7;
    }

    return context;
  }

  /**
   * Build context from chat ID
   * @param {string} chatId - Chat ID
   * @param {object} options - Additional options
   * @returns {Promise<object>} Execution context
   */
  async buildContextFromChat(chatId, options = {}) {
    const chatContext = await this.chatService.getChatContext(chatId);
    
    // Get user profile if available
    let userProfile = null;
    if (chatContext.userId) {
      userProfile = await this.userProfileService.getUserContextForAI(chatContext.userId);
    }

    return await this.buildContext({
      ...options,
      chatType: chatContext.chatType,
      permissions: chatContext.permissions,
      userProfile,
      chatHistory: await this.chatService.formatHistoryForLLM(chatId, 10),
    });
  }

  /**
   * Add user profile to context
   * @param {object} context - Existing context
   * @param {string} userId - User ID
   * @returns {Promise<object>} Updated context
   */
  async addUserProfile(context, userId) {
    if (userId && !context.userProfile) {
      context.userProfile = await this.userProfileService.getUserContextForAI(userId);
    }
    return context;
  }

  /**
   * Add chat history to context
   * @param {object} context - Existing context
   * @param {string} chatId - Chat ID
   * @param {number} limit - Message limit
   * @returns {Promise<object>} Updated context
   */
  async addChatHistory(context, chatId, limit = 10) {
    if (chatId && (!context.chatHistory || context.chatHistory.length === 0)) {
      context.chatHistory = await this.chatService.formatHistoryForLLM(chatId, limit);
    }
    return context;
  }
}

