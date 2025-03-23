import React, { useState } from 'react';
import { Input, Button, Spin, message } from 'antd';

const ChatBox: React.FC<{ onSendMessage: (message: string) => void }> = ({ onSendMessage }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      await onSendMessage(userInput);
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onPressEnter={handleSendMessage}
        placeholder="输入消息..."
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" block onClick={handleSendMessage} loading={loading}>
        发送
      </Button>
      {loading && <Spin style={{ display: 'block', margin: 'auto' }} />}
    </div>
  );
};

export default ChatBox;
