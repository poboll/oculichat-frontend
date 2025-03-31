
import React, { useState, useEffect, useRef } from 'react';
import { Card, message, Typography, Layout, Avatar, Empty, Divider, Spin, Button, Tabs, Space, Tooltip, Switch } from 'antd';
import {
  RobotOutlined,
  UserOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
  ClearOutlined,
  MergeCellsOutlined,
  EyeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import ChatBox from '@/components/ChatBox';


// 本地存储键名
const CHAT_HISTORY_KEY = 'local_oculi_chat_history';
const KEEP_HISTORY_KEY = 'local_oculi_keep_history_setting';
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

        // 上传合并图片到FastDFS服务器
        uploadMergedImageToFastDFS(mergedUrl);
      }
    };

    leftImg.onload = onImageLoad;
    rightImg.onload = onImageLoad;

    leftImg.src = URL.createObjectURL(leftEyeFile);
    rightImg.src = URL.createObjectURL(rightEyeFile);
  };

  // 上传合并图片到FastDFS服务器
  const uploadMergedImageToFastDFS = async (imageDataUrl: string) => {
    try {
      // 确保base64格式正确
      const base64Data = imageDataUrl.split(',')[1]; // 只取内容部分

      // 将base64转换为Blob对象
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });

      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', blob, 'merged_eye_image.jpg');

      // 输出一些调试信息
      console.log('上传文件大小:', blob.size);

      // 发送请求到FastDFS服务器
      const response = await fetch('http://10.3.36.106:7529/api/fastdfs/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('合并图片上传成功，URL:', result.fileUrl);
        message.success('合并图片已成功上传到服务器');
        // 可以选择是否将返回的URL保存到状态中
        // setMergedImageServerUrl(result.fileUrl);
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传合并图片到FastDFS失败:', error);
      message.error('上传合并图片到服务器失败，但不影响本地使用');
    }
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
分级: ${analysis.main_class.grade}级
左眼: ${analysis.left_eye.severity} (置信度: ${(analysis.left_eye.confidence * 100).toFixed(2)}%)
右眼: ${analysis.right_eye.severity} (置信度: ${(analysis.right_eye.confidence * 100).toFixed(2)}%)
预测年龄: ${analysis.age_prediction}
预测性别: ${analysis.gender_prediction}

## 病灶测量
微血管瘤: ${analysis.measurements?.microaneurysm_count ?? '未测量'}个
出血点: ${analysis.measurements?.hemorrhage_count ?? '未测量'}处
硬性渗出: ${analysis.measurements?.exudate_count ?? '未测量'}处

## 特征重要性
${analysis.feature_importance?.factors?.map(f =>
          `- ${f.name}: ${(f.value * 100).toFixed(1)}%`
        ).join('\n') || '无特征重要性数据'}

## 可视化分析
- 左眼分析图: ${analysis.visualizations?.left_eye ? '已生成' : '无'}
- 右眼分析图: ${analysis.visualizations?.right_eye ? '已生成' : '无'}
- 包含视图: ${analysis.visualizations?.left_eye?.filtered_views ?
          Object.keys(analysis.visualizations.left_eye.filtered_views).join(', ') : '无'}

## 诊断解读
${analysis.explanation.text}
关键发现：${analysis.explanation.findings.join('，')}

## 诊断建议
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

  // 当消息更新时保存到本地存储
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



