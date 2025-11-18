import { RouterAgent } from './RouterAgent.js';
import { RAGAgent } from './RAGAgent.js';
import { KnowledgeGraphAgent } from './KnowledgeGraphAgent.js';
import { DataProcessingAgent } from './DataProcessingAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ContextBuilder } from '../utils/ContextBuilder.js';
import { ResultSynthesizer } from '../utils/ResultSynthesizer.js';
import { AgentExecutor } from '../utils/AgentExecutor.js';
import { MetadataExtractor } from '../utils/MetadataExtractor.js';
import { AGENT_TYPES } from '../constants/AgentTypes.js';
import { PromptTemplates } from '../prompts/PromptTemplates.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

/**
 * Agent Orchestrator - Coordinates multi-agent workflows
 * Refactored to use dependency injection and extracted utilities
 */
export class AgentOrchestrator {
  constructor(
    storageService,
    modelFactory,
    chatService,
    userProfileService,
    permissionService,
    embeddingService,
    contextBuilder = null,
    resultSynthesizer = null
  ) {
    this.storage = storageService;
    this.modelFactory = modelFactory;
    this.chatService = chatService;
    this.userProfileService = userProfileService;
    this.permissions = permissionService;
    this.embedding = embeddingService;

    // Use injected utilities or create new ones
    this.contextBuilder = contextBuilder || new ContextBuilder(
      modelFactory,
      permissionService,
      chatService,
      userProfileService
    );
    this.resultSynthesizer = resultSynthesizer || new ResultSynthesizer(modelFactory);
    this.metadataExtractor = new MetadataExtractor();

    // Initialize agents
    this.routerAgent = new RouterAgent(modelFactory);
    this.ragAgent = new RAGAgent(modelFactory, storageService, this.embedding);
    this.graphAgent = new KnowledgeGraphAgent(modelFactory, storageService.neo4j, this.permissions);
    this.dataAgent = new DataProcessingAgent(modelFactory, this.permissions);

    // Initialize agent executor
    this.agentExecutor = new AgentExecutor(
      this.ragAgent,
      this.graphAgent,
      this.dataAgent
    );
  }

  /**
   * Initialize orchestrator
   */
  async initialize() {
    // Any initialization needed
    console.log('Agent Orchestrator initialized');
  }

  /**
   * Execute multi-agent workflow
   */
  async execute(prompt, data = null, options = {}) {
    // Build context using ContextBuilder
    const context = await this.contextBuilder.buildContext(options);

    const agentsUsed = [];
    const toolsUsed = [];
    let finalResponse = '';
    let agentResults = []; // Declare in outer scope

    try {
      // Step 1: Route the request
      const routing = await this.routerAgent.route(prompt, data, context);
      console.log('Routing decision:', routing);

      // Step 2: Execute agents based on routing
      if (routing.agents.includes(AGENT_TYPES.DIRECT_RESPONSE)) {
        finalResponse = await this.directResponse(prompt, context);
        agentsUsed.push(AGENT_TYPES.DIRECT_RESPONSE);
      } else {
        // Execute agents using AgentExecutor
        agentResults = await this.agentExecutor.executeAgents(prompt, data, routing, context);
        agentsUsed = this.agentExecutor.getAgentsUsed(routing, context);

        // Step 3: Synthesize results using ResultSynthesizer
        if (agentResults.length > 0) {
          finalResponse = await this.resultSynthesizer.synthesize(prompt, agentResults, context);
        } else {
          finalResponse = await this.directResponse(prompt, context);
          agentsUsed.push(AGENT_TYPES.DIRECT_RESPONSE);
        }
      }

      const result = {
        response: finalResponse,
        agentsUsed,
        toolsUsed,
        routing,
      };
      
      // Extract and include metadata using MetadataExtractor
      const metadata = this.metadataExtractor.extractAllMetadata(agentResults);
      if (metadata.ragMetadata) {
        result.ragMetadata = metadata.ragMetadata;
      }
      if (metadata.sources) {
        result.sources = metadata.sources;
      }
      
      return result;
    } catch (error) {
      console.error('Error in agent orchestration:', error);
      const errorResponse = ErrorHandler.handle(error, { logError: false });
      return {
        response: errorResponse.error.message,
        agentsUsed,
        toolsUsed,
        error: errorResponse.error.message,
      };
    }
  }

  /**
   * Direct response without specialized agents
   */
  async directResponse(prompt, context) {
    const model = this.modelFactory.getModel(context.model);

    // Build system message with chat history and user profile
    let systemMessage = PromptTemplates.DIRECT_RESPONSE_SYSTEM;
    
    if (context.userProfile) {
      const profileService = this.userProfileService;
      systemMessage += profileService.formatProfileForSystemMessage(context.userProfile);
    }

    const messages = [
      ['system', systemMessage],
    ];

    // Add chat history
    if (context.chatHistory && context.chatHistory.length > 0) {
      context.chatHistory.forEach(msg => {
        messages.push([msg.role, msg.content]);
      });
    }

    // Add current prompt
    messages.push(['user', prompt]);

    const chatPrompt = ChatPromptTemplate.fromMessages(messages);
    const chain = chatPrompt.pipe(model);
    
    const response = await chain.invoke({});
    return response.content;
  }

  /**
   * Synthesize results from multiple agents
   * @deprecated Use this.resultSynthesizer.synthesize() instead
   */
  async synthesizeResults(prompt, agentResults, context) {
    return await this.resultSynthesizer.synthesize(prompt, agentResults, context);
  }

  /**
   * Execute with chat context
   */
  async executeWithChat(chatId, prompt, data = null, options = {}) {
    const context = await this.contextBuilder.buildContextFromChat(chatId, options);
    return await this.execute(prompt, data, context);
  }
}

