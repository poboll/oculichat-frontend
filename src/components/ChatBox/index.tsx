import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import {SendOutlined} from "@ant-design/icons";


const ChatBox: React.FC<{ onSendMessage: (message: string) => void }> = ({ onSendMessage }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      setLoading(true);
      await onSendMessage(userInput);
      setUserInput(''); // 发送后清空输入框
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Input.TextArea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="输入消息，按Enter发送，Shift+Enter换行..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ marginRight: 10, borderRadius: 20, padding: '8px 12px' }}
      />
      <Button
        type="primary"
        onClick={handleSendMessage}
        loading={loading}
        shape="circle"
        icon={<SendOutlined />}
        size="large"
      />
    </div>
  );
};


export default ChatBox;
