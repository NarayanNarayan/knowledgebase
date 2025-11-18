import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { modelsConfig } from '../../config/models.config.js';

/**
 * Factory class for creating and managing different AI model providers
 */
export class ModelFactory {
  constructor() {
    this.config = modelsConfig;
  }

  /**
   * Get an LLM model based on provider and model name
   * @param {string} modelIdentifier - e.g., 'gemini-pro', 'gpt-4', 'claude-3-opus'
   * @param {object} options - Additional options for the model
   * @returns {object} - LangChain LLM instance
   */
  getModel(modelIdentifier, options = {}) {
    const provider = this.detectProvider(modelIdentifier);
    
    if (!provider) {
      throw new Error(`Unknown model identifier: ${modelIdentifier}`);
    }

    switch (provider) {
      case 'google':
        return this.getGoogleModel(modelIdentifier, options);
      case 'openai':
        return this.getOpenAIModel(modelIdentifier, options);
      case 'anthropic':
        return this.getAnthropicModel(modelIdentifier, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get embedding model
   * @param {string} embeddingModel - Embedding model identifier
   * @returns {object} - LangChain Embeddings instance
   */
  getEmbeddings(embeddingModel = null) {
    const model = embeddingModel || this.config.defaultEmbeddingModel;
    
    if (this.config.providers.google.embeddings[model]) {
      const apiKey = this.config.providers.google.apiKey;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY is not set. Please set it as an environment variable: GOOGLE_API_KEY=your_api_key');
      }
      return new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        modelName: model,
      });
    } else if (this.config.providers.openai.embeddings[model]) {
      const apiKey = this.config.providers.openai.apiKey;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set. Please set it as an environment variable: OPENAI_API_KEY=your_api_key');
      }
      return new OpenAIEmbeddings({
        apiKey: apiKey,
        modelName: this.config.providers.openai.embeddings[model].name,
      });
    }
    
    throw new Error(`Unknown embedding model: ${model}`);
  }

  /**
   * Get Google Gemini model
   */
  getGoogleModel(modelIdentifier, options) {
    const modelConfig = this.config.providers.google.models[modelIdentifier];
    
    if (!modelConfig) {
      throw new Error(`Unknown Google model: ${modelIdentifier}`);
    }

    const apiKey = this.config.providers.google.apiKey;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set. Please set it as an environment variable: GOOGLE_API_KEY=your_api_key');
    }

    return new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: modelConfig.name,
      temperature: options.temperature ?? modelConfig.temperature,
      maxOutputTokens: options.maxTokens ?? modelConfig.maxTokens,
      ...options,
    });
  }

  /**
   * Get OpenAI model
   */
  getOpenAIModel(modelIdentifier, options) {
    const modelConfig = this.config.providers.openai.models[modelIdentifier];
    
    if (!modelConfig) {
      throw new Error(`Unknown OpenAI model: ${modelIdentifier}`);
    }

    const apiKey = this.config.providers.openai.apiKey;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Please set it as an environment variable: OPENAI_API_KEY=your_api_key');
    }

    return new ChatOpenAI({
      apiKey: apiKey,
      modelName: modelConfig.name,
      temperature: options.temperature ?? modelConfig.temperature,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens,
      ...options,
    });
  }

  /**
   * Get Anthropic Claude model
   */
  getAnthropicModel(modelIdentifier, options) {
    const modelConfig = this.config.providers.anthropic.models[modelIdentifier];
    
    if (!modelConfig) {
      throw new Error(`Unknown Anthropic model: ${modelIdentifier}`);
    }

    const apiKey = this.config.providers.anthropic.apiKey;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please set it as an environment variable: ANTHROPIC_API_KEY=your_api_key');
    }

    return new ChatAnthropic({
      apiKey: apiKey,
      modelName: modelConfig.name,
      temperature: options.temperature ?? modelConfig.temperature,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens,
      ...options,
    });
  }

  /**
   * Detect provider from model identifier
   */
  detectProvider(modelIdentifier) {
    if (this.config.providers.google.models[modelIdentifier]) {
      return 'google';
    } else if (this.config.providers.openai.models[modelIdentifier]) {
      return 'openai';
    } else if (this.config.providers.anthropic.models[modelIdentifier]) {
      return 'anthropic';
    }
    return null;
  }

  /**
   * List all available models
   */
  listAvailableModels() {
    const models = [];
    
    for (const [provider, config] of Object.entries(this.config.providers)) {
      if (config.models) {
        for (const modelId of Object.keys(config.models)) {
          models.push({
            id: modelId,
            provider,
            available: !!config.apiKey,
          });
        }
      }
    }
    
    return models;
  }

  /**
   * Validate API keys
   */
  validateApiKeys() {
    const validation = {
      google: !!this.config.providers.google.apiKey,
      openai: !!this.config.providers.openai.apiKey,
      anthropic: !!this.config.providers.anthropic.apiKey,
    };
    
    return {
      ...validation,
      hasAnyKey: Object.values(validation).some(v => v),
    };
  }
}

