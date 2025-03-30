import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Layout, Button, Switch, Space, Tooltip, Spin, Avatar } from 'antd';
import { RobotOutlined, UserOutlined, ClearOutlined, QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
import ChatBox from '@/components/ChatBox';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

// 本地存储键名
const CHAT_HISTORY_KEY = 'oculi_chat_history';
const KEEP_HISTORY_KEY = 'oculi_keep_history_setting';

/**
 * 智能AI问诊对话组件
 * 提供与AI助手的实时对话功能，支持上下文历史保留和Markdown渲染
 */
const SelfDeployAIPage: React.FC = () => {
  // 保存聊天消息历史的状态
  const [messages, setMessages] = useState<any[]>([]);
  // 控制AI响应加载状态
  const [loading, setLoading] = useState(false);
  // 是否保留历史上下文
  const [keepHistory, setKeepHistory] = useState(true);

  // 从本地存储加载历史记录和设置
  useEffect(() => {
    try {
      // 加载对话历史
      const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }

      // 加载保留上下文设置
      const savedKeepHistory = localStorage.getItem(KEEP_HISTORY_KEY);
      if (savedKeepHistory !== null) {
        setKeepHistory(JSON.parse(savedKeepHistory));
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 当消息或设置更新时保存到本地存储
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('保存聊天历史失败:', error);
    }
  }, [messages]);

  // 保存保留上下文设置
  useEffect(() => {
    try {
      localStorage.setItem(KEEP_HISTORY_KEY, JSON.stringify(keepHistory));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }, [keepHistory]);

  /**
   * 处理用户发送的消息
   * 将用户消息添加到聊天历史，并获取AI响应
   * @param userInput 用户输入的消息内容
   */
  const handleSendMessage = async (userInput: string) => {
    // 生成当前时间戳
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    // 添加用户消息到历史记录
    setMessages((prev) => [...prev, { sender: '用户', content: userInput, timestamp }]);

    // 设置加载状态
    setLoading(true);
    try {
      // 调用AI接口获取响应
      const response = await getAIResponse(userInput);
      // 添加AI响应到历史记录
      setMessages((prev) => [...prev, { sender: 'AI', content: response, timestamp }]);
    } catch (error) {
      // 错误处理
      message.error('获取AI响应时出错');
      console.error('发送消息出错:', error);
    } finally {
      // 无论成功失败都关闭加载状态
      setLoading(false);
    }
  };

  /**
   * 压缩聊天历史记录为单一字符串
   * 用于发送给AI接口，确保不超过字符限制
   * @param historyMessages 需要压缩的历史消息数组
   * @returns 压缩后的历史记录字符串
   */
  const compressHistory = (historyMessages: any[]): string => {
    let compressedHistory = '';

    // 为每条消息添加角色前缀并连接
    for (const msg of historyMessages) {
      compressedHistory += `[${msg.sender}] ${msg.content} `;
    }

    // 确保不超过2000字符限制
    if (compressedHistory.length > 2000) {
      // 从前面截断，保留最新的对话
      compressedHistory = compressedHistory.substring(compressedHistory.length - 2000);

      // 找到第一个完整的 [角色] 标记，避免截断到一半的消息
      const firstRoleIndex = compressedHistory.indexOf('[');
      if (firstRoleIndex > 0) {
        compressedHistory = compressedHistory.substring(firstRoleIndex);
      }
    }

    return compressedHistory.trim();
  };

  /**
   * 调用本地AI接口获取响应
   * @param query 用户的查询内容
   * @returns AI的响应文本
   */
  const getAIResponse = async (query: string): Promise<string> => {
    // API端点地址
    const apiUrl = 'http://127.0.0.1:8081/api/inquiry';
    // 请求头设置
    const headers = {
      'Content-Type': 'application/json',
    };

    // 准备历史上下文
    let contextHistory = '';
    if (keepHistory && messages.length > 0) {
      // 获取最近的对话历史并压缩，限制最多10条历史记录
      const recentHistory = messages.slice(-10);
      contextHistory = compressHistory(recentHistory);
    }

    // 准备请求体 - 将当前问题和历史记录合并到一个字段中
    const body = JSON.stringify({
      content: contextHistory ? `${contextHistory}\n[用户] ${query}` : query
    });

    try {
      // 发送POST请求到AI接口
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      // 解析响应JSON
      const data = await response.json();
      // 返回result字段的内容（与后端格式匹配）
      return data.result || '抱歉，我没有理解您的问题。';
    } catch (error) {
      // 错误处理和日志记录
      console.error('调用API失败:', error);
      return '发生了错误，请稍后重试。';
    }
  };

  /**
   * 清除所有聊天记录
   * 同时清除本地存储的历史记录
   */
  const clearChatHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('清除本地存储失败:', error);
    }
    message.success('聊天记录已清除');
  };

  /**
   * 当消息列表更新时，自动滚动到底部
   */
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
          {/* 聊天卡片容器 */}
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
            {/* 聊天消息容器 */}
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
                // 渲染聊天消息列表
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === '用户' ? 'flex-end' : 'flex-start',
                      marginBottom: '16px'
                    }}
                  >
                    {/* 消息气泡 */}
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
                      {/* 消息头部（头像和角色名） */}
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

                      {/* 消息内容 - AI消息支持Markdown格式渲染 */}
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

                      {/* 消息时间戳 */}
                      <div style={{ fontSize: '12px', color: '#999', marginTop: 4, textAlign: 'right' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // 无消息时显示提示
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">请开始与AI对话，询问智能问诊相关问题。</Text>
                </div>
              )}

              {/* 加载状态指示器 */}
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

            {/* 控制按钮区域 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              {/* 清除对话按钮 */}
              <Button
                icon={<ClearOutlined />}
                onClick={clearChatHistory}
                style={{ marginRight: 'auto' }}
              >
                清除对话
              </Button>

              {/* 上下文控制开关 */}
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

            {/* 输入框组件 */}
            <ChatBox onSendMessage={handleSendMessage} />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SelfDeployAIPage;