// 模拟API-1调用 - 分析图片
  const callAPI1 = async (imageUrl: string): Promise<any> => {
    // 从当前合并的图片获取左右眼图片的base64数据
    const getBase64FromMergedImage = async (): Promise<{left: string, right: string}> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          message.error('无法创建canvas上下文');
          return;
        }

        const img = new Image();
        img.onload = () => {
          // 设置画布大小
          canvas.width = img.width;
          canvas.height = img.height;

          // 绘制完整图片
          ctx.drawImage(img, 0, 0);

          // 假设左右眼图片等宽，取图片中点分割
          const midPoint = img.width / 2;

          // 创建左眼canvas
          const leftCanvas = document.createElement('canvas');
          const leftCtx = leftCanvas.getContext('2d');
          leftCanvas.width = midPoint;
          leftCanvas.height = img.height;
          leftCtx?.drawImage(img, 0, 0);

          // 创建右眼canvas
          const rightCanvas = document.createElement('canvas');
          const rightCtx = rightCanvas.getContext('2d');
          rightCanvas.width = midPoint;
          rightCanvas.height = img.height;
          rightCtx?.drawImage(img, -midPoint, 0);

          // 获取base64数据，去掉前缀"data:image/jpeg;base64,"
          const leftBase64 = leftCanvas.toDataURL('image/jpeg').split(',')[1];
          const rightBase64 = rightCanvas.toDataURL('image/jpeg').split(',')[1];

          resolve({
            left: leftBase64,
            right: rightBase64
          });
        };

        img.src = imageUrl;
      });
    };

    try {
      // 获取左右眼图片的base64数据
      const { left: leftImageBase64, right: rightImageBase64 } = await getBase64FromMergedImage();

      // 构造请求体
      const requestBody = {
        left_image_base64: leftImageBase64,
        right_image_base64: rightImageBase64
      };

      // 设置API URL
      // const apiUrl = 'http://10.3.36.10:7529/api/model/predict';  // 使用真实接口
      const apiUrl = 'http://10.3.36.106:7529/api/model/simulate';  // 使用模拟接口（备用）

      // 发送请求到后端
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API响应结果:', result);
      return result;
    } catch (error) {
      console.error('调用模型API出错:', error);
      message.error('分析图片时出错，请重试');

      // 出错时返回模拟数据作为备用（可选，便于开发调试）
      return {
        "main_class": {
          "label": "Diabetes",
          "confidence": 0.85
        },
        "left_eye": {
          "severity": "mild",
          "confidence": 0.78
        },
        "right_eye": {
          "severity": "moderate",
          "confidence": 0.82
        },
        "age_prediction": 48,
        "gender_prediction": "Male",
        "explanation": {
          "findings": [
            "微血管瘤",
            "点状出血",
            "硬性渗出"
          ],
          "text": "诊断结果为DR二级，发现多个微血管瘤和出血灶。"
        },
        "feature_importance": {
          "image": "data:",
          "factors": [
            {
              "name": "微血管瘤",
              "value": 0.42
            },
            {
              "name": "出血点",
              "value": 0.35
            },
            {
              "name": "硬性渗出",
              "value": 0.23
            }
          ]
        },
        "measurements": {
          "microaneurysm_count": 5,
          "exudate_count": 2,
          "hemorrhage_count": 3
        },
        "visualizations": {
          "right_eye": {
            "filtered_views": {
              "red_free": "data:image/png;base64,iVAZD0iciI/P",
              "green_channel": "data:image/png;base64,iVFja2VqqqKj8XQEGAHGtChZVP2QFAAAAAElFTkSuQmCC",
              "contrast_enhanced": "data:image/png;base64,iVAuQmCC"
            },
            "original": "data:image/png;base64,iVAAqKj8XQEGAHGtChZVP2QFAAAAAElFTkSuQmCC",
            "binary_map": "data:image/png;base64,iVAA",
            "probability_map": "data:image/png;base64,iVAA"
          },
          "left_eye": {
            "filtered_views": {
              "red_free": "data:image/png;base64,iVAAAGFqqKj8XQEGAHGtChZVP2QFAAAAAElFTkSuQmCC",
              "green_channel": "data:image/png;base64,iVA4cGFC",
              "contrast_enhanced": "data:image/png"
            },
            "original": "data:image/png;base64,",
            "binary_map": "data:image/png;base64,iVAAAAD",
            "probability_map": "data:image/png;base64,iVAAA"
          }
        }
      };
    }
  };


  // 模拟API-2调用 - 解释结果
  const callAPI2 = async (aiAnalysis: any, userInput: string = ''): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const condition = aiAnalysis.main_class.label;

        // 基本回复模板
        let response = `
# 眼底诊断结果解读

## 病灶分布
- 微血管瘤: ${aiAnalysis.measurements?.microaneurysm_count || '未定义'}个
- 出血点: ${aiAnalysis.measurements?.hemorrhage_count || '未定义'}处
- 硬性渗出: ${aiAnalysis.measurements?.exudate_count || '未定义'}处

## 分析结果
AI分析您的眼底照片后，结果显示：

- **主要诊断**: ${condition === 'Normal' ? '正常眼底' : condition === 'Diabetes' ? '糖尿病视网膜病变' : condition === 'Glaucoma' ? '青光眼' : condition === 'Cataract' ? '白内障' : condition === 'AMD' ? '年龄相关性黄斑变性' : condition === 'Hypertension' ? '高血压性视网膜病变' : condition === 'Myopia' ? '高度近视' : '其他眼底异常'} (置信度: ${(aiAnalysis.main_class.confidence * 100).toFixed(2)}%)
- **左眼状态**: ${aiAnalysis.left_eye.severity === 'normal' ? '正常' : aiAnalysis.left_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.left_eye.severity === 'moderate' ? '中度异常' : '重度异常'} (置信度: ${(aiAnalysis.left_eye.confidence * 100).toFixed(2)}%)
- **右眼状态**: ${aiAnalysis.right_eye.severity === 'normal' ? '正常' : aiAnalysis.right_eye.severity === 'mild' ? '轻度异常' : aiAnalysis.right_eye.severity === 'moderate' ? '中度异常' : '重度异常'} (置信度: ${(aiAnalysis.right_eye.confidence * 100).toFixed(2)}%)
- **预测年龄**: ${aiAnalysis.age_prediction}岁 (仅供参考)
- **预测性别**: ${aiAnalysis.gender_prediction === 'Male' ? '男性' : '女性'} (仅供参考)

## 可视化分析
AI已生成以下分析视图：
${aiAnalysis.visualizations ? `
- **左眼分析图**: 包含${Object.keys(aiAnalysis.visualizations.left_eye?.filtered_views || {}).length}种特殊视图
- **右眼分析图**: 包含${Object.keys(aiAnalysis.visualizations.right_eye?.filtered_views || {}).length}种特殊视图
` : '无可视化分析数据'}

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

        // 直接调用API-2获取解释，不再显示原始JSON
        const interpretationResult = await callAPI2(aiAnalysisResult);

        // 添加AI响应（仅显示解释结果）
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
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('清除本地存储失败:', error);
    }
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
    <Layout style={{ height: '100vh', overflow: 'hidden', background: '#f5f7fa' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        color: '#333',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        padding: '0 24px'
      }}>
        <Title level={3} style={{ margin: 0, color: '#333' }}>
          <RobotOutlined style={{ marginRight: 10, color: '#315167FF' }} />
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
          boxShadow: '1px 0 4px rgba(0,0,0,0.1)',  //0,0,0,0.05 增加阴影
          background: '#fff',  //#fcfcfc 白色背景
          height: 'calc(100vh - 64px)',
        }}>
          <Tabs defaultActiveKey="upload" onChange={(key) => setActiveTab(key)} >
            <TabPane tab="照片上传" key="upload">
              <div style={{ marginBottom: 20 }}>
                <Card
                  title="左眼照片"
                  style={{
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    marginBottom: 16,
                  }}
                  headStyle={{ color: '#315167FF' }} //#52c41a    49, 81,103
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
                  headStyle={{ color: '#315167FF' }}
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

              <div style={{ marginBottom: 50 }}>
                <Divider>上传状态</Divider>
                <div style={{ display: 'flex', justifyContent: 'space-between' ,color: '#315167FF' }}>
                  <div>
                    <Text strong>左眼照片:</Text>
                    <Text style={{ color: leftEyeFile ? '#1890ff' : '#999' }}> {leftEyeFile ? leftEyeFile.name : '未上传'}</Text>
                  </div>
                  <div>
                    <Text strong>右眼照片:</Text>
                    <Text style={{ color: leftEyeFile ? '#1890ff' : '#999' }}> {rightEyeFile ? rightEyeFile.name : '未上传'}</Text>
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
                              <MergeCellsOutlined style={{ marginRight: 8, color: '#315167FF' }} />
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
                      style={{ marginTop: 16, width: '100%', background: '#315167FF', borderColor: '#315167FF' }}
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
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column' , background: '#f0f2f5'}}>
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',  //0,0,0,0.05
              borderRadius: '12px',  //8
              marginBottom: '24px',   //24
              overflow: 'hidden',
              background: '#fff', // 白色背景
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',   //20
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
                      marginBottom: '16px',  //20
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
                            backgroundColor: msg.sender === '用户' ? '#959393' : '#4a7ba3',
                            marginRight: 8
                          }}
                          size="small"
                        />
                        <strong>{msg.sender}</strong>
                      </div>

                      {/* 消息内容 */}
                      {msg.sender === 'AI' ? (
                        <div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: msg.content
                                .replace(/\n/g, '<br>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#315167FF">$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em style="color:#315167FF">$1</em>')
                                .replace(/#{3} (.*?)(<br>|$)/gm, '<h3 style="color:#315167FF;margin:12px 0 8px;font-size:1.2em;border-left:4px solid #315167FF;padding-left:8px">$1</h3>')
                                .replace(/#{2} (.*?)(<br>|$)/gm, '<h2 style="color:#315167FF;margin:14px 0 10px;font-size:1.4em;border-bottom:1px solid #315167FF;padding-bottom:4px">$1</h2>')
                                .replace(/#{1} (.*?)(<br>|$)/gm, '<h1 style="color:#315167FF;margin:16px 0 12px;font-size:1.6em">$1</h1>')
                                .replace(/- (.*?)(<br>|$)/g, '<li style="margin-left:16px">$1</li>')
                                .replace(/\d+\. (.*?)(<br>|$)/g, '<li style="margin-left:16px">$1</li>')
                                .replace(/`([^`]+)`/g, '<code style="background:#f0f9ff;padding:2px 4px;border-radius:3px;border:1px solid #d9d9d9">$1</code>')
                            }}
                          />
                          {/* 显示可视化数据（如果有） */}
                          {msg.aiAnalysis?.visualizations && (
                            <div style={{ marginTop: 16, borderRadius: 12, padding: 16, background: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                              <h4 style={{ color: '#315167FF', marginBottom: 16, borderBottom: '1px solid #eaedf0', paddingBottom: 10, fontWeight: 600 }}>
                                <EyeOutlined style={{ marginRight: 8 }} /> AI 眼底诊断分析结果
                              </h4>

                              {/* 诊断结果摘要区 - 移到顶部使其成为焦点 */}
                              <div style={{
                                marginBottom: 20,
                                background: '#f0f5fa',
                                padding: 16,
                                borderRadius: 10,
                                border: '1px solid #e2ebf5'
                              }}>
                                <h5 style={{ marginBottom: 12, color: '#315167FF', fontSize: 15 }}>诊断结果摘要</h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                  gap: '16px'
                                }}>
                                  <div>
                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>主要诊断</div>
                                    <div style={{
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                      color: '#315167FF',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}>
            <span>{
              msg.aiAnalysis.main_class.label === 'Normal' ? '正常眼底' :
                msg.aiAnalysis.main_class.label === 'DR' ? '糖尿病视网膜病变' :
                  msg.aiAnalysis.main_class.label === 'Glaucoma' ? '青光眼' :
                    msg.aiAnalysis.main_class.label === 'Cataract' ? '白内障' :
                      msg.aiAnalysis.main_class.label === 'AMD' ? '年龄相关性黄斑变性' :
                        msg.aiAnalysis.main_class.label === 'Hypertension' ? '高血压性视网膜病变' :
                          msg.aiAnalysis.main_class.label
            }</span>
                                      <span style={{
                                        fontWeight: 'normal',
                                        fontSize: 13,
                                        background: '#315167FF',
                                        color: 'white',
                                        padding: '3px 8px',
                                        borderRadius: 15
                                      }}>
              {msg.aiAnalysis.main_class.grade && `${msg.aiAnalysis.main_class.grade}级`}
            </span>
                                    </div>
                                    <div style={{
                                      marginTop: 4,
                                      fontSize: 12,
                                      color: '#666',
                                      background: '#e6f2fd',
                                      padding: '2px 6px',
                                      borderRadius: 4,
                                      display: 'inline-block'
                                    }}>
                                      置信度: {(msg.aiAnalysis.main_class.confidence * 100).toFixed(1)}%
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>病灶数量</div>
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '5px',
                                      fontSize: 14
                                    }}>
                                      {msg.aiAnalysis.measurements?.microaneurysm_count !== undefined && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <div style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: '#ff4d4f',
                                            marginRight: 6
                                          }}></div>
                                          微血管瘤: <strong style={{ marginLeft: 4 }}>{msg.aiAnalysis.measurements.microaneurysm_count}</strong>
                                        </div>
                                      )}
                                      {msg.aiAnalysis.measurements?.hemorrhage_count !== undefined && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <div style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: '#722ed1',
                                            marginRight: 6
                                          }}></div>
                                          出血点: <strong style={{ marginLeft: 4 }}>{msg.aiAnalysis.measurements.hemorrhage_count}</strong>
                                        </div>
                                      )}
                                      {msg.aiAnalysis.measurements?.exudate_count !== undefined && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <div style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: '#faad14',
                                            marginRight: 6
                                          }}></div>
                                          硬性渗出: <strong style={{ marginLeft: 4 }}>{msg.aiAnalysis.measurements.exudate_count}</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>患者信息预测</div>
                                    <div style={{ fontSize: 14 }}>
                                      {msg.aiAnalysis.age_prediction && (
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                          <span style={{ marginRight: 8 }}>年龄:</span>
                                          <strong style={{
                                            background: '#f0f5fa',
                                            padding: '2px 8px',
                                            borderRadius: 4
                                          }}>{msg.aiAnalysis.age_prediction}岁</strong>
                                        </div>
                                      )}
                                      {msg.aiAnalysis.gender_prediction && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <span style={{ marginRight: 8 }}>性别:</span>
                                          <strong style={{
                                            background: msg.aiAnalysis.gender_prediction === 'Male' ? '#e6f7ff' : '#fff0f6',
                                            padding: '2px 10px',
                                            borderRadius: 4,
                                            color: msg.aiAnalysis.gender_prediction === 'Male' ? '#1890ff' : '#eb2f96'
                                          }}>{msg.aiAnalysis.gender_prediction === 'Male' ? '男' : '女'}</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* 新增：关键发现标签 */}
                                {msg.aiAnalysis.explanation?.findings && msg.aiAnalysis.explanation.findings.length > 0 && (
                                  <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>关键发现</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                      {msg.aiAnalysis.explanation.findings.map((finding, idx) => (
                                        <span key={idx} style={{
                                          background: ['#fff7e6', '#e6f7ff', '#f6ffed'][idx % 3],
                                          border: `1px solid ${['#ffd591', '#91d5ff', '#b7eb8f'][idx % 3]}`,
                                          padding: '2px 10px',
                                          borderRadius: 12,
                                          fontSize: 13
                                        }}>{finding}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                {/* 左右眼分析区 - 采用网格布局确保对称 */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                  gap: 20,
                                  width: '100%'
                                }}>
                                  {/* 左眼分析区块 */}
                                  {msg.aiAnalysis.visualizations.left_eye && (
                                    <div style={{
                                      background: '#fff',
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                    }}>
                                      <div style={{
                                        background: '#315167FF',
                                        color: 'white',
                                        padding: '10px 15px',
                                        fontSize: 15,
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
              <span style={{
                display: 'inline-block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                color: '#315167FF',
                textAlign: 'center',
                lineHeight: '20px',
                fontSize: 13,
                fontWeight: 'bold',
                marginRight: 8
              }}>L</span>
                                        左眼分析
                                        <span style={{
                                          marginLeft: 'auto',
                                          fontSize: 13,
                                          background: msg.aiAnalysis.left_eye.severity === 'normal' ? '#52c41a' :
                                            msg.aiAnalysis.left_eye.severity === 'mild' ? '#1890ff' :
                                              msg.aiAnalysis.left_eye.severity === 'moderate' ? '#fa8c16' : '#f5222d',
                                          padding: '2px 10px',
                                          borderRadius: 12
                                        }}>
                {msg.aiAnalysis.left_eye.severity === 'normal' ? '正常' :
                  msg.aiAnalysis.left_eye.severity === 'mild' ? '轻度' :
                    msg.aiAnalysis.left_eye.severity === 'moderate' ? '中度' : '重度'}
                                          ({(msg.aiAnalysis.left_eye.confidence * 100).toFixed(0)}%)
              </span>
                                      </div>

                                      <div style={{ padding: 15 }}>
                                        {/* 左眼原始图像 */}
                                        {msg.aiAnalysis.visualizations.left_eye.original && (
                                          <div style={{ marginBottom: 15 }}>
                                            <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>原始眼底图像</h6>
                                            <div style={{
                                              borderRadius: 8,
                                              overflow: 'hidden',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                              background: '#000',
                                              padding: 1
                                            }}>
                                              <img
                                                src={msg.aiAnalysis.visualizations.left_eye.original}
                                                alt="左眼原始图"
                                                style={{ width: '100%', display: 'block', borderRadius: 7 }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {/* 左眼分析图 - 使用网格布局 */}
                                        <div style={{ marginBottom: 15 }}>
                                          <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>疾病分析图</h6>
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                            {msg.aiAnalysis.visualizations.left_eye.probability_map && (
                                              <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{
                                                  fontSize: 12,
                                                  background: '#f5f7fa',
                                                  padding: '5px 8px',
                                                  borderBottom: '1px solid #eee'
                                                }}>
                                                  疾病概率热图
                                                </div>
                                                <img
                                                  src={msg.aiAnalysis.visualizations.left_eye.probability_map}
                                                  alt="左眼概率图"
                                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                                />
                                              </div>
                                            )}
                                            {msg.aiAnalysis.visualizations.left_eye.binary_map && (
                                              <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{
                                                  fontSize: 12,
                                                  background: '#f5f7fa',
                                                  padding: '5px 8px',
                                                  borderBottom: '1px solid #eee'
                                                }}>
                                                  病变分割图
                                                </div>
                                                <img
                                                  src={msg.aiAnalysis.visualizations.left_eye.binary_map}
                                                  alt="左眼二值图"
                                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* 左眼增强视图 */}
                                        {msg.aiAnalysis.visualizations.left_eye.filtered_views && (
                                          <div>
                                            <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>增强视图</h6>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                                              {Object.entries(msg.aiAnalysis.visualizations.left_eye.filtered_views).map(([key, value]) => (
                                                <div key={`left-${key}`} style={{
                                                  borderRadius: 8,
                                                  overflow: 'hidden',
                                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                  <div style={{
                                                    fontSize: 12,
                                                    background: '#f5f7fa',
                                                    padding: '5px 8px',
                                                    borderBottom: '1px solid #eee'
                                                  }}>
                                                    {key === 'green_channel' ? '绿色通道' :
                                                      key === 'red_free' ? '无红通道' :
                                                        key === 'contrast_enhanced' ? '对比度增强' : key}
                                                  </div>
                                                  <img
                                                    src={value as string}
                                                    alt={`左眼${key}视图`}
                                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 右眼分析区块 */}
                                  {msg.aiAnalysis.visualizations.right_eye && (
                                    <div style={{
                                      background: '#fff',
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                    }}>
                                      <div style={{
                                        background: '#315167FF',
                                        color: 'white',
                                        padding: '10px 15px',
                                        fontSize: 15,
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
              <span style={{
                display: 'inline-block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                color: '#315167FF',
                textAlign: 'center',
                lineHeight: '20px',
                fontSize: 13,
                fontWeight: 'bold',
                marginRight: 8
              }}>R</span>
                                        右眼分析
                                        <span style={{
                                          marginLeft: 'auto',
                                          fontSize: 13,
                                          background: msg.aiAnalysis.right_eye.severity === 'normal' ? '#52c41a' :
                                            msg.aiAnalysis.right_eye.severity === 'mild' ? '#1890ff' :
                                              msg.aiAnalysis.right_eye.severity === 'moderate' ? '#fa8c16' : '#f5222d',
                                          padding: '2px 10px',
                                          borderRadius: 12
                                        }}>
                {msg.aiAnalysis.right_eye.severity === 'normal' ? '正常' :
                  msg.aiAnalysis.right_eye.severity === 'mild' ? '轻度' :
                    msg.aiAnalysis.right_eye.severity === 'moderate' ? '中度' : '重度'}
                                          ({(msg.aiAnalysis.right_eye.confidence * 100).toFixed(0)}%)
              </span>
                                      </div>

                                      <div style={{ padding: 15 }}>
                                        {/* 右眼原始图像 */}
                                        {msg.aiAnalysis.visualizations.right_eye.original && (
                                          <div style={{ marginBottom: 15 }}>
                                            <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>原始眼底图像</h6>
                                            <div style={{
                                              borderRadius: 8,
                                              overflow: 'hidden',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                              background: '#000',
                                              padding: 1
                                            }}>
                                              <img
                                                src={msg.aiAnalysis.visualizations.right_eye.original}
                                                alt="右眼原始图"
                                                style={{ width: '100%', display: 'block', borderRadius: 7 }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {/* 右眼分析图 - 使用网格布局 */}
                                        <div style={{ marginBottom: 15 }}>
                                          <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>疾病分析图</h6>
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                            {msg.aiAnalysis.visualizations.right_eye.probability_map && (
                                              <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{
                                                  fontSize: 12,
                                                  background: '#f5f7fa',
                                                  padding: '5px 8px',
                                                  borderBottom: '1px solid #eee'
                                                }}>
                                                  疾病概率热图
                                                </div>
                                                <img
                                                  src={msg.aiAnalysis.visualizations.right_eye.probability_map}
                                                  alt="右眼概率图"
                                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                                />
                                              </div>
                                            )}
                                            {msg.aiAnalysis.visualizations.right_eye.binary_map && (
                                              <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{
                                                  fontSize: 12,
                                                  background: '#f5f7fa',
                                                  padding: '5px 8px',
                                                  borderBottom: '1px solid #eee'
                                                }}>
                                                  病变分割图
                                                </div>
                                                <img
                                                  src={msg.aiAnalysis.visualizations.right_eye.binary_map}
                                                  alt="右眼二值图"
                                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* 右眼增强视图 */}
                                        {msg.aiAnalysis.visualizations.right_eye.filtered_views && (
                                          <div>
                                            <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>增强视图</h6>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                                              {Object.entries(msg.aiAnalysis.visualizations.right_eye.filtered_views).map(([key, value]) => (
                                                <div key={`right-${key}`} style={{
                                                  borderRadius: 8,
                                                  overflow: 'hidden',
                                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                  <div style={{
                                                    fontSize: 12,
                                                    background: '#f5f7fa',
                                                    padding: '5px 8px',
                                                    borderBottom: '1px solid #eee'
                                                  }}>
                                                    {key === 'green_channel' ? '绿色通道' :
                                                      key === 'red_free' ? '无红通道' :
                                                        key === 'contrast_enhanced' ? '对比度增强' : key}
                                                  </div>
                                                  <img
                                                    src={value as string}
                                                    alt={`右眼${key}视图`}
                                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 特征重要性区 - 使用新的可视化方式 */}
                              {(msg.aiAnalysis.feature_importance?.image || msg.aiAnalysis.feature_importance?.factors) && (
                                <div style={{
                                  marginTop: 20,
                                  background: '#fff',
                                  borderRadius: 10,
                                  padding: 15,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                }}>
                                  <h5 style={{ color: '#315167FF', marginBottom: 12, fontSize: 15 }}>特征重要性分析</h5>
                                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                    {msg.aiAnalysis.feature_importance.image && (
                                      <div style={{ flex: '1 0 200px', maxWidth: '350px' }}>
                                        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                                          <img
                                            src={msg.aiAnalysis.feature_importance.image}
                                            alt="特征重要性图"
                                            style={{ width: '100%', display: 'block' }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {msg.aiAnalysis.feature_importance?.factors && msg.aiAnalysis.feature_importance.factors.length > 0 && (
                                      <div style={{ flex: '1 0 200px' }}>
                                        <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                                          {msg.aiAnalysis.feature_importance.factors.map((factor, idx) => (
                                            <div key={idx} style={{ marginBottom: 8 }}>
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: idx === 0 ? 'bold' : 'normal',
                        color: idx === 0 ? '#315167FF' : '#666'
                      }}>{factor.name}</span>
                                                <span style={{
                                                  fontSize: 14,
                                                  fontWeight: idx === 0 ? 'bold' : 'normal',
                                                  color: idx === 0 ? '#315167FF' : '#666'
                                                }}>{(factor.value * 100).toFixed(1)}%</span>
                                              </div>
                                              <div style={{ height: 12, width: '100%', background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                                                <div
                                                  style={{
                                                    height: '100%',
                                                    width: `${factor.value * 100}%`,
                                                    background: `linear-gradient(90deg, ${
                                                      idx === 0 ? '#315167FF' :
                                                        idx === 1 ? '#4a7ba3' :
                                                          idx === 2 ? '#769ebf' : '#a3c5df'
                                                    } 0%, ${
                                                      idx === 0 ? '#4a7ba3' :
                                                        idx === 1 ? '#769ebf' :
                                                          idx === 2 ? '#a3c5df' : '#d5e6f3'
                                                    } 100%)`,
                                                    borderRadius: 6
                                                  }}
                                                />
                                              </div>
                                              {/* 添加特征解释 */}
                                              <div style={{ fontSize: 12, color: '#888', marginTop: 2, paddingLeft: 2 }}>
                                                {idx === 0 ? '主要病变特征，对诊断结果影响最大' :
                                                  idx === 1 ? '次要病变特征，辅助确认诊断' :
                                                    '辅助特征，提供参考价值'}
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        {/* 添加交互式图例解释 */}
                                        <div style={{
                                          marginTop: 10,
                                          padding: 12,
                                          background: '#f9f9f9',
                                          borderRadius: 8,
                                          fontSize: 13
                                        }}>
                                          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#315167FF' }}>特征解读说明：</div>
                                          <div>上述特征是AI诊断时重点关注的眼底病变特征，百分比表示各特征对最终诊断结果的贡献权重。</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 新增：病理解释区 */}
                              {msg.aiAnalysis.explanation?.text && (
                                <div style={{
                                  marginTop: 20,
                                  background: '#fff',
                                  borderRadius: 10,
                                  padding: 15,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                }}>
                                  <h5 style={{
                                    color: '#315167FF',
                                    marginBottom: 12,
                                    fontSize: 15,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#315167FF" style={{ marginRight: 8 }}>
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v6h-2zm0-4h2v2h-2z"/>
                                    </svg>
                                    病理解读
                                  </h5>
                                  <div style={{
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: '#444',
                                    padding: '8px 12px',
                                    background: '#f0f5fa',
                                    borderRadius: 8,
                                    border: '1px solid #e2ebf5'
                                  }}>
                                    {msg.aiAnalysis.explanation.text}
                                  </div>

                                  {/* 添加可视化病理进展图 */}
                                  <div style={{ marginTop: 15 }}>
                                    <h6 style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'normal' }}>疾病进展示意图</h6>
                                    <div style={{
                                      width: '100%',
                                      height: 60,
                                      background: 'linear-gradient(90deg, #52c41a 0%, #1890ff 33%, #fa8c16 66%, #f5222d 100%)',
                                      borderRadius: 6,
                                      position: 'relative',
                                      marginTop: 10
                                    }}>
                                      {/* 当前状态指示器 */}
                                      <div style={{
                                        position: 'absolute',
                                        left: msg.aiAnalysis.main_class.label === 'Normal' ? '10%' :
                                          msg.aiAnalysis.main_class.grade === 1 ? '30%' :
                                            msg.aiAnalysis.main_class.grade === 2 ? '50%' :
                                              msg.aiAnalysis.main_class.grade === 3 ? '70%' : '90%',
                                        top: 0,
                                        transform: 'translateX(-50%)',
                                        width: 4,
                                        height: '100%',
                                        background: 'white',
                                        boxShadow: '0 0 0 2px rgba(0,0,0,0.2)'
                                      }}></div>

                                      {/* 阶段标记 */}
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        position: 'absolute',
                                        width: '100%',
                                        bottom: -25,
                                        fontSize: 12,
                                        color: '#666'
                                      }}>
                                        <span style={{ textAlign: 'left' }}>正常</span>
                                        <span style={{ textAlign: 'center' }}>轻度</span>
                                        <span style={{ textAlign: 'center' }}>中度</span>
                                        <span style={{ textAlign: 'right' }}>重度</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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

                <Empty description={
                  <div>
                    <p>请上传左眼和右眼照片，然后开始诊断</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>您可以询问关于眼底照片的任何问题</p>
                  </div>
                } />
              )}
              {/*{loading && (*/}
              {/*  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>*/}
              {/*    <Spin tip="AI正在分析眼底照片..." />*/}
              {/*  </div>*/}
              {/*)}*/}
              {loading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px',
                }}>
                  <Spin
                    tip="AI正在分析眼底照片..."
                    indicator={<LoadingOutlined style={{ fontSize: '24px', color: 'leftEyeFile' }} spin />} // 使用旋转图标
                  />
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
