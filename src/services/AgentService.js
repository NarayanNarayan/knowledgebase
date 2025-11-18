import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';
import { ModelFactory } from '../models/ModelFactory.js';
import { ChatService } from './ChatService.js';
import { UserProfileService } from './UserProfileService.js';
import { PermissionService } from './PermissionService.js';
import { EmbeddingService } from './EmbeddingService.js';

/**
 * Agent Service for managing agent execution
 * Refactored to use dependency injection
 */
export class AgentService {
  constructor(
    storageService,
    chatService = null,
    userProfileService = null,
    modelFactory = null,
    permissionService = null,
    embeddingService = null
  ) {
    this.storage = storageService;
    this.permissionService = permissionService || new PermissionService();
    
    // Initialize ChatService with required dependencies
    this.chatService = chatService || new ChatService(
      storageService.postgres,
      this.permissionService
    );
    
    this.userProfileService = userProfileService || new UserProfileService(storageService.postgres);
    this.modelFactory = modelFactory || new ModelFactory();
    this.embeddingService = embeddingService || new EmbeddingService();
    this.orchestrator = null;
  }

  /**
   * Initialize agent orchestrator
   */
  async initialize() {
    this.orchestrator = new AgentOrchestrator(
      this.storage,
      this.modelFactory,
      this.chatService,
      this.userProfileService,
      this.permissionService,
      this.embeddingService
    );
    await this.orchestrator.initialize();
  }

  /**
   * Execute agent workflow
   */
  async execute(chatId, prompt, data = null, options = {}) {
    if (!this.orchestrator) {
      await this.initialize();
    }

    // Get chat context
    const chatContext = await this.chatService.getChatContext(chatId);
    
    // Get user profile if available
    let userProfile = null;
    if (chatContext.userId) {
      userProfile = await this.userProfileService.getUserContextForAI(chatContext.userId);
    }

    // Add message to chat history
    await this.chatService.addMessage(chatId, 'user', prompt);

    // Execute orchestrator
    const result = await this.orchestrator.execute(
      prompt,
      data,
      {
        ...options,
        chatType: chatContext.chatType,
        permissions: chatContext.permissions,
        userProfile,
        chatHistory: await this.chatService.formatHistoryForLLM(chatId, 10),
      }
    );

    // Add response to chat history
    await this.chatService.addMessage(chatId, 'assistant', result.response, {
      agentsUsed: result.agentsUsed,
      toolsUsed: result.toolsUsed,
    });

    return result;
  }

  /**
   * Execute without chat context (for MCP or API calls)
   */
  async executeDirect(prompt, data = null, options = {}) {
    if (!this.orchestrator) {
      await this.initialize();
    }

    return await this.orchestrator.execute(prompt, data, {
      ...options,
      chatType: options.chatType || 'user', // Default to user permissions
    });
  }
}

