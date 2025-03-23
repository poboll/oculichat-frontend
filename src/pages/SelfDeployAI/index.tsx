import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Layout, Avatar, Empty, Divider, Spin } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import ChatBox from '@/components/ChatBox';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

const SelfDeployAIPage: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string; file?: File }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 模拟发送消息并获取AI响应
  const handleSendMessage = async (userInput: string) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    setMessages((prev) => [...prev, { sender: '用户', content: userInput, timestamp }]);
    setLoading(true);

    try {
      const response = await getAIResponse(file, userInput);
      setMessages((prev) => [...prev, { sender: 'AI', content: response, timestamp, file }]);
    } catch (error) {
      message.error('获取AI响应时出错。');
    } finally {
      setLoading(false);
    }
  };

  // 模拟AI响应
  const getAIResponse = async (file: File | null, query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = file
          ? `文件: ${file.name}，查询: ${query} 的AI响应。`
          : `查询: ${query} 的AI响应（无文件）。`;
        resolve(response);
      }, 1000); // 模拟延时1秒钟返回响应
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#1890ff',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <Title level={3} style={{ margin: 0, color: 'white' }}>
          <RobotOutlined style={{ marginRight: 10 }} />
          AI助手
        </Title>
      </Header>
      <Layout>
        <Sider width={380} theme="light" style={{ padding: '20px', overflow: 'auto' }}>
          <Card
            title="文件上传"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              height: '100%'
            }}
          >
            <FileUpload onUploadSuccess={(uploadedFile) => {
              setFile(uploadedFile);
              message.success(`文件 ${uploadedFile.name} 上传成功!`);
            }} />
            {file && (
              <div style={{ marginTop: 20 }}>
                <Divider>当前文件</Divider>
                <p><strong>文件名:</strong> {file.name}</p>
                <p><strong>大小:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                <p><strong>类型:</strong> {file.type}</p>
              </div>
            )}
          </Card>
        </Sider>
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              overflow: 'hidden'
            }}
          >
            <div
              id="chat-container"
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: 16,
                padding: '10px'
              }}
            >
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === '用户' ? 'flex-end' : 'flex-start',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: msg.sender === '用户' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                      backgroundColor: msg.sender === '用户' ? '#1890ff' : '#f0f2f5',
                      color: msg.sender === '用户' ? 'white' : 'black',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <Avatar
                          icon={msg.sender === '用户' ? <UserOutlined /> : <RobotOutlined />}
                          style={{
                            backgroundColor: msg.sender === '用户' ? '#1890ff' : '#f56a00',
                            marginRight: 8
                          }}
                          size="small"
                        />
                        <strong>{msg.sender}</strong>
                      </div>
                      <div>{msg.content}</div>
                      <div style={{ fontSize: '12px', color: msg.sender === '用户' ? 'rgba(255,255,255,0.7)' : '#999', marginTop: 4, textAlign: 'right' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty description="开始对话吧" />
              )}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Spin tip="AI正在思考..." />
                </div>
              )}
            </div>
            <ChatBox onSendMessage={handleSendMessage} />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SelfDeployAIPage;
