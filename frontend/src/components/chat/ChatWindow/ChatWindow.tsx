import * as React from 'react';
import type { Chat, ChatMessage } from '../../../types/api.types';
import { MessageBubble } from '../MessageBubble';
import { Loading } from '../../common/Loading';
import styles from './ChatWindow.module.css';

export interface ChatWindowProps {
  chat: Chat | null;
  messages: ChatMessage[];
  loading?: boolean;
  onLoadMore?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  loading = false,
  onLoadMore,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = React.useState(false);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    const container = document.getElementById('chat-messages');
    if (container) {
      const handleScroll = () => {
        setShowLoadMore(container.scrollTop > 100);
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!chat) {
    return (
      <div className={styles.empty}>
        <p>Select a chat or create a new one to start messaging</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {chat.metadata?.description || `Chat ${chat.chat_id.slice(0, 8)}`}
        </h2>
        <span className={styles.type}>{chat.chat_type}</span>
      </div>
      <div id="chat-messages" className={styles.messages}>
        {showLoadMore && onLoadMore && (
          <button className={styles.loadMore} onClick={onLoadMore}>
            Load more messages
          </button>
        )}
        {loading && messages.length === 0 ? (
          <Loading text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className={styles.emptyMessages}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.message_id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

