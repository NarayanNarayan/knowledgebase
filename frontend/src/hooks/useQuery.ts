import { useCallback } from 'react';
import { useQueryStore } from '../stores/queryStore';
import { queryService } from '../api/services/QueryService';
import type { QueryOptions } from '../types/api.types';

export const useQuery = () => {
  const {
    currentQuery,
    options,
    response,
    loading,
    error,
    setCurrentQuery,
    setOptions,
    resetOptions,
    setResponse,
    setLoading,
    setError,
    reset,
  } = useQueryStore();

  const executeQuery = useCallback(async (
    chatId: string,
    prompt: string,
    data?: any,
    queryOptions?: Partial<QueryOptions>
  ) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentQuery(prompt);
      
      const mergedOptions = { ...options, ...queryOptions };
      const result = await queryService.query(chatId, prompt, data, mergedOptions);
      
      setResponse(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Query failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options, setCurrentQuery, setResponse, setLoading, setError]);

  const executeDirectQuery = useCallback(async (
    prompt: string,
    data?: any,
    queryOptions?: Partial<QueryOptions & { chatType?: 'admin' | 'user' }>
  ) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentQuery(prompt);
      
      const mergedOptions = { ...options, ...queryOptions };
      const result = await queryService.queryDirect(prompt, data, mergedOptions);
      
      setResponse(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Query failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options, setCurrentQuery, setResponse, setLoading, setError]);

  return {
    currentQuery,
    options,
    response,
    loading,
    error,
    executeQuery,
    executeDirectQuery,
    setCurrentQuery,
    setOptions,
    resetOptions,
    reset,
  };
};

