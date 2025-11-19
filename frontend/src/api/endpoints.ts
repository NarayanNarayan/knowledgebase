export const API_ENDPOINTS = {
  // Health
  health: '/health',
  models: '/models',
  
  // Chat
  chat: {
    create: '/chat/create',
    get: (chatId: string) => `/chat/${chatId}`,
    history: (chatId: string, limit = 50, offset = 0) => 
      `/chat/${chatId}/history?limit=${limit}&offset=${offset}`,
  },
  
  // Query
  query: '/query',
  queryDirect: '/query/direct',
  
  // Ingestion
  ingest: '/ingest',
  
  // Profile
  profile: {
    createOrUpdate: '/profile',
    get: (userId: string) => `/profile/${userId}`,
  },
  
  // Knowledge Graph
  knowledge: {
    get: (id: string, depth = 1) => `/knowledge/${id}?depth=${depth}`,
    stats: '/stats/graph',
    createEntity: '/knowledge/entity',
    createRelationship: '/knowledge/relationship',
    deleteEntity: (id: string) => `/knowledge/entity/${id}`,
    deleteRelationship: '/knowledge/relationship',
  },
} as const;

