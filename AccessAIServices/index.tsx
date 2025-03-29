import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Layout, Button, Switch, Space, Tooltip, Spin } from 'antd';
import { RobotOutlined, UserOutlined, ClearOutlined, QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
import ChatBox from '@/components/ChatBox';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const SelfDeployAIPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keepHistory, setKeepHistory] = useState(true);

  // 发送消息处理
  const handleSendMessage = async (userInput: string) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    setMessages((prev) => [...prev, { sender: '用户', content: userInput, timestamp }]);

    setLoading(true);
    try {
      const response = await getAIResponse(userInput);
      setMessages((prev) => [...prev, { sender: 'AI', content: response, timestamp }]);
    } catch (error) {
      message.error('获取AI响应时出错');
    } finally {
      setLoading(false);
    }
  };

  // 调用AI接口的逻辑
  const getAIResponse = async (query: string): Promise<string> => {
    const apiUrl = 'https://edpeff67cd363ff6.aistudio-hub.baidu.com/chat/completions';
    const headers = {
      'Authorization': '2cdb31eed534342e5a2bf310927ef8ad208232ab',
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || '抱歉，我没有理解您的问题。';
    } catch (error) {
      console.error('调用API失败:', error);
      return '发生了错误，请稍后重试。';
    }
  };

  // 清除聊天记录
  const clearChatHistory = () => {
    setMessages([]);
    message.success('聊天记录已清除');
  };

  // 自动滚动到底部
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      <Layout style={{ background: '#fff' }}>
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: '#f0f2f5' }}>
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
              background: '#fff'
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
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
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{
                      maxWidth: msg.sender === 'AI' ? '90%' : '70%',
                      padding: '12px 16px',
                      borderRadius: msg.sender === '用户' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                      backgroundColor: msg.sender === '用户' ? '#f0f7ff' : '#f9f9f9',
                      color: '#333',
                      border: '1px solid',
                      borderColor: msg.sender === '用户' ? '#d6e4ff' : '#f0f0f0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      position: 'relative',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <Avatar
                          icon={msg.sender === '用户' ? <UserOutlined /> : <RobotOutlined />}
                          style={{
                            backgroundColor: msg.sender === '用户' ? '#1890ff' : '#52c41a',
                            marginRight: 8
                          }}
                          size="small"
                        />
                        <strong>{msg.sender}</strong>
                      </div>

                      {/* 消息内容 */}
                      {msg.sender === 'AI' ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\n/g, '<br>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          }}
                        />
                      ) : (
                        <div>{msg.content}</div>
                      )}

                      <div style={{ fontSize: '12px', color: '#999', marginTop: 4, textAlign: 'right' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">请开始与AI对话，询问智能问诊相关问题。</Text>
                </div>
              )}
              {loading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px',
                }}>
                  <Spin tip="AI正在思考..." />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <Text style={{ marginRight: '8px' }}>保留上下文</Text>
                <Switch
                  checked={keepHistory}
                  onChange={setKeepHistory}
                  size="small"
                />
                <Tooltip title="开启后，AI会考虑之前的对话内容">
                  <QuestionCircleOutlined style={{ marginLeft: '5px', color: '#999' }} />
                </Tooltip>
              </div>
            </div>

            <ChatBox onSendMessage={handleSendMessage} />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SelfDeployAIPage;
