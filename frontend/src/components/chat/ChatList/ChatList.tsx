import * as React from 'react';
import { Plus } from 'lucide-react';
import type { Chat } from '../../../types/api.types';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { formatRelativeTime, formatChatType } from '../../../utils/formatters';
import styles from './ChatList.module.css';

export interface ChatListProps {
  chats: Chat[];
  currentChatId?: string;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => void;
  loading?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onCreateChat,
  loading = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chats</h2>
        <Button size="sm" onClick={onCreateChat} aria-label="Create new chat">
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      <div className={styles.list}>
        {loading && chats.length === 0 ? (
          <div className={styles.empty}>Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className={styles.empty}>No chats yet. Create one to get started!</div>
        ) : (
          chats.map((chat) => (
            <Card
              key={chat.chat_id}
              variant="outlined"
              padding="md"
              className={`${styles.chatItem} ${
                currentChatId === chat.chat_id ? styles['chatItem--active'] : ''
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <div className={styles.chatHeader}>
                <span className={styles.chatType}>{formatChatType(chat.chat_type)}</span>
                <span className={styles.chatDate}>{formatRelativeTime(chat.created_at)}</span>
              </div>
              {chat.metadata?.description && (
                <p className={styles.chatDescription}>{chat.metadata.description}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

