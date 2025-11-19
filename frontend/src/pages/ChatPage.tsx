import * as React from 'react';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatInput } from '../components/chat/ChatInput';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { useChat } from '../hooks/useChat';
import { useQuery } from '../hooks/useQuery';
import { CHAT_TYPES } from '../utils/constants';
import styles from './ChatPage.module.css';

export const ChatPage: React.FC = () => {
  const {
    chats,
    currentChat,
    getChatMessages,
    loading,
    createChat,
    loadChat,
    loadChatHistory,
    setCurrentChat,
    addMessage,
  } = useChat();

  const { executeQuery } = useQuery();
  const [message, setMessage] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newChatType, setNewChatType] = React.useState<'admin' | 'user'>('user');
  const [newChatUserId, setNewChatUserId] = React.useState('');

  React.useEffect(() => {
    if (currentChat) {
      loadChatHistory(currentChat.chat_id);
    }
  }, [currentChat?.chat_id, loadChatHistory]);

  const handleCreateChat = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const chat = await createChat({
        chatType: newChatType,
        userId: newChatUserId || undefined,
      });
      setShowCreateModal(false);
      setNewChatUserId('');
      // The createChat function already sets the current chat, so we don't need to do it here
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      // Error is already handled in the useChat hook and stored in error state
      // You might want to show a toast notification here
    }
  };

  const handleSendMessage = async () => {
    if (!currentChat || !message.trim()) return;

    const userMessage = {
      message_id: `msg-${Date.now()}`,
      chat_id: currentChat.chat_id,
      role: 'user' as const,
      content: message,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    addMessage(currentChat.chat_id, userMessage);
    setMessage('');

    try {
      const response = await executeQuery(currentChat.chat_id, message);
      
      const assistantMessage = {
        message_id: `msg-${Date.now()}-assistant`,
        chat_id: currentChat.chat_id,
        role: 'assistant' as const,
        content: response.response,
        metadata: {
          agentsUsed: response.agentsUsed,
          toolsUsed: response.toolsUsed,
          sources: response.sources,
        },
        created_at: new Date().toISOString(),
      };

      addMessage(currentChat.chat_id, assistantMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const messages = currentChat ? getChatMessages(currentChat.chat_id) : [];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ChatList
          chats={chats}
          currentChatId={currentChat?.chat_id}
          onSelectChat={(chat) => {
            setCurrentChat(chat);
            loadChatHistory(chat.chat_id);
          }}
          onCreateChat={() => setShowCreateModal(true)}
          loading={loading}
        />
      </div>
      <div className={styles.main}>
        <ChatWindow
          chat={currentChat}
          messages={messages}
          loading={loading}
        />
        {currentChat && (
          <ChatInput
            value={message}
            onChange={setMessage}
            onSubmit={handleSendMessage}
            loading={loading}
          />
        )}
      </div>
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Chat"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateChat} loading={loading} disabled={loading}>
              Create
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Chat Type"
            options={CHAT_TYPES.map(t => ({ value: t.value, label: t.label }))}
            value={newChatType}
            onChange={(value) => setNewChatType(value as 'admin' | 'user')}
          />
          <Input
            label="User ID (optional)"
            value={newChatUserId}
            onChange={(e) => setNewChatUserId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>
      </Modal>
    </div>
  );
};
