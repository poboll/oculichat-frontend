// ... existing code ...
import React, { useState, useEffect, useRef } from 'react';
import { Card, message, Typography, Layout, Avatar, Empty, Divider, Spin, Button, Tabs, Space, Tooltip, Switch } from 'antd';
import { RobotOutlined, UserOutlined, FileTextOutlined, HistoryOutlined, QuestionCircleOutlined, ExportOutlined, ClearOutlined, MergeCellsOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import ChatBox from '@/components/ChatBox';

const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const SelfDeployAIPage: React.FC = () => {
  // 基础状态
  const [messages, setMessages] = useState<any[]>([]);
  const [leftEyeFile, setLeftEyeFile] = useState<File | null>(null);
  const [rightEyeFile, setRightEyeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [mergedImageUrl, setMergedImageUrl] = useState<string | null>(null);
  const [keepHistory, setKeepHistory] = useState(true);

  // 图片合并处理
  useEffect(() => {
    // 当左右眼照片都上传后，生成合并预览
    if (leftEyeFile && rightEyeFile) {
      createMergedImage();
    } else {
      setMergedImageUrl(null);
    }
  }, [leftEyeFile, rightEyeFile]);

  // 前端合并两张图片
  const createMergedImage = () => {
    if (!leftEyeFile || !rightEyeFile) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const leftImg = new Image();
    const rightImg = new Image();

    let loadedImages = 0;
    const onImageLoad = () => {
      loadedImages++;
      if (loadedImages === 2) {
        // 两张图片都加载完成后，开始绘制合并图片
        // 设置画布宽度为两张图片宽度之和，高度为较高图片的高度
        const maxHeight = Math.max(leftImg.height, rightImg.height);
        canvas.width = leftImg.width + rightImg.width;
        canvas.height = maxHeight;

        // 绘制左眼图片
        ctx.drawImage(leftImg, 0, 0);

        // 绘制右眼图片
        ctx.drawImage(rightImg, leftImg.width, 0);

        // 添加文字标识
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillRect(5, 5, 50, 25);
        ctx.fillRect(leftImg.width + 5, 5, 55, 25);
        ctx.fillStyle = 'black';
        ctx.fillText('左眼', 10, 22);
        ctx.fillText('右眼', leftImg.width + 10, 22);

        // 将合并图片转为URL
        const mergedUrl = canvas.toDataURL('image/jpeg');
        setMergedImageUrl(mergedUrl);
      }
    };

    leftImg.onload = onImageLoad;
    rightImg.onload = onImageLoad;

    leftImg.src = URL.createObjectURL(leftEyeFile);
    rightImg.src = URL.createObjectURL(rightEyeFile);
  };

  // 导出诊断报告
  const exportReport = () => {
    if (messages.length === 0) {
      message.info('暂无诊断结果可导出');
      return;
    }

    // 找最近的一次分析结果
    let reportContent = '';
    let hasAnalysis = false;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].aiAnalysis) {
        // 找到了分析结果
        const analysis = messages[i].aiAnalysis;
        const content = messages[i].content;

        reportContent = `
# 眼底诊断报告
生成时间：${moment().format('YYYY-MM-DD HH:mm:ss')}

## 分析结果
主要诊断: ${analysis.main_class.label} (置信度: ${(analysis.main_class.confidence * 100).toFixed(2)}%)
左眼: ${analysis.left_eye.severity} (置信度: ${(analysis.left_eye.confidence * 100).toFixed(2)}%)
右眼: ${analysis.right_eye.severity} (置信度: ${(analysis.right_eye.confidence * 100).toFixed(2)}%)
预测年龄: ${analysis.age_prediction}
预测性别: ${analysis.gender_prediction}

## 诊断解读与建议
${content}
`;
        hasAnalysis = true;
        break;
      }
    }

    if (!hasAnalysis) {
      message.info('暂无分析结果可导出');
      return;
    }

    // 创建下载链接
    const blob = new Blob([reportContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `眼底诊断报告_${moment().format('YYYYMMDD_HHmmss')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success('诊断报告已导出');
  };

  // 模拟API-1调用 - 分析图片
  const callAPI1 = async (imageUrl: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟随机生成不同的诊断结果
        const conditions = ['Normal', 'Diabetes', 'Glaucoma', 'AMD', 'Hypertension', 'Myopia', 'Cataract'];
        const severities = ['normal', 'mild', 'moderate', 'severe'];
        const genders = ['Male', 'Female'];

        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const leftSeverity = severities[Math.floor(Math.random() * severities.length)];
        const rightSeverity = severities[Math.floor(Math.random() * severities.length)];
        const age = Math.floor(Math.random() * 50) + 20; // 20-70岁
        const gender = genders[Math.floor(Math.random() * genders.length)];

        const result = {
          "main_class": {
            "label": randomCondition,
            "confidence": parseFloat((0.7 + Math.random() * 0.29).toFixed(6))
          },
          "left_eye": {
            "severity": leftSeverity,
            "confidence": parseFloat((0.7 + Math.random() * 0.29).toFixed(6))
          },
          "right_eye": {
            "severity": rightSeverity,
            "confidence": parseFloat((0.7 + Math.random() * 0.29).toFixed(6))
          },
          "age_prediction": age,
          "gender_prediction": gender
        };

        resolve(result);
      }, 2000);
    });
  };

  // 模拟API-2调用 - 解释结果
  const callAPI2 = async (aiAnalysis: any, userInput: string = ''): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const condition = aiAnalysis.main_class.label;

        // 基本回复模板
        let response = `
# 眼底诊断结果解读

## 分析结果
AI分析您的眼底照片后，结果显示：

- **主要诊断**: ${condition === 'Normal' ? '正常眼底' : condition === 'Diabetes' ? '糖尿病视网膜病变' : condition === 'Glaucoma' ? '青光眼' : condition === 'Cataract' ? '白内障' : condition === 'AMD' ? '年龄相关性黄斑变性' : condition === 'Hypertension' ? '高血压性视网膜病变' : condition === 'Myopia' ? '高度近视' : '其他眼底异常'} (置信度: ${(aiAnalysis.main_class.confidence * 100).toFixed(2)}%)
- **左眼状态**: ${aiAnalysis.left_eye.severity === 'normal' ? '正常' : aiAnalysis.left_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.left_eye.severity === 'moderate' ? '中度异常' : '重度异常'} (置信度: ${(aiAnalysis.left_eye.confidence * 100).toFixed(2)}%)
- **右眼状态**: ${aiAnalysis.right_eye.severity === 'normal' ? '正常' : aiAnalysis.right_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.right_eye.severity === 'moderate' ? '中度异常' : '重度异常'} (置信度: ${(aiAnalysis.right_eye.confidence * 100).toFixed(2)}%)
- **预测年龄**: ${aiAnalysis.age_prediction}岁 (仅供参考)
- **预测性别**: ${aiAnalysis.gender_prediction === 'Male' ? '男性' : '女性'} (仅供参考)

## 临床解读
${condition === 'Normal' ?
          '您的眼底照片显示为正常范围，未发现明显的病理改变。这表明视网膜、视盘、黄斑区以及视网膜血管等主要结构在AI分析下未见异常。' :
          condition === 'Diabetes' ?
            '您的眼底照片显示可能存在糖尿病视网膜病变特征。糖尿病可引起视网膜微血管损伤，导致视网膜出血、硬性渗出等改变。' :
            condition === 'Glaucoma' ?
              '您的眼底照片显示可能存在青光眼相关改变。青光眼常表现为视盘凹陷扩大、视神经纤维层缺损等特征。' :
              condition === 'Cataract' ?
                '您的眼底照片显示可能存在白内障相关变化。白内障可能会影响眼底照片的清晰度，导致图像模糊。' :
                condition === 'AMD' ?
                  '您的眼底照片显示可能存在年龄相关性黄斑变性（AMD）特征。AMD是一种影响中心视力的退行性疾病，常见于老年人群。' :
                  condition === 'Hypertension' ?
                    '您的眼底照片显示可能存在高血压性视网膜病变特征。高血压可引起视网膜动脉硬化、交叉压迫征等改变。' :
                    condition === 'Myopia' ?
                      '您的眼底照片显示可能存在高度近视相关改变。高度近视常表现为视盘倾斜、后巩膜葡萄肿等特征。' :
                      '您的眼底照片显示可能存在异常，但无法确定具体病因。需要进一步专业评估。'}

左眼显示为${aiAnalysis.left_eye.severity === 'normal' ? '正常' : aiAnalysis.left_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.left_eye.severity === 'moderate' ? '中度异常' : '重度异常'}，右眼显示为${aiAnalysis.right_eye.severity === 'normal' ? '正常' : aiAnalysis.right_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.right_eye.severity === 'moderate' ? '中度异常' : '重度异常'}。

## 初步建议
1. ${condition === 'Normal' ? '建议定期进行眼科检查，保持健康生活方式' : '建议尽快到专业眼科医院进行详细检查，确认诊断'}
2. ${condition === 'Diabetes' ? '如有糖尿病史，请严格控制血糖，并定期进行眼底检查' :
          condition === 'Glaucoma' ? '可能需要进行视野检查、OCT和眼压昼夜测量' :
            condition === 'AMD' ? '可能需要进行OCT、荧光血管造影等检查' :
              condition === 'Hypertension' ? '建议同时检查血压并咨询内科医生' :
                '需要进行相关专项检查以明确诊断'
        }
3. 建议定期随访，通常每3-6个月进行一次眼底检查
4. 保持健康生活方式，包括均衡饮食、适量运动和充足睡眠

### 免责声明
本分析结果仅供参考，不构成医疗诊断或治疗建议。请咨询专业眼科医生获取完整评估和个性化建议。最终诊断应基于医生的专业判断并结合其他临床表现和检查结果。
          `;

        // 如果有用户输入问题，添加针对性回答
        if (userInput) {
          response += `\n\n### 回答您的问题："${userInput}"\n`;
          if (userInput.includes("什么病")) {
            response += `根据AI分析，您的眼底照片显示可能与${condition === 'Normal' ? '正常眼底，未发现明显疾病' : condition === 'Diabetes' ? '糖尿病视网膜病变' : condition === 'Glaucoma' ? '青光眼' : condition === 'Cataract' ? '白内障' : condition === 'AMD' ? '年龄相关性黄斑变性' : condition === 'Hypertension' ? '高血压性视网膜病变' : condition === 'Myopia' ? '高度近视' : '其他眼底异常'}相关。请务必咨询专业眼科医生获取准确诊断。`;
          } else if (userInput.includes("严重") || userInput.includes("程度")) {
            response += `基于分析，${aiAnalysis.left_eye.severity === 'normal' && aiAnalysis.right_eye.severity === 'normal' ? '您的双眼眼底状况良好，未发现明显异常' : '您的眼底状况显示'}左眼为${aiAnalysis.left_eye.severity === 'normal' ? '正常' : aiAnalysis.left_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.left_eye.severity === 'moderate' ? '中度异常' : '重度异常'}，右眼为${aiAnalysis.right_eye.severity === 'normal' ? '正常' : aiAnalysis.right_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.right_eye.severity === 'moderate' ? '中度异常' : '重度异常'}。具体严重程度需由专业医生结合其他检查综合评估。`;
          } else if (userInput.includes("治疗") || userInput.includes("怎么办")) {
            response += `根据当前分析结果，建议您${condition === 'Normal' ? '保持定期眼科检查，每1-2年一次' : '尽快到专业眼科医院就诊，进行全面检查并获取治疗方案'}。具体治疗方案需由医生根据详细检查结果制定，可能包括${condition === 'Diabetes' ? '糖尿病控制和眼底激光等治疗' : condition === 'Glaucoma' ? '降眼压药物、激光或手术治疗' : condition === 'AMD' ? '抗VEGF治疗、光动力疗法等' : '针对性的治疗措施'}。`;
          } else {
            response += `感谢您的提问。为了给您提供更精准的回答，建议咨询专业眼科医生获取详细的诊疗建议。AI辅助诊断仅供参考，不能替代医生的专业判断。`;
          }
        }

        resolve(response);
      }, 2000);
    });
  };

  // 处理发送消息，根据是否有图片决定走哪个流程
  const handleSendMessage = async (userInput: string) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    // 判断是否为图片分析流程
    const isImageAnalysis = userInput.includes('[图片分析]');

    if (isImageAnalysis) {
      // 图片分析流程 - 需要先上传完图片
      if (!leftEyeFile || !rightEyeFile || !mergedImageUrl) {
        message.warning('请先上传左眼和右眼照片');
        return;
      }

      // 添加用户图片消息
      setMessages((prev) => [...prev, {
        sender: '用户',
        content: '请分析这组眼底照片',
        timestamp,
        leftEye: leftEyeFile,
        rightEye: rightEyeFile,
        mergedImage: mergedImageUrl
      }]);

      setLoading(true);

      try {
        // 调用API-1分析图片
        const aiAnalysisResult = await callAPI1(mergedImageUrl);

        // 添加AI响应（显示原始分析结果）
        setMessages((prev) => [...prev, {
          sender: 'AI',
          content: '```json\n' + JSON.stringify(aiAnalysisResult, null, 2) + '\n```',
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          aiAnalysis: aiAnalysisResult
        }]);

        // 调用API-2获取解释
        const interpretationResult = await callAPI2(aiAnalysisResult);

        // 添加AI响应（显示解释结果）
        setMessages((prev) => [...prev, {
          sender: 'AI',
          content: interpretationResult,
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          aiAnalysis: aiAnalysisResult
        }]);
      } catch (error) {
        message.error('获取AI响应时出错。');
      } finally {
        setLoading(false);
      }
    } else {
      // 普通对话流程
      setMessages((prev) => [...prev, {
        sender: '用户',
        content: userInput,
        timestamp
      }]);

      setLoading(true);

      try {
        // 查找最近的aiAnalysis结果
        let latestAnalysis = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].aiAnalysis) {
            latestAnalysis = messages[i].aiAnalysis;
            break;
          }
        }

        // 如果有分析结果，则带上用户问题调用API-2
        // 如果没有分析结果，则是普通对话
        if (latestAnalysis) {
          // 准备历史记录（最多取3条）
          let history = [];
          if (keepHistory) {
            const recentMessages = messages.slice(-6); // 最多取最近6条（3轮对话）
            for (let i = 0; i < recentMessages.length; i++) {
              if (recentMessages[i].sender === '用户') {
                const userMsg = recentMessages[i].content;
                // 找下一条AI回复
                if (i+1 < recentMessages.length && recentMessages[i+1].sender === 'AI') {
                  const aiReply = recentMessages[i+1].content;
                  history.push({ user: userMsg, ai: aiReply });
                }
              }
            }
          }

          // 构建带历史记录的用户输入
          let fullUserInput = userInput;
          if (history.length > 0) {
            fullUserInput = `历史对话：\n${history.map(h => `用户：${h.user}\nAI：${h.ai}`).join('\n\n')}\n\n当前问题：${userInput}`;
          }

          const response = await callAPI2(latestAnalysis, fullUserInput);

          setMessages((prev) => [...prev, {
            sender: 'AI',
            content: response,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            aiAnalysis: latestAnalysis
          }]);
        } else {
          // 普通对话，使用模拟的AI响应
          const response = await getSimpleAIResponse(userInput);

          setMessages((prev) => [...prev, {
            sender: 'AI',
            content: response,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
          }]);
        }
      } catch (error) {
        message.error('获取AI响应时出错。');
      } finally {
        setLoading(false);
      }
    }
  };

  // 简单的AI响应（没有图片分析时）
  const getSimpleAIResponse = async (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          "请上传您的眼底照片，以便我能进行分析和提供更准确的建议。",
          "我需要查看您的眼底照片才能提供专业的分析。请点击左侧的选项卡上传您的左眼和右眼照片。",
          "为了进行眼底分析，请先上传您的眼底照片。上传完成后，我将为您提供详细的诊断建议。",
          "要使用眼底辅助诊断功能，请先上传清晰的眼底照片。这样我才能为您提供更有价值的信息。"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        resolve(randomResponse);
      }, 1000);
    });
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
            <Tooltip title="清除聊天">
              <Button icon={<ClearOutlined />} onClick={clearChatHistory}>清除聊天</Button>
            </Tooltip>
            <Tooltip title="是否保留上下文">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ marginRight: '8px' }}>保留上下文</Text>
                <Switch
                  checked={keepHistory}
                  onChange={setKeepHistory}
                  size="small"
                />
              </div>
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
                  <>
                    {/* 添加合并预览 */}
                    {mergedImageUrl && (
                      <div style={{ marginTop: 16 }}>
                        <Card
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <MergeCellsOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                              <span>合并预览</span>
                            </div>
                          }
                          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderRadius: '8px' }}
                        >
                          <img
                            src={mergedImageUrl}
                            alt="合并预览"
                            style={{ width: '100%', objectFit: 'contain' }}
                          />
                        </Card>
                      </div>
                    )}

                    <Button
                      type="primary"
                      style={{ marginTop: 16, width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
                      onClick={() => {
                        setActiveTab('diagnosis');
                        // 自动触发图片分析
                        handleSendMessage('[图片分析]');
                      }}
                      icon={<EyeOutlined />}
                    >
                      开始诊断
                    </Button>
                  </>
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
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column'}}>
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              borderRadius: '8px',
              marginBottom: '20px',
              overflow: 'hidden'
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

                      {/* 消息内容 */}
                      {msg.sender === 'AI' ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\n/g, '<br>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/#{3} (.*?)$/gm, '<h3>$1</h3>')
                              .replace(/#{2} (.*?)$/gm, '<h2>$1</h2>')
                              .replace(/#{1} (.*?)$/gm, '<h1>$1</h1>')
                              .replace(/```json\n([\s\S]*?)\n```/g, '<pre style="background-color:#f6f8fa;padding:10px;border-radius:5px;overflow:auto"><code>$1</code></pre>')
                          }}
                        />
                      ) : (
                        <div>{msg.content}</div>
                      )}

                      {/* 显示合并图片（如果有） */}
                      {msg.mergedImage && (
                        <div style={{ marginTop: 10 }}>
                          <img
                            src={msg.mergedImage}
                            alt="眼底照片合并图"
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}
                          />
                        </div>
                      )}

                      <div style={{ fontSize: '12px', color: '#999', marginTop: 4, textAlign: 'right' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // ... existing code ...
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

            {/* 聊天控制区域 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <Tooltip title="清除聊天记录">
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearChatHistory}
                  style={{ marginRight: '10px' }}
                >
                  清除记录
                </Button>
              </Tooltip>

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

            <ChatBox
              onSendMessage={handleSendMessage}
              hasImages={!!(leftEyeFile && rightEyeFile)}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SelfDeployAIPage;
