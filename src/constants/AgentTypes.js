/**
 * Agent type constants to replace magic strings
 */
export const AGENT_TYPES = {
  RAG_AGENT: 'RAG_AGENT',
  KNOWLEDGE_GRAPH_AGENT: 'KNOWLEDGE_GRAPH_AGENT',
  DATA_PROCESSING_AGENT: 'DATA_PROCESSING_AGENT',
  DIRECT_RESPONSE: 'DIRECT_RESPONSE',
  ROUTER_AGENT: 'ROUTER_AGENT',
};

/**
 * Retrieval method constants
 */
export const RETRIEVAL_METHODS = {
  VECTOR: 'vector',
  HYBRID: 'hybrid',
  ITERATIVE_VECTOR: 'iterative-vector',
  ITERATIVE_HYBRID: 'iterative-hybrid',
};

/**
 * Operation constants for permissions
 */
export const OPERATIONS = {
  READ: 'read',
  WRITE: 'write',
  CREATE: 'create',
  MODIFY: 'modify',
  UPDATE: 'update',
  DELETE: 'delete',
};

/**
 * Resource types for permissions
 */
export const RESOURCES = {
  GRAPH: 'graph',
  FILES: 'files',
  PROFILES: 'profiles',
  CHATS: 'chats',
  DOCUMENTS: 'documents',
  EMBEDDINGS: 'embeddings',
};

/**
 * Chat types
 */
export const CHAT_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
};

