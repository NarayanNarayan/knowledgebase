import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { QueryResponse, ApiResponse, QueryOptions } from '../../types/api.types';

export class QueryService {
  async query(
    chatId: string,
    prompt: string,
    data?: any,
    options?: QueryOptions
  ): Promise<QueryResponse> {
    const response = await apiClient.post<QueryResponse>(
      API_ENDPOINTS.query,
      {
        chatId,
        prompt,
        data,
        options: options || {},
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Query failed');
    }
    return response.data;
  }

  async queryDirect(
    prompt: string,
    data?: any,
    options?: QueryOptions & { chatType?: 'admin' | 'user' }
  ): Promise<QueryResponse> {
    const response = await apiClient.post<QueryResponse>(
      API_ENDPOINTS.queryDirect,
      {
        prompt,
        data,
        options: options || {},
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Query failed');
    }
    return response.data;
  }
}

export const queryService = new QueryService();

