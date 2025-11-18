/**
 * Config Merger Utility
 * Merges configuration objects with proper handling of defaults
 */
export class ConfigMerger {
  /**
   * Deep merge two configuration objects
   * @param {object} base - Base configuration
   * @param {object} override - Override configuration
   * @returns {object} Merged configuration
   */
  static merge(base, override) {
    if (!base) return override || {};
    if (!override) return base;

    const merged = { ...base };

    for (const key in override) {
      if (override[key] === null || override[key] === undefined) {
        // Skip null/undefined overrides
        continue;
      }

      if (this.isPlainObject(override[key]) && this.isPlainObject(base[key])) {
        // Recursively merge objects
        merged[key] = this.merge(base[key], override[key]);
      } else {
        // Override with new value
        merged[key] = override[key];
      }
    }

    return merged;
  }

  /**
   * Merge multiple configurations
   * @param {...object} configs - Configuration objects to merge
   * @returns {object} Merged configuration
   */
  static mergeAll(...configs) {
    return configs.reduce((acc, config) => this.merge(acc, config), {});
  }

  /**
   * Merge with defaults
   * @param {object} defaults - Default values
   * @param {object} config - User configuration
   * @returns {object} Merged configuration
   */
  static withDefaults(defaults, config) {
    return this.merge(defaults, config);
  }

  /**
   * Check if value is plain object
   * @param {*} obj - Value to check
   * @returns {boolean} Whether value is plain object
   */
  static isPlainObject(obj) {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      !Array.isArray(obj) &&
      obj.constructor === Object
    );
  }

  /**
   * Deep clone configuration
   * @param {object} config - Configuration to clone
   * @returns {object} Cloned configuration
   */
  static clone(config) {
    if (!this.isPlainObject(config)) {
      return config;
    }

    const cloned = {};
    for (const key in config) {
      if (this.isPlainObject(config[key])) {
        cloned[key] = this.clone(config[key]);
      } else if (Array.isArray(config[key])) {
        cloned[key] = [...config[key]];
      } else {
        cloned[key] = config[key];
      }
    }

    return cloned;
  }
}

