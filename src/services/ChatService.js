import { PostgresService } from '../storage/PostgresService.js';
import { PermissionService } from './PermissionService.js';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError, NotFoundError } from '../errors/DomainError.js';

/**
 * Chat Service for managing chat sessions and history
 * Refactored to use dependency injection
 */
export class ChatService {
  constructor(postgresService, permissionService) {
    // Require dependencies to be injected
    if (!postgresService) {
      throw new ValidationError('PostgresService is required', 'postgresService');
    }
    if (!permissionService) {
      throw new ValidationError('PermissionService is required', 'permissionService');
    }
    
    this.postgres = postgresService;
    this.permissions = permissionService;
  }

  /**
   * Create a new chat session
   */
  async createChat(chatType, userId = null, metadata = {}) {
    if (!['admin', 'user'].includes(chatType)) {
      throw new ValidationError('Chat type must be "admin" or "user"', 'chatType', chatType);
    }

    const chatId = uuidv4();
    return await this.postgres.createChat(chatId, chatType, userId, metadata);
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId) {
    return await this.postgres.getChat(chatId);
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId) {
    return await this.postgres.getUserChats(userId);
  }

  /**
   * Update chat metadata
   */
  async updateMetadata(chatId, metadata) {
    return await this.postgres.updateChatMetadata(chatId, metadata);
  }

  /**
   * Delete chat (admin only)
   */
  async deleteChat(chatId, requestingChatType) {
    this.permissions.validateOperation(requestingChatType, 'delete', 'chats');
    return await this.postgres.deleteChat(chatId);
  }

  /**
   * Add message to chat
   */
  async addMessage(chatId, role, content, metadata = {}) {
    const messageId = uuidv4();
    return await this.postgres.addChatMessage(messageId, chatId, role, content, metadata);
  }

  /**
   * Get chat history
   */
  async getHistory(chatId, limit = 50, offset = 0) {
    return await this.postgres.getChatHistory(chatId, limit, offset);
  }

  /**
   * Get recent messages for context
   */
  async getRecentMessages(chatId, count = 10) {
    return await this.postgres.getRecentMessages(chatId, count);
  }

  /**
   * Format chat history for LLM context
   */
  async formatHistoryForLLM(chatId, messageCount = 10) {
    const messages = await this.getRecentMessages(chatId, messageCount);
    
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Get chat context with permissions
   */
  async getChatContext(chatId) {
    const chat = await this.getChat(chatId);
    
    if (!chat) {
      throw new NotFoundError(`Chat not found: ${chatId}`, 'chat', chatId);
    }

    const permissions = this.permissions.getPermissions(chat.chat_type);
    const history = await this.getRecentMessages(chatId, 20);

    return {
      chatId: chat.chat_id,
      chatType: chat.chat_type,
      userId: chat.user_id,
      permissions,
      history,
      metadata: chat.metadata,
    };
  }

  /**
   * Clear chat history (admin only)
   */
  async clearHistory(chatId, requestingChatType) {
    this.permissions.validateOperation(requestingChatType, 'delete', 'chats');
    return await this.postgres.clearChatHistory(chatId);
  }

  /**
   * Validate operation for chat
   */
  async validateChatOperation(chatId, operation, resource = null) {
    const chat = await this.getChat(chatId);
    
    if (!chat) {
      throw new NotFoundError(`Chat not found: ${chatId}`, 'chat', chatId);
    }

    return this.permissions.validateOperation(chat.chat_type, operation, resource);
  }

  /**
   * Check if chat has permission
   */
  async hasPermission(chatId, operation, resource = null) {
    const chat = await this.getChat(chatId);
    
    if (!chat) {
      return false;
    }

    return this.permissions.hasPermission(chat.chat_type, operation, resource);
  }
}

