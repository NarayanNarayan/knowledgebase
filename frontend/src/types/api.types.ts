export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface Chat {
  chat_id: string;
  chat_type: 'admin' | 'user';
  user_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  message_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface QueryOptions {
  model?: string;
  useRAG?: boolean;
  useGraph?: boolean;
  useHybrid?: boolean;
  useIterative?: boolean;
  maxIterations?: number;
  confidenceThreshold?: number;
  graphDepth?: number;
  ragLimit?: number;
  ragThreshold?: number;
  processData?: boolean;
}

export interface QueryResponse {
  success: boolean;
  response: string;
  agentsUsed?: string[];
  toolsUsed?: string[];
  sources?: Source[];
  routing?: Record<string, any>;
  ragMetadata?: {
    retrievalMethod: string;
    iterations?: number;
    totalResultsRetrieved?: number;
  };
  error?: string;
}

export interface Source {
  docId: string;
  title: string;
  source: string;
  similarity?: number;
  relatedEntities?: string;
}

export interface Document {
  doc_id: string;
  title: string;
  content: string;
  source: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferences?: Record<string, any>;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  description?: string;
  properties?: Record<string, any>;
  relationships?: Relationship[];
}

export interface Relationship {
  type: string;
  target: Entity;
  properties?: Record<string, any>;
}

export interface GraphStats {
  nodeCount: number;
  relationshipCount: number;
  nodeTypes: Record<string, number>;
  relationshipTypes: Record<string, number>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  available: boolean;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

