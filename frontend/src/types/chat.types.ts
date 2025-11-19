import type { Chat, ChatMessage } from './api.types';

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  error: string | null;
}

export interface CreateChatRequest {
  chatType: 'admin' | 'user';
  userId?: string;
  metadata?: Record<string, any>;
}

