import React, { useState, useEffect } from 'react';
import { Card, message, Typography } from 'antd';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import ChatBox from '@/components/ChatBox';

const { Title } = Typography;

const SelfDeployAIPage: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string; file?: File }[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleSendMessage = async (userInput: string) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    setMessages((prev) => [...prev, { sender: '用户', content: userInput, timestamp }]);

    try {
      const response = await getAIResponse(file, userInput);
      setMessages((prev) => [...prev, { sender: 'AI', content: response, timestamp, file }]);
    } catch (error) {
      message.error('获取AI响应时出错。');
    }
  };

  const getAIResponse = async (file: File | null, query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = file
          ? `文件: ${file.name}，查询: ${query} 的AI响应。`
          : `查询: ${query} 的AI响应（无文件）。`;
        resolve(response);
      }, 1000);
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      <Card hoverable style={{ width: 400, padding: '20px', marginRight: '20px' }}>
        <Title level={4}>上传文件</Title>
        <FileUpload onUploadSuccess={(uploadedFile) => setFile(uploadedFile)} />
      </Card>

      <Card hoverable style={{ flex: 1, width: 600, padding: '20px' }}>
        <div style={{ height: '300px', overflowY: 'auto', marginBottom: 16 }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === '用户' ? 'right' : 'left',
                marginBottom: 10,
                color: msg.sender === '用户' ? '#007bff' : '#333',
              }}
            >
              <strong>{msg.sender}:</strong> {msg.content} <br />
              <small>{msg.timestamp}</small>
            </div>
          ))}
        </div>
        <ChatBox onSendMessage={handleSendMessage} />
      </Card>
    </div>
  );
};

export default SelfDeployAIPage;
