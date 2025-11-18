#!/usr/bin/env node

import { MCPServer } from './src/mcp/MCPServer.js';
import { StorageService } from './src/storage/StorageService.js';
import { ModelFactory } from './src/models/ModelFactory.js';
import { PermissionService } from './src/services/PermissionService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MCP Server Entry Point
 */
async function main() {
  try {
    console.error('Initializing MCP Server...');

    // Initialize services
    const storage = new StorageService();
    await storage.initialize();

    const modelFactory = new ModelFactory();
    const permissions = new PermissionService();

    // Create and start MCP server
    const mcpServer = new MCPServer(storage, modelFactory, permissions);
    await mcpServer.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('\nShutting down MCP Server...');
      await storage.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting MCP Server:', error);
    process.exit(1);
  }
}

main();

