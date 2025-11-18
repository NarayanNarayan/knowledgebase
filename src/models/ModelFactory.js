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
      return new GoogleGenerativeAIEmbeddings({
        apiKey: this.config.providers.google.apiKey,
        modelName: model,
      });
    } else if (this.config.providers.openai.embeddings[model]) {
      return new OpenAIEmbeddings({
        apiKey: this.config.providers.openai.apiKey,
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

    return new ChatGoogleGenerativeAI({
      apiKey: this.config.providers.google.apiKey,
      modelName: modelConfig.name,
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

    return new ChatOpenAI({
      apiKey: this.config.providers.openai.apiKey,
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

    return new ChatAnthropic({
      apiKey: this.config.providers.anthropic.apiKey,
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

