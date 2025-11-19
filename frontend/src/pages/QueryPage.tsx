import * as React from 'react';
import { QueryPanel } from '../components/query/QueryPanel';
import { ResultsDisplay } from '../components/query/ResultsDisplay';
import { useQuery } from '../hooks/useQuery';
import { useChat } from '../hooks/useChat';
import styles from './QueryPage.module.css';

export const QueryPage: React.FC = () => {
  const { currentQuery, options, response, loading, error, executeQuery, setOptions, setCurrentQuery: setQuery, reset } = useQuery();
  const { currentChat, createChat } = useChat();
  const [chatId, setChatId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Create a default chat if none exists
    if (!currentChat && !chatId) {
      createChat({ chatType: 'user' })
        .then((chat) => {
          setChatId(chat.chat_id);
        })
        .catch((err) => {
          console.error('Failed to create chat:', err);
        });
    } else if (currentChat && currentChat.chat_id !== chatId) {
      setChatId(currentChat.chat_id);
    }
  }, [currentChat, chatId, createChat]);

  const handleSubmit = async () => {
    if (!chatId || !currentQuery.trim()) return;
    
    try {
      await executeQuery(chatId, currentQuery);
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Query Interface</h1>
        <p>Ask questions and get answers from the knowledge base</p>
      </div>
      <div className={styles.content}>
        <div className={styles.panel}>
          <QueryPanel
            query={currentQuery}
            options={options}
            onQueryChange={setQuery}
            onOptionsChange={setOptions}
            onSubmit={handleSubmit}
            loading={loading}
            disabled={!chatId}
          />
        </div>
        <div className={styles.results}>
          <ResultsDisplay response={response} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};
