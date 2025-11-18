/**
 * Simple Dependency Injection Container
 * Manages service registration and resolution
 */
export class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
  }

  /**
   * Register a service with a factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   * @param {boolean} singleton - Whether to create as singleton (default: true)
   */
  register(name, factory, singleton = true) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for ${name} must be a function`);
    }
    
    this.factories.set(name, { factory, singleton });
  }

  /**
   * Register a service instance directly
   * @param {string} name - Service name
   * @param {*} instance - Service instance
   */
  registerInstance(name, instance) {
    this.singletons.set(name, instance);
  }

  /**
   * Register a service class (will be instantiated on resolve)
   * @param {string} name - Service name
   * @param {Function} ServiceClass - Service class constructor
   * @param {Array<string>} dependencies - Array of dependency names
   * @param {boolean} singleton - Whether to create as singleton (default: true)
   */
  registerClass(name, ServiceClass, dependencies = [], singleton = true) {
    this.factories.set(name, {
      factory: (...args) => {
        // If dependencies provided, resolve them first
        if (dependencies.length > 0) {
          const resolvedDeps = dependencies.map(dep => this.resolve(dep));
          return new ServiceClass(...resolvedDeps);
        }
        return new ServiceClass(...args);
      },
      singleton,
      ServiceClass,
      dependencies,
    });
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    // Check if already resolved as singleton
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check if factory exists
    if (!this.factories.has(name)) {
      throw new Error(`Service ${name} is not registered`);
    }

    const { factory, singleton, dependencies } = this.factories.get(name);

    // Resolve dependencies if needed
    let instance;
    if (dependencies && dependencies.length > 0) {
      const resolvedDeps = dependencies.map(dep => this.resolve(dep));
      instance = factory(...resolvedDeps);
    } else {
      instance = factory();
    }

    // Store as singleton if needed
    if (singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} Whether service is registered
   */
  has(name) {
    return this.factories.has(name) || this.singletons.has(name);
  }

  /**
   * Clear all registered services (useful for testing)
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  /**
   * Get all registered service names
   * @returns {Array<string>} Array of service names
   */
  getRegisteredServices() {
    const factoryNames = Array.from(this.factories.keys());
    const instanceNames = Array.from(this.singletons.keys());
    return [...new Set([...factoryNames, ...instanceNames])];
  }
}

/**
 * Global container instance
 */
let globalContainer = null;

/**
 * Get or create the global container
 * @returns {Container} Global container instance
 */
export function getContainer() {
  if (!globalContainer) {
    globalContainer = new Container();
  }
  return globalContainer;
}

/**
 * Set the global container (useful for testing)
 * @param {Container} container - Container instance
 */
export function setContainer(container) {
  globalContainer = container;
}

