import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || '',
  },
  postgres: {
    connectionString: process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/knowledgebase',
    // PostgreSQL table schemas
    tables: {
      userProfiles: 'user_profiles',
      chats: 'chats',
      chatMessages: 'chat_messages',
      documents: 'documents',
      embeddings: 'embeddings',
    },
  },
};

// SQL Schema definitions (for reference/initialization)
export const postgresSchemas = {
  userProfiles: `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      preferences JSONB,
      custom_fields JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  chats: `
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      chat_id VARCHAR(255) UNIQUE NOT NULL,
      chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('admin', 'user')),
      user_id VARCHAR(255),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
    );
  `,
  chatMessages: `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      message_id VARCHAR(255) UNIQUE NOT NULL,
      chat_id VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
  `,
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      doc_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500),
      content TEXT,
      source VARCHAR(500),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  embeddings: `
    CREATE EXTENSION IF NOT EXISTS vector;
    
    CREATE TABLE IF NOT EXISTS embeddings (
      id SERIAL PRIMARY KEY,
      doc_id VARCHAR(255) NOT NULL,
      chunk_index INTEGER,
      content TEXT NOT NULL,
      embedding vector(768),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doc_id) REFERENCES documents(doc_id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_embeddings_doc_id ON embeddings(doc_id);
    CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);
  `,
};

