// ... existing code ...
import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Layout, Avatar, Empty, Divider, Spin, Button, Tabs, Space, Tooltip } from 'antd';
import { RobotOutlined, UserOutlined, FileTextOutlined, HistoryOutlined, QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import ChatBox from '@/components/ChatBox';

const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const SelfDeployAIPage: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string; leftEye?: File; rightEye?: File }[]>([]);
  const [leftEyeFile, setLeftEyeFile] = useState<File | null>(null);
  const [rightEyeFile, setRightEyeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagnosis');

  // 模拟发送消息并获取AI响应
  const handleSendMessage = async (userInput: string) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!leftEyeFile || !rightEyeFile) {
      message.warning('请先上传左眼和右眼照片');
      return;
    }

    setMessages((prev) => [...prev, {
      sender: '用户',
      content: userInput,
      timestamp,
      leftEye: leftEyeFile,
      rightEye: rightEyeFile
    }]);

    setLoading(true);

    try {
      const response = await getAIResponse(leftEyeFile, rightEyeFile, userInput);
      setMessages((prev) => [...prev, {
        sender: 'AI',
        content: response,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        leftEye: leftEyeFile,
        rightEye: rightEyeFile
      }]);
    } catch (error) {
      message.error('获取AI响应时出错。');
    } finally {
      setLoading(false);
    }
  };

  // 模拟AI响应
  const getAIResponse = async (leftEye: File, rightEye: File, query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟诊断结果
        const diagnoses = [
          "眼底图像显示视网膜健康，无明显异常。",
          "视网膜上可见微小出血点，建议进一步检查。",
          "黄斑区域有轻微变化，可能与年龄相关性黄斑变性有关。",
          "视盘周围可见典型青光眼性改变，建议及时就医。",
          "视网膜上可见糖尿病性视网膜病变特征性病变，建议密切随访。"
        ];

        const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

        const response = `
## 眼底诊断结果

**左眼**: ${leftEye.name}
**右眼**: ${rightEye.name}

### 分析结果:
${randomDiagnosis}

### 建议:
1. 定期进行眼底检查，每年至少一次
2. 保持良好的生活习惯，控制血压和血糖
3. 避免长时间用眼，注意用眼卫生

*此诊断结果仅供参考，请咨询专业医生获取正式诊断意见。*
        `;
        resolve(response);
      }, 2000); // 模拟延时2秒钟返回响应
    });
  };

  // 导出诊断报告
  const exportReport = () => {
    if (messages.length === 0) {
      message.info('暂无诊断结果可导出');
      return;
    }

    // 模拟导出功能
    message.success('诊断报告已导出');
  };

  // 自动滚动到底部
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: '#fff' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        color: '#333',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        padding: '0 24px'
      }}>
        <Title level={3} style={{ margin: 0, color: '#333' }}>
          <RobotOutlined style={{ marginRight: 10, color: '#52c41a' }} />
          眼底辅助诊断平台
        </Title>
        <div style={{ marginLeft: 'auto' }}>
          <Space>
            <Tooltip title="导出诊断报告">
              <Button icon={<ExportOutlined />} onClick={exportReport}>导出报告</Button>
            </Tooltip>
            <Tooltip title="历史记录">
              <Button icon={<HistoryOutlined />}>历史记录</Button>
            </Tooltip>
            <Tooltip title="帮助">
              <Button icon={<QuestionCircleOutlined />}>帮助</Button>
            </Tooltip>
          </Space>
        </div>
      </Header>
      <Layout style={{ background: '#fff' }}>
        <Sider width={380} theme="light" style={{
          padding: '20px',
          overflow: 'auto',
          boxShadow: '1px 0 4px rgba(0,0,0,0.05)',
          background: '#fcfcfc'
        }}>
          <Tabs defaultActiveKey="upload" onChange={(key) => setActiveTab(key)}>
            <TabPane tab="照片上传" key="upload">
              <div style={{ marginBottom: 20 }}>
                <Card
                  title="左眼照片"
                  style={{
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    marginBottom: 16
                  }}
                  headStyle={{ color: '#52c41a' }}
                >
                  <FileUpload
                    onUploadSuccess={(file) => {
                      setLeftEyeFile(file);
                      message.success(`左眼照片 ${file.name} 上传成功!`);
                    }}
                    fileType="左眼照片"
                  />
                </Card>

                <Card
                  title="右眼照片"
                  style={{
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    borderRadius: '8px'
                  }}
                  headStyle={{ color: '#52c41a' }}
                >
                  <FileUpload
                    onUploadSuccess={(file) => {
                      setRightEyeFile(file);
                      message.success(`右眼照片 ${file.name} 上传成功!`);
                    }}
                    fileType="右眼照片"
                  />
                </Card>
              </div>

              <div>
                <Divider>上传状态</Divider>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>左眼照片:</Text>
                    <Text type={leftEyeFile ? "success" : "secondary"}> {leftEyeFile ? leftEyeFile.name : '未上传'}</Text>
                  </div>
                  <div>
                    <Text strong>右眼照片:</Text>
                    <Text type={rightEyeFile ? "success" : "secondary"}> {rightEyeFile ? rightEyeFile.name : '未上传'}</Text>
                  </div>
                </div>

                {(leftEyeFile && rightEyeFile) && (
                  <Button
                    type="primary"
                    style={{ marginTop: 16, width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => setActiveTab('diagnosis')}
                  >
                    开始诊断
                  </Button>
                )}
              </div>
            </TabPane>
            <TabPane tab="医学百科" key="wiki">
              <Card style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderRadius: '8px', height: '100%' }}>
                <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                  <Title level={4}>常见眼底疾病</Title>
                  <ul>
                    <li><Text strong>糖尿病视网膜病变</Text> - 由糖尿病引起的视网膜血管损伤</li>
                    <li><Text strong>年龄相关性黄斑变性</Text> - 影响中心视力的退行性疾病</li>
                    <li><Text strong>青光眼</Text> - 视神经损伤，通常与眼压升高有关</li>
                    <li><Text strong>视网膜静脉阻塞</Text> - 视网膜静脉血液流动受阻</li>
                    <li><Text strong>视网膜色素变性</Text> - 影响周边视力的遗传性疾病</li>
                  </ul>
                  <Divider />
                  <Title level={4}>眼底检查术语解释</Title>
                  <ul>
                    <li><Text strong>视盘</Text> - 视神经纤维汇集的地方</li>
                    <li><Text strong>黄斑</Text> - 负责中心视力的区域</li>
                    <li><Text strong>视网膜血管</Text> - 为视网膜提供血液供应的血管</li>
                    <li><Text strong>出血点</Text> - 视网膜上的小出血区域</li>
                    <li><Text strong>渗出物</Text> - 由血管渗漏引起的沉积物</li>
                  </ul>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Sider>
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
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
                      {msg.sender === 'AI' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/#{3} (.*?)$/gm, '<h3>$1</h3>').replace(/#{2} (.*?)$/gm, '<h2>$1</h2>') }} />
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
                <Empty description={
                  <div>
                    <p>请上传左眼和右眼照片，然后开始诊断</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>您可以询问关于眼底照片的任何问题</p>
                  </div>
                } />
              )}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Spin tip="AI正在分析眼底照片..." />
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
