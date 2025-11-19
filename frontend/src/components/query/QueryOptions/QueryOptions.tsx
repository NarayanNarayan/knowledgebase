import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import type { QueryOptions as QueryOptionsType } from '../../../types/api.types';
import { AVAILABLE_MODELS } from '../../../utils/constants';
import styles from './QueryOptions.module.css';

export interface QueryOptionsProps {
  options: QueryOptionsType;
  onChange: (options: Partial<QueryOptionsType>) => void;
}

export const QueryOptions: React.FC<QueryOptionsProps> = ({ options, onChange }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card variant="outlined" padding="md">
      <CardHeader>
        <div className={styles.header}>
          <CardTitle>Query Options</CardTitle>
          <button
            className={styles.toggle}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className={styles.grid}>
            <Select
              label="Model"
              options={AVAILABLE_MODELS.map(m => ({ value: m.value, label: m.label }))}
              value={options.model || ''}
              onChange={(value) => onChange({ model: value })}
            />
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.useRAG ?? true}
                  onChange={(e) => onChange({ useRAG: e.target.checked })}
                />
                <span>Use RAG</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.useGraph ?? false}
                  onChange={(e) => onChange({ useGraph: e.target.checked })}
                />
                <span>Use Graph</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.useHybrid ?? true}
                  onChange={(e) => onChange({ useHybrid: e.target.checked })}
                  disabled={!options.useRAG}
                />
                <span>Use Hybrid Search</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.useIterative ?? false}
                  onChange={(e) => onChange({ useIterative: e.target.checked })}
                  disabled={!options.useRAG}
                />
                <span>Use Iterative RAG</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.processData ?? false}
                  onChange={(e) => onChange({ processData: e.target.checked })}
                />
                <span>Process Data</span>
              </label>
            </div>
            {options.useRAG && (
              <>
                <Input
                  label="RAG Limit"
                  type="number"
                  value={options.ragLimit?.toString() || '5'}
                  onChange={(e) => onChange({ ragLimit: parseInt(e.target.value) || 5 })}
                  size="sm"
                />
                <Input
                  label="RAG Threshold"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={options.ragThreshold?.toString() || '0.7'}
                  onChange={(e) => onChange({ ragThreshold: parseFloat(e.target.value) || 0.7 })}
                  size="sm"
                />
                {options.useHybrid && (
                  <Input
                    label="Graph Depth"
                    type="number"
                    value={options.graphDepth?.toString() || '1'}
                    onChange={(e) => onChange({ graphDepth: parseInt(e.target.value) || 1 })}
                    size="sm"
                  />
                )}
                {options.useIterative && (
                  <>
                    <Input
                      label="Max Iterations"
                      type="number"
                      value={options.maxIterations?.toString() || '3'}
                      onChange={(e) => onChange({ maxIterations: parseInt(e.target.value) || 3 })}
                      size="sm"
                    />
                    <Input
                      label="Confidence Threshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={options.confidenceThreshold?.toString() || '0.8'}
                      onChange={(e) => onChange({ confidenceThreshold: parseFloat(e.target.value) || 0.8 })}
                      size="sm"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

