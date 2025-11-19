import { create } from 'zustand';
import type { Chat, ChatMessage } from '../types/api.types';
import type { ChatState } from '../types/chat.types';

interface ChatStore extends ChatState {
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  clearMessages: (chatId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  currentChat: null,
  messages: {},
  loading: false,
  error: null,
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  clearMessages: (chatId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[chatId];
      return { messages: newMessages };
    }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

