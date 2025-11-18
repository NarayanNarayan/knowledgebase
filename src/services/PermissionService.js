import { PermissionError, ValidationError } from '../errors/DomainError.js';

/**
 * Permission Service for managing chat permissions
 * Refactored to use custom error classes
 */
export class PermissionService {
  constructor() {
    this.permissions = {
      admin: {
        canRead: true,
        canWrite: true,
        canModify: true,
        canDelete: true,
        resources: ['graph', 'files', 'profiles', 'chats', 'documents', 'embeddings'],
      },
      user: {
        canRead: true,
        canWrite: false,
        canModify: false,
        canDelete: false,
        resources: ['graph', 'files', 'documents', 'embeddings'], // read-only
      },
    };
  }

  /**
   * Check if a chat type has permission for an operation
   */
  hasPermission(chatType, operation, resource = null) {
    const perms = this.permissions[chatType];
    
    if (!perms) {
      throw new ValidationError(`Unknown chat type: ${chatType}`, 'chatType', chatType);
    }

    // Check resource access
    if (resource && !perms.resources.includes(resource)) {
      return false;
    }

    // Check operation permission
    switch (operation) {
      case 'read':
        return perms.canRead;
      case 'write':
      case 'create':
        return perms.canWrite;
      case 'modify':
      case 'update':
        return perms.canModify;
      case 'delete':
        return perms.canDelete;
      default:
        return false;
    }
  }

  /**
   * Validate operation for chat type
   */
  validateOperation(chatType, operation, resource = null) {
    if (!this.hasPermission(chatType, operation, resource)) {
      throw new PermissionError(
        `Permission denied: ${chatType} chat cannot ${operation} ${resource || 'resource'}`,
        resource,
        operation
      );
    }
    return true;
  }

  /**
   * Get all permissions for a chat type
   */
  getPermissions(chatType) {
    return this.permissions[chatType] || null;
  }

  /**
   * Check if chat type is admin
   */
  isAdmin(chatType) {
    return chatType === 'admin';
  }

  /**
   * Filter operations based on permissions
   */
  filterOperations(chatType, operations) {
    return operations.filter(op => 
      this.hasPermission(chatType, op.operation, op.resource)
    );
  }
}

