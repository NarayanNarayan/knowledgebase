/**
 * Integration example for v2 (Chrome Extension)
 * Shows how to use the Knowledge Base API from the browser extension
 * 
 * Prerequisites:
 * 1. Start Docker services: npm run docker:up (or docker-compose up -d)
 * 2. Start the API server: npm start
 * 3. Ensure your .env file has API keys configured
 * 
 * Docker services required:
 * - PostgreSQL with pgvector (port 5432)
 * - Neo4j (ports 7474, 7687)
 */

import { APIClient } from '../src/utils/APIClient.js';

// This would be imported in your v2 extension files

class WebAIKnowledgeBase {
  constructor() {
    this.client = new APIClient('http://localhost:3000/api');
    this.chatId = null;
    this.userId = null;
  }

  /**
   * Initialize session for the extension user
   */
  async initialize(userId) {
    this.userId = userId;
    
    // Create or get user chat
    const chatResult = await this.client.createChat('user', userId, {
      source: 'v2-extension',
      description: 'WebAI Extension Session'
    });
    
    this.chatId = chatResult.chat.chat_id;
    return this.chatId;
  }

  /**
   * Store webpage summary in knowledge base
   */
  async storePageSummary(url, title, summary, metadata = {}) {
    const content = `
Title: ${title}
URL: ${url}
Summary: ${summary}
    `.trim();
    
    return await this.client.ingestDocument(content, {
      title,
      source: url,
      type: 'webpage_summary',
      ...metadata
    });
  }

  /**
   * Find similar pages using RAG
   */
  async findSimilarPages(currentPageSummary) {
    const result = await this.client.query(
      this.chatId,
      `Find pages similar to: ${currentPageSummary}`,
      null,
      {
        useRAG: true,
        ragLimit: 5
      }
    );
    
    return result;
  }

  /**
   * Analyze form with context from knowledge base
   */
  async analyzeForm(formData) {
    const result = await this.client.query(
      this.chatId,
      'Analyze this form and suggest how to fill it based on my profile',
      formData,
      {
        processData: true,
        useRAG: false
      }
    );
    
    return result;
  }

  /**
   * Update user profile from extension settings
   */
  async updateProfile(profileData) {
    return await this.client.updateUserProfile(this.userId, profileData);
  }

  /**
   * Ask a question about stored webpages
   */
  async askQuestion(question) {
    return await this.client.query(
      this.chatId,
      question,
      null,
      {
        useRAG: true,
        useGraph: true
      }
    );
  }

  /**
   * Get conversation history
   */
  async getHistory(limit = 20) {
    return await this.client.getChatHistory(this.chatId, limit);
  }
}

// Example usage in extension

async function exampleExtensionUsage() {
  const kb = new WebAIKnowledgeBase();
  
  // 1. Initialize for user
  console.log('1. Initializing session...');
  await kb.initialize('extension_user_123');
  
  // 2. Update user profile from extension settings
  console.log('2. Updating user profile...');
  await kb.updateProfile({
    username: 'Extension User',
    email: 'user@example.com',
    preferences: {
      autoSummarize: true,
      summaryLength: 'medium'
    }
  });
  
  // 3. Store current page summary
  console.log('3. Storing page summary...');
  const pageInfo = {
    url: 'https://example.com/article',
    title: 'Machine Learning Basics',
    summary: 'An introductory article about machine learning concepts...'
  };
  
  await kb.storePageSummary(
    pageInfo.url,
    pageInfo.title,
    pageInfo.summary,
    { category: 'education', topic: 'AI' }
  );
  
  // 4. Find similar pages
  console.log('4. Finding similar pages...');
  const similarPages = await kb.findSimilarPages(pageInfo.summary);
  console.log('Similar pages:', similarPages.sources);
  
  // 5. Analyze form on current page
  console.log('5. Analyzing form...');
  const formData = {
    fields: [
      { name: 'fullName', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'tel', required: false }
    ]
  };
  
  const formAnalysis = await kb.analyzeForm(formData);
  console.log('Form analysis:', formAnalysis.response);
  
  // 6. Ask about stored knowledge
  console.log('6. Asking question...');
  const answer = await kb.askQuestion(
    'What machine learning topics have I read about?'
  );
  console.log('Answer:', answer.response);
  
  // 7. Get conversation history for UI display
  console.log('7. Getting history...');
  const history = await kb.getHistory(10);
  console.log('History entries:', history.history.length);
  
  console.log('✅ Extension integration example completed!');
}

// Integration with existing v2 services

/**
 * Enhanced AIService using Knowledge Base
 */
class EnhancedAIService {
  constructor() {
    this.kb = new WebAIKnowledgeBase();
  }

  async initialize(userId) {
    await this.kb.initialize(userId);
  }

  async summarizeWithContext(pageContent, pageUrl, pageTitle) {
    // Store summary in knowledge base
    const summary = await this.generateSummary(pageContent);
    
    await this.kb.storePageSummary(pageUrl, pageTitle, summary, {
      timestamp: new Date().toISOString(),
      contentLength: pageContent.length
    });
    
    return summary;
  }

  async findSimilarWithKnowledge(currentSummary) {
    // Use knowledge base instead of local RAG server
    return await this.kb.findSimilarPages(currentSummary);
  }

  async analyzeFormWithProfile(formData) {
    // Use knowledge base with user profile
    return await this.kb.analyzeForm(formData);
  }

  async generateSummary(content) {
    // Original summarization logic
    // This would call Gemini API as before
    return 'Summary of content...';
  }
}

/**
 * Integration in popup controller
 */
class EnhancedPopupController {
  constructor() {
    this.aiService = new EnhancedAIService();
    this.kb = this.aiService.kb;
  }

  async initialize() {
    const { userId } = await chrome.storage.local.get('userId');
    await this.aiService.initialize(userId || 'default_user');
  }

  async handleSummarize() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get page content
    const pageData = await this.getPageContent(tab.id);
    
    // Summarize with knowledge base context
    const summary = await this.aiService.summarizeWithContext(
      pageData.content,
      tab.url,
      tab.title
    );
    
    return summary;
  }

  async handleFindSimilar() {
    const currentSummary = await this.getCurrentPageSummary();
    
    // Find similar using knowledge base
    const similar = await this.aiService.findSimilarWithKnowledge(currentSummary);
    
    return similar;
  }

  async handleAskQuestion(question) {
    // Ask question using knowledge base
    const answer = await this.kb.askQuestion(question);
    return answer.response;
  }

  getPageContent(tabId) {
    // Existing implementation
    return { content: '', url: '', title: '' };
  }

  getCurrentPageSummary() {
    // Existing implementation
    return '';
  }
}

// Export for use in extension
export {
  WebAIKnowledgeBase,
  EnhancedAIService,
  EnhancedPopupController,
  exampleExtensionUsage
};

