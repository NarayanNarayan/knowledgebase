import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Data Transform Tool for programmatic data processing
 */
export class DataTransformTool {
  constructor(permissionService) {
    this.permissions = permissionService;
  }

  /**
   * Create JSON parse tool
   */
  createJsonParseTool(chatType) {
    return new DynamicStructuredTool({
      name: 'parse_json',
      description: 'Parse JSON string into object',
      schema: z.object({
        jsonString: z.string().describe('JSON string to parse'),
      }),
      func: async ({ jsonString }) => {
        try {
          const parsed = JSON.parse(jsonString);
          return JSON.stringify(parsed, null, 2);
        } catch (error) {
          return `Error parsing JSON: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create data filter tool
   */
  createFilterDataTool(chatType) {
    return new DynamicStructuredTool({
      name: 'filter_data',
      description: 'Filter array of objects based on a condition',
      schema: z.object({
        data: z.string().describe('JSON array string'),
        filterKey: z.string().describe('Key to filter on'),
        filterValue: z.any().describe('Value to match'),
      }),
      func: async ({ data, filterKey, filterValue }) => {
        try {
          const parsedData = JSON.parse(data);
          if (!Array.isArray(parsedData)) {
            return 'Error: Data must be an array';
          }
          const filtered = parsedData.filter(item => item[filterKey] === filterValue);
          return JSON.stringify(filtered, null, 2);
        } catch (error) {
          return `Error filtering data: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create data transform tool
   */
  createTransformDataTool(chatType) {
    return new DynamicStructuredTool({
      name: 'transform_data',
      description: 'Transform data by extracting specific fields',
      schema: z.object({
        data: z.string().describe('JSON data string'),
        fields: z.array(z.string()).describe('Fields to extract'),
      }),
      func: async ({ data, fields }) => {
        try {
          const parsedData = JSON.parse(data);
          
          if (Array.isArray(parsedData)) {
            const transformed = parsedData.map(item => {
              const result = {};
              fields.forEach(field => {
                if (field in item) {
                  result[field] = item[field];
                }
              });
              return result;
            });
            return JSON.stringify(transformed, null, 2);
          } else {
            const result = {};
            fields.forEach(field => {
              if (field in parsedData) {
                result[field] = parsedData[field];
              }
            });
            return JSON.stringify(result, null, 2);
          }
        } catch (error) {
          return `Error transforming data: ${error.message}`;
        }
      },
    });
  }

  /**
   * Create data aggregation tool
   */
  createAggregateDataTool(chatType) {
    return new DynamicStructuredTool({
      name: 'aggregate_data',
      description: 'Aggregate array data (count, sum, avg, min, max)',
      schema: z.object({
        data: z.string().describe('JSON array string'),
        operation: z.enum(['count', 'sum', 'avg', 'min', 'max']).describe('Aggregation operation'),
        field: z.string().optional().describe('Field to aggregate (for sum, avg, min, max)'),
      }),
      func: async ({ data, operation, field }) => {
        try {
          const parsedData = JSON.parse(data);
          if (!Array.isArray(parsedData)) {
            return 'Error: Data must be an array';
          }

          let result;
          switch (operation) {
            case 'count':
              result = parsedData.length;
              break;
            case 'sum':
              result = parsedData.reduce((sum, item) => sum + (item[field] || 0), 0);
              break;
            case 'avg':
              const sum = parsedData.reduce((sum, item) => sum + (item[field] || 0), 0);
              result = sum / parsedData.length;
              break;
            case 'min':
              result = Math.min(...parsedData.map(item => item[field] || Infinity));
              break;
            case 'max':
              result = Math.max(...parsedData.map(item => item[field] || -Infinity));
              break;
          }

          return JSON.stringify({ operation, field, result }, null, 2);
        } catch (error) {
          return `Error aggregating data: ${error.message}`;
        }
      },
    });
  }

  /**
   * Get all data transform tools
   */
  getAllTools(chatType) {
    return [
      this.createJsonParseTool(chatType),
      this.createFilterDataTool(chatType),
      this.createTransformDataTool(chatType),
      this.createAggregateDataTool(chatType),
    ];
  }
}

