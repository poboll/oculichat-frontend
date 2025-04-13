import React, { useState, useEffect, useRef } from 'react';
import { Card, message, Typography, Layout, Button, Switch, Space, Tooltip, Spin, Avatar, Divider, Row, Col, Tag, Tabs, Menu, Dropdown } from 'antd';
import { RobotOutlined, UserOutlined, ClearOutlined, QuestionCircleOutlined, ExportOutlined,
  MedicineBoxOutlined, BulbOutlined, HeartOutlined, SafetyOutlined, TagsOutlined,
  MenuOutlined, SendOutlined, DownOutlined, FileTextOutlined,
  EyeOutlined, MedicineBoxTwoTone, ExperimentOutlined } from '@ant-design/icons';
import moment from 'moment';
import ChatBox from '@/components/ChatBox';

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

// 本地存储键名
const CHAT_HISTORY_KEY = 'oculi_chat_history';
const KEEP_HISTORY_KEY = 'oculi_keep_history_setting';

// 提示词分类
const PROMPT_CATEGORIES = {
  COMMON: '常见问题',
  SYMPTOMS: '症状咨询',
  DISEASES: '疾病查询',
  EXAMINATION: '检查咨询',
  TREATMENT: '治疗方案',
  MEDICATION: '药物咨询'
};

// 提示词预设列表 - 按类别组织
const PROMPT_PRESETS = {
  [PROMPT_CATEGORIES.COMMON]: [
    { id: 'c1', text: "智能眼科问诊能提供哪些服务？" },
    { id: 'c2', text: "何时需要就医？" },
    { id: 'c3', text: "如何预防眼部疾病?" },
    { id: 'c4', text: "戴眼镜对眼睛有影响吗？" }
  ],
  [PROMPT_CATEGORIES.SYMPTOMS]: [
    { id: 's1', text: "眼睛干涩是什么原因？" },
    { id: 's2', text: "视力突然下降是什么原因？" },
    { id: 's3', text: "眼前有飘浮物是怎么回事？" },
    { id: 's4', text: "看东西变形是什么病？" },
    { id: 's5', text: "眼睛红血丝多是什么原因？" }
  ],
  [PROMPT_CATEGORIES.DISEASES]: [
    { id: 'd1', text: "什么是糖尿病视网膜病变？" },
    { id: 'd2', text: "青光眼的早期症状有哪些？" },
    { id: 'd3', text: "白内障什么时候需要手术？" },
    { id: 'd4', text: "黄斑变性有什么治疗方法？" },
    { id: 'd5', text: "视网膜脱离的症状和原因？" }
  ],
  [PROMPT_CATEGORIES.EXAMINATION]: [
    { id: 'e1', text: "眼底检查怎么做？有什么作用？" },
    { id: 'e2', text: "OCT检查是什么？有什么用途？" },
    { id: 'e3', text: "眼压检查有必要定期做吗？" },
    { id: 'e4', text: "视野检查能检查什么问题？" }
  ],
  [PROMPT_CATEGORIES.TREATMENT]: [
    { id: 't1', text: "眼底激光治疗是怎么做的？" },
    { id: 't2', text: "抗VEGF注射治疗适用于哪些病症？" },
    { id: 't3', text: "玻璃体切除术后注意事项？" },
    { id: 't4', text: "青光眼手术有哪些类型？" }
  ],
  [PROMPT_CATEGORIES.MEDICATION]: [
    { id: 'm1', text: "常用眼药水有哪些类型？" },
    { id: 'm2', text: "散瞳滴眼液的作用和注意事项？" },
    { id: 'm3', text: "抗青光眼药物有哪些？" },
    { id: 'm4', text: "人工泪液应该怎么选择？" }
  ]
};

