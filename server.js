#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageService } from './src/storage/StorageService.js';
import { ModelFactory } from './src/models/ModelFactory.js';
import { AgentService } from './src/services/AgentService.js';
import { ChatService } from './src/services/ChatService.js';
import { UserProfileService } from './src/services/UserProfileService.js';
import { IngestionService } from './src/services/IngestionService.js';
import { PermissionService } from './src/services/PermissionService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize services
let storage, agentService, chatService, userProfileService, ingestionService, permissions, modelFactory;

async function initializeServices() {
  console.log('Initializing services...');
  
  storage = new StorageService();
  await storage.initialize();
  
  modelFactory = new ModelFactory();
  permissions = new PermissionService();
  chatService = new ChatService(storage.postgres, permissions);
  userProfileService = new UserProfileService(storage.postgres);
  agentService = new AgentService(storage, chatService, userProfileService);
  ingestionService = new IngestionService(storage);
  
  await agentService.initialize();
  
  console.log('Services initialized successfully');
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Knowledge Base',
    version: '1.0.0',
  });
});

// List available models
app.get('/api/models', (req, res) => {
  const models = modelFactory.listAvailableModels();
  const validation = modelFactory.validateApiKeys();
  
  res.json({
    models,
    apiKeys: validation,
  });
});

// Create chat
app.post('/api/chat/create', async (req, res) => {
  try {
    const { chatType, userId, metadata } = req.body;
    const chat = await chatService.createChat(chatType, userId, metadata);
    res.json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get chat
app.get('/api/chat/:chatId', async (req, res) => {
  try {
    const chat = await chatService.getChat(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get chat history
app.get('/api/chat/:chatId/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = await chatService.getHistory(req.params.chatId, parseInt(limit), parseInt(offset));
    res.json({ success: true, history });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Main query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { chatId, prompt, data, options = {} } = req.body;
    
    if (!chatId || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId and prompt are required' 
      });
    }

    const result = await agentService.execute(chatId, prompt, data, options);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Direct query (without chat context)
app.post('/api/query/direct', async (req, res) => {
  try {
    const { prompt, data, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'prompt is required' 
      });
    }

    const result = await agentService.executeDirect(prompt, data, options);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ingest document
app.post('/api/ingest', async (req, res) => {
  try {
    const { content, metadata = {} } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'content is required' 
      });
    }

    const result = await ingestionService.ingestDocument(content, metadata);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get knowledge graph node
app.get('/api/knowledge/:id', async (req, res) => {
  try {
    const { depth = 1 } = req.query;
    const result = await storage.neo4j.getEntityWithRelationships(
      req.params.id, 
      parseInt(depth)
    );
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entity not found' 
      });
    }
    
    res.json({
      success: true,
      entity: result,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// User profile endpoints
app.post('/api/profile', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const profile = await userProfileService.upsertProfile(userId, profileData);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await userProfileService.getProfile(req.params.userId);
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        error: 'Profile not found' 
      });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Graph statistics
app.get('/api/stats/graph', async (req, res) => {
  try {
    const stats = await storage.neo4j.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
async function start() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 AI Knowledge Base Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`📚 Models: http://localhost:${PORT}/api/models\n`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down server...');
      await storage.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();

