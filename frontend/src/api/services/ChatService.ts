import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Chat, ChatMessage, ApiResponse } from '../../types/api.types';
import type { CreateChatRequest } from '../../types/chat.types';

export class ChatService {
  async createChat(request: CreateChatRequest): Promise<Chat> {
    const response = await apiClient.post<ApiResponse<{ chat: Chat }>>(
      API_ENDPOINTS.chat.create,
      request
    );
    if (!response.data.success || !response.data.data?.chat) {
      throw new Error(response.data.error || 'Failed to create chat');
    }
    return response.data.data.chat;
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await apiClient.get<ApiResponse<{ chat: Chat }>>(
      API_ENDPOINTS.chat.get(chatId)
    );
    if (!response.data.success || !response.data.data?.chat) {
      throw new Error(response.data.error || 'Chat not found');
    }
    return response.data.data.chat;
  }

  async getChatHistory(
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<{ history: ChatMessage[] }>>(
      API_ENDPOINTS.chat.history(chatId, limit, offset)
    );
    if (!response.data.success || !response.data.data?.history) {
      throw new Error(response.data.error || 'Failed to fetch chat history');
    }
    return response.data.data.history;
  }
}

export const chatService = new ChatService();