// 平台功能列表
const PLATFORM_FEATURES = [
  {
    title: "智能问诊",
    icon: <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    description: "基于先进AI医疗大模型，为您提供准确的眼科问题咨询服务"
  },
  {
    title: "眼底分析",
    icon: <BulbOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    description: "上传眼底照片，AI自动识别眼底病变，辅助医生进行精准诊断"
  },
  {
    title: "健康管理",
    icon: <HeartOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
    description: "提供眼健康长期追踪管理，定期提醒复查，维护眼部健康"
  },
  {
    title: "专家连线",
    icon: <MedicineBoxOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
    description: "连接全国眼科名医资源，提供线上咨询服务和诊疗建议"
  }
];

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
  // 聊天容器引用
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // 侧边栏折叠状态
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  // 当前选择的提示词分类
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(PROMPT_CATEGORIES)[0]);
  // 输入框引用 - 如果ChatBox组件支持ref功能
  const inputRef = useRef<any>(null);
  // 输入框暂存内容
  const [inputValue, setInputValue] = useState('');

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
   * 处理提示词预设的点击
   * @param promptText 选择的提示词文本
   * @param sendImmediately 是否立即发送(默认为true)
   */
  const handlePromptClick = (promptText: string, sendImmediately: boolean = true) => {
    if (sendImmediately) {
      // 直接发送消息
      handleSendMessage(promptText);
    } else {
      // 仅填入输入框
      setInputValue(promptText);
      // 如果ChatBox组件支持设置输入值的方法，则调用
      if (inputRef.current && inputRef.current.setValue) {
        inputRef.current.setValue(promptText);
      }
    }
  };

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
      setMessages((prev) => [...prev, { sender: 'AI', content: response, timestamp: moment().format('YYYY-MM-DD HH:mm:ss') }]);
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
   * 渲染提示词预设区域
   * 侧边栏中的提示词分类和预设列表
   */
  const renderPromptPresets = () => {
    return (
      <div>
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          tabPosition="top"
          size="small"
          style={{ marginBottom: 16 }}
        >
          {Object.entries(PROMPT_CATEGORIES).map(([key, label]) => (
            <TabPane
              tab={
                <span style={{ fontSize: '13px' }}>
                  {label}
                </span>
              }
              key={key}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '70vh',
                overflowY: 'auto',
                padding: '0 5px'
              }}>
                {PROMPT_PRESETS[label]?.map((prompt) => (
                  <Tag
                    key={prompt.id}
                    color="#4a7ba3"
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: '14px',
                      margin: '4px 0',
                      borderRadius: '4px',
                      textAlign: 'left',
                      lineHeight: '1.4'
                    }}
                    onClick={() => handlePromptClick(prompt.text)}
                  >
                    {prompt.text}
                  </Tag>
                ))}
              </div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  };

  /**
   * 渲染提示词下拉菜单
   * 用于移动端或紧凑布局时的提示词选择
   */
  const renderPromptDropdown = () => {
    const menu = (
      <Menu style={{ maxHeight: '400px', overflow: 'auto' }}>
        {Object.entries(PROMPT_CATEGORIES).map(([categoryKey, categoryLabel]) => (
          <Menu.SubMenu key={categoryKey} title={categoryLabel}>
            {PROMPT_PRESETS[categoryLabel]?.map((prompt) => (
              <Menu.Item
                key={prompt.id}
                onClick={() => handlePromptClick(prompt.text)}
              >
                {prompt.text}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button icon={<TagsOutlined />} style={{ marginRight: 8 }}>
          提示词 <DownOutlined />
        </Button>
      </Dropdown>
    );
  };

  /**
   * 渲染欢迎介绍页面
   * 当没有消息时显示的详细介绍和功能说明
   */
  const renderWelcomePage = () => {
    return (
      <div style={{ padding: '20px 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: '#315167' }}>
            欢迎使用智能眼科咨询平台
          </Title>
          <Paragraph style={{ fontSize: 16 }}>
            基于先进医疗大模型技术，为您提供专业的眼科咨询和眼底诊断服务
          </Paragraph>
        </div>

        <Divider orientation="left">
          <Space>
            <MedicineBoxOutlined />
            <span>平台特色</span>
          </Space>
        </Divider>

        <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
          {PLATFORM_FEATURES.map((feature, index) => (
            <Col xs={24} sm={12} md={12} lg={12} xl={6} key={index}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>
                  {feature.icon}
                </div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph style={{ color: '#666' }}>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider orientation="left">
          <Space>
            <SafetyOutlined />
            <span>平台优势</span>
          </Space>
        </Divider>

        <Row style={{ marginBottom: 30 }}>
          <Col span={24}>
            <Card>
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 12 }}>
                  <Text strong>专业知识库</Text> - 基于眼科专业文献和临床指南构建的医学知识库，提供准确、权威的咨询服务
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Text strong>智能对话</Text> - 理解自然语言，支持连续对话，让您的咨询体验更加流畅自然
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Text strong>隐私保护</Text> - 对话内容本地存储，保护您的个人隐私和医疗信息安全
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Text strong>持续更新</Text> - 系统定期更新医学知识库，保持医疗信息的时效性和准确性
                </li>
              </ul>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">
          <Space>
            <BulbOutlined />
            <span>使用提示</span>
          </Space>
        </Divider>

        <Card style={{ marginBottom: 30 }}>
          <Paragraph>
            <strong>您可以通过以下方式使用本平台：</strong>
          </Paragraph>
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              直接在输入框中输入您的眼科问题
            </li>
            <li style={{ marginBottom: 8 }}>
              从左侧<Text strong>提示词预设</Text>中选择常见问题
            </li>
            <li style={{ marginBottom: 8 }}>
              根据AI回答继续深入咨询，系统会记住对话上下文
            </li>
          </ul>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button
            type="primary"
            size="large"
            onClick={() => handleSendMessage("您好，我想了解一下这个智能眼科咨询平台能提供哪些服务？")}
          >
            开始咨询
          </Button>
        </div>
      </div>
    );
  };

  /**
   * 当消息列表更新时，自动滚动到底部
   */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      {/* 添加头部标题栏 */}
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MedicineBoxTwoTone style={{ fontSize: 24, marginRight: 10 }} />
          <Title level={3} style={{ margin: 0 }}>智能眼科咨询平台</Title>
        </div>
        <Space style={{ marginLeft: 'auto' }}>
          <Button
            icon={<MenuOutlined />}
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            style={{ marginRight: 8 }}
          >
            提示词
          </Button>
          <Button icon={<FileTextOutlined />} style={{ marginRight: 8 }}>
            导出记录
          </Button>
          <Button type="primary" icon={<EyeOutlined />}>
            眼底分析
          </Button>
        </Space>
      </Header>

      <Layout style={{ background: '#fff' }}>
        {/* 左侧提示词预设侧边栏 */}
        <Sider
          theme="light"
          width={280}
          collapsible
          collapsed={siderCollapsed}
          collapsedWidth={0}
          trigger={null}
          style={{
            borderRight: '1px solid #f0f0f0',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div style={{ padding: '16px 10px' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                <TagsOutlined style={{ marginRight: 8 }} />
                提示词预设
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                点击问题可直接发送咨询
              </Text>
            </div>
            {renderPromptPresets()}
          </div>
        </Sider>

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
              ref={chatContainerRef}
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
                            backgroundColor: msg.sender === '用户' ? '#315167' : '#52c41a',
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
                              .replace(/#{2} (.*?)(<br>|$)/g, '<h3 style="color:#315167;margin:10px 0">$1</h3>')
                              .replace(/#{1} (.*?)(<br>|$)/g, '<h2 style="color:#315167;margin:12px 0">$1</h2>')
                              .replace(/- (.*?)(<br>|$)/g, '<li style="margin-left:20px">$1</li>')
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
                // 无消息时显示详细介绍页面
                renderWelcomePage()
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
                style={{ marginRight: 8 }}
              >
                清除对话
              </Button>

              {/* 提示词下拉菜单 - 移动端友好版本 */}
              {renderPromptDropdown()}

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
            <ChatBox
              ref={inputRef}
              onSendMessage={handleSendMessage}
              placeholder="请输入您的眼科问题，AI助手将为您解答..."
              initialValue={inputValue}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SelfDeployAIPage;
