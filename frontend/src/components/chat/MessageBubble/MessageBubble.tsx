import * as React from 'react';
import type { ChatMessage } from '../../../types/api.types';
import { formatDate } from '../../../utils/formatters';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={`${styles.message} ${
        isUser ? styles['message--user'] : isSystem ? styles['message--system'] : styles['message--assistant']
      }`}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.role}>{message.role}</span>
          <span className={styles.timestamp}>{formatDate(message.created_at)}</span>
        </div>
        <div className={styles.text}>{message.content}</div>
        {message.metadata && Object.keys(message.metadata).length > 0 && (
          <details className={styles.metadata}>
            <summary>Metadata</summary>
            <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

