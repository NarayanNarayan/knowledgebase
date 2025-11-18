import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

/**
 * File System Tool for reading and writing files
 */
export class FileSystemTool {
  constructor(baseDirectory = process.cwd(), permissionService) {
    this.baseDirectory = baseDirectory;
    this.permissions = permissionService;
  }

  /**
   * Create read file tool
   */
  createReadFileTool(chatType) {
    return new DynamicStructuredTool({
      name: 'read_file',
      description: 'Read contents of a file from the file system',
      schema: z.object({
        filePath: z.string().describe('Path to the file to read'),
      }),
      func: async ({ filePath }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'files');
          const fullPath = path.resolve(this.baseDirectory, filePath);
          const content = await fs.readFile(fullPath, 'utf-8');
          return content;
        } catch (error) {
          return `Error reading file: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create write file tool
   */
  createWriteFileTool(chatType) {
    return new DynamicStructuredTool({
      name: 'write_file',
      description: 'Write or update a file in the file system',
      schema: z.object({
        filePath: z.string().describe('Path to the file to write'),
        content: z.string().describe('Content to write to the file'),
      }),
      func: async ({ filePath, content }) => {
        try {
          this.permissions.validateOperation(chatType, 'write', 'files');
          const fullPath = path.resolve(this.baseDirectory, filePath);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content, 'utf-8');
          return `Successfully wrote to ${filePath}`;
        } catch (error) {
          return `Error writing file: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create list directory tool
   */
  createListDirectoryTool(chatType) {
    return new DynamicStructuredTool({
      name: 'list_directory',
      description: 'List files and directories in a given path',
      schema: z.object({
        dirPath: z.string().describe('Path to the directory to list'),
      }),
      func: async ({ dirPath }) => {
        try {
          this.permissions.validateOperation(chatType, 'read', 'files');
          const fullPath = path.resolve(this.baseDirectory, dirPath);
          const items = await fs.readdir(fullPath, { withFileTypes: true });
          const result = items.map(item => ({
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file',
          }));
          return JSON.stringify(result, null, 2);
        } catch (error) {
          return `Error listing directory: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create delete file tool
   */
  createDeleteFileTool(chatType) {
    return new DynamicStructuredTool({
      name: 'delete_file',
      description: 'Delete a file from the file system',
      schema: z.object({
        filePath: z.string().describe('Path to the file to delete'),
      }),
      func: async ({ filePath }) => {
        try {
          this.permissions.validateOperation(chatType, 'delete', 'files');
          const fullPath = path.resolve(this.baseDirectory, filePath);
          await fs.unlink(fullPath);
          return `Successfully deleted ${filePath}`;
        } catch (error) {
          return `Error deleting file: ${error.message}`;
        }
      },
    });
  }

  /**
   * Get all file system tools based on permissions
   */
  getAllTools(chatType) {
    const tools = [
      this.createReadFileTool(chatType),
      this.createListDirectoryTool(chatType),
    ];

    if (this.permissions.hasPermission(chatType, 'write', 'files')) {
      tools.push(this.createWriteFileTool(chatType));
    }

    if (this.permissions.hasPermission(chatType, 'delete', 'files')) {
      tools.push(this.createDeleteFileTool(chatType));
    }

    return tools;
  }
}

