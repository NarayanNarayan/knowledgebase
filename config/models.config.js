import dotenv from 'dotenv';

dotenv.config();

export const modelsConfig = {
  defaultProvider: process.env.DEFAULT_MODEL || 'gemini-pro',
  defaultEmbeddingModel: process.env.DEFAULT_EMBEDDING_MODEL || 'text-embedding-004',
  
  providers: {
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      models: {
        'gemini-pro': {
          name: 'gemini-pro',
          temperature: 0.7,
          maxTokens: 8192,
        },
        'gemini-1.5-pro': {
          name: 'gemini-1.5-pro',
          temperature: 0.7,
          maxTokens: 32768,
        },
        'gemini-1.5-flash': {
          name: 'gemini-1.5-flash',
          temperature: 0.7,
          maxTokens: 8192,
        },
      },
      embeddings: {
        'text-embedding-004': {
          name: 'text-embedding-004',
          dimensions: 768,
        },
      },
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        'gpt-4': {
          name: 'gpt-4',
          temperature: 0.7,
          maxTokens: 8192,
        },
        'gpt-4-turbo': {
          name: 'gpt-4-turbo-preview',
          temperature: 0.7,
          maxTokens: 128000,
        },
        'gpt-3.5-turbo': {
          name: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        },
      },
      embeddings: {
        'text-embedding-3-small': {
          name: 'text-embedding-3-small',
          dimensions: 1536,
        },
        'text-embedding-3-large': {
          name: 'text-embedding-3-large',
          dimensions: 3072,
        },
      },
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: {
        'claude-3-opus': {
          name: 'claude-3-opus-20240229',
          temperature: 0.7,
          maxTokens: 4096,
        },
        'claude-3-sonnet': {
          name: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          maxTokens: 4096,
        },
        'claude-3-5-sonnet': {
          name: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
          maxTokens: 8192,
        },
        'claude-3-haiku': {
          name: 'claude-3-haiku-20240307',
          temperature: 0.7,
          maxTokens: 4096,
        },
      },
    },
  },
};

