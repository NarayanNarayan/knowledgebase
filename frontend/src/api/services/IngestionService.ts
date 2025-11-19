import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Document, ApiResponse } from '../../types/api.types';

export interface IngestionRequest {
  content: string;
  metadata?: {
    title?: string;
    source?: string;
    author?: string;
    [key: string]: any;
  };
}

export class IngestionService {
  async ingestDocument(request: IngestionRequest): Promise<Document> {
    const response = await apiClient.post<ApiResponse<{ doc_id: string; [key: string]: any }>>(
      API_ENDPOINTS.ingest,
      request
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to ingest document');
    }
    // Transform response to Document format
    return {
      doc_id: response.data.data?.doc_id || '',
      title: request.metadata?.title || '',
      content: request.content,
      source: request.metadata?.source || '',
      metadata: request.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export const ingestionService = new IngestionService();

