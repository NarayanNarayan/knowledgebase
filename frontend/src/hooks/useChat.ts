import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { chatService } from '../api/services/ChatService';
import type { CreateChatRequest } from '../types/chat.types';

export const useChat = () => {
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    setChats,
    addChat,
    setCurrentChat,
    setMessages,
    addMessage,
    setLoading,
    setError,
  } = useChatStore();

  const createChat = useCallback(async (request: CreateChatRequest) => {
    try {
      setLoading(true);
      setError(null);
      const chat = await chatService.createChat(request);
      addChat(chat);
      setCurrentChat(chat);
      return chat;
    } catch (err: any) {
      setError(err.message || 'Failed to create chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addChat, setCurrentChat, setLoading, setError]);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      const chat = await chatService.getChat(chatId);
      setCurrentChat(chat);
      return chat;
    } catch (err: any) {
      setError(err.message || 'Failed to load chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentChat, setLoading, setError]);

  const loadChatHistory = useCallback(async (chatId: string, limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const history = await chatService.getChatHistory(chatId, limit, offset);
      setMessages(chatId, history);
      return history;
    } catch (err: any) {
      setError(err.message || 'Failed to load chat history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setMessages, setLoading, setError]);

  const getChatMessages = useCallback((chatId: string) => {
    return messages[chatId] || [];
  }, [messages]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    createChat,
    loadChat,
    loadChatHistory,
    getChatMessages,
    setCurrentChat,
    addMessage,
  };
};

