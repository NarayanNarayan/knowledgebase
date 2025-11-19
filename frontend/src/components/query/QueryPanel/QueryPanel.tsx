import * as React from 'react';
import { Send } from 'lucide-react';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { QueryOptions } from '../QueryOptions';
import type { QueryOptions as QueryOptionsType } from '../../../types/api.types';
import styles from './QueryPanel.module.css';

export interface QueryPanelProps {
  query: string;
  options: QueryOptionsType;
  onQueryChange: (query: string) => void;
  onOptionsChange: (options: Partial<QueryOptionsType>) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const QueryPanel: React.FC<QueryPanelProps> = ({
  query,
  options,
  onQueryChange,
  onOptionsChange,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (query.trim() && !disabled && !loading) {
        onSubmit();
      }
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your query... (Ctrl/Cmd + Enter to submit)"
          disabled={disabled || loading}
          rows={3}
        />
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={disabled || loading || !query.trim()}
          loading={loading}
          className={styles.submitButton}
        >
          <Send size={18} />
          Submit
        </Button>
      </div>
      <QueryOptions options={options} onChange={onOptionsChange} />
    </div>
  );
};

