import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Entity, GraphStats, ApiResponse, ModelInfo, HealthStatus } from '../../types/api.types';

export class KnowledgeService {
  async getEntity(id: string, depth = 1): Promise<Entity> {
    const response = await apiClient.get<ApiResponse<{ entity: Entity }>>(
      API_ENDPOINTS.knowledge.get(id, depth)
    );
    if (!response.data.success || !response.data.data?.entity) {
      throw new Error(response.data.error || 'Entity not found');
    }
    return response.data.data.entity;
  }

  async getGraphStats(): Promise<GraphStats> {
    const response = await apiClient.get<ApiResponse<{ stats: GraphStats }>>(
      API_ENDPOINTS.knowledge.stats
    );
    if (!response.data.success || !response.data.data?.stats) {
      throw new Error(response.data.error || 'Failed to fetch graph stats');
    }
    return response.data.data.stats;
  }

  async getHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>(API_ENDPOINTS.health);
    return response.data;
  }

  async getModels(): Promise<{ models: ModelInfo[]; apiKeys: Record<string, boolean> }> {
    const response = await apiClient.get<{ models: ModelInfo[]; apiKeys: Record<string, boolean> }>(
      API_ENDPOINTS.models
    );
    return response.data;
  }

  /**
   * Create or update an entity in the knowledge graph
   */
  async createEntity(
    id: string,
    type: string,
    properties: Record<string, any> = {}
  ): Promise<Entity> {
    const response = await apiClient.post<ApiResponse<{ entity: Entity }>>(
      API_ENDPOINTS.knowledge.createEntity,
      { id, type, properties }
    );
    if (!response.data.success || !response.data.data?.entity) {
      throw new Error(response.data.error || 'Failed to create entity');
    }
    return response.data.data.entity;
  }

  /**
   * Create a relationship between two entities
   */
  async createRelationship(
    fromId: string,
    toId: string,
    relationshipType: string,
    properties: Record<string, any> = {}
  ): Promise<{ relationship: Record<string, any> }> {
    const response = await apiClient.post<ApiResponse<{ relationship: Record<string, any> }>>(
      API_ENDPOINTS.knowledge.createRelationship,
      { fromId, toId, relationshipType, properties }
    );
    if (!response.data.success || !response.data.data?.relationship) {
      throw new Error(response.data.error || 'Failed to create relationship');
    }
    return response.data.data;
  }

  /**
   * Delete an entity from the knowledge graph
   */
  async deleteEntity(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.knowledge.deleteEntity(id)
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete entity');
    }
  }

  /**
   * Delete a relationship between two entities
   */
  async deleteRelationship(
    fromId: string,
    toId: string,
    relationshipType: string
  ): Promise<void> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.knowledge.deleteRelationship,
      {
        data: { fromId, toId, relationshipType },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete relationship');
    }
  }
}

export const knowledgeService = new KnowledgeService();

