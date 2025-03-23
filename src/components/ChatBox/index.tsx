import React, { useState } from 'react';
import { Input, Button, message, Select, Tooltip } from 'antd';
import { SendOutlined, PictureOutlined, QuestionCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const ChatBox: React.FC<{
  onSendMessage: (message: string) => void,
  hasImages?: boolean
}> = ({ onSendMessage, hasImages = false }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string>('');

  // 智能提示不同阶段的常见问题
  const getCommonQueries = () => {
    if (!hasImages) {
      return [
        '眼底检查的重要性是什么？',
        '什么情况下需要做眼底检查？',
        '眼底照片能检查出哪些疾病？',
        '眼底检查前需要做哪些准备？',
        '眼底检查会有不适感吗？'
      ];
    } else {
      return [
        '这些眼底照片是否有异常？',
        '这些照片显示有青光眼风险吗？',
        '请分析这些照片中的视网膜状态',
        '是否有糖尿病视网膜病变的迹象？',
        '我得了什么病？',
        '病情严重吗？',
        '需要进一步检查吗？',
        '我应该怎么治疗？'
      ];
    }
  };

  const handleSendMessage = async () => {
    const message = userInput.trim() || selectedQuery;
    if (!message) return;

    try {
      setLoading(true);
      // 判断是否是图片分析操作
      const messageToSend = !hasImages ? message :
        (userInput === '[图片分析]' || selectedQuery === '[图片分析]') ?
          '[图片分析]' : message;

      await onSendMessage(messageToSend);
      setUserInput(''); // 发送后清空输入框
      setSelectedQuery('');
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  // 发起图片分析
  const startImageAnalysis = () => {
    if (!hasImages) {
      message.warning('请先上传左眼和右眼照片');
      return;
    }
    onSendMessage('[图片分析]');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Select
        placeholder="选择常见问题或输入自定义问题"
        style={{ width: '100%' }}
        value={selectedQuery || undefined}
        onChange={setSelectedQuery}
        allowClear
        dropdownMatchSelectWidth={false}
      >
        {getCommonQueries().map((query, index) => (
          <Option key={index} value={query}>{query}</Option>
        ))}
      </Select>

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
          placeholder="输入问题，按Enter发送，Shift+Enter换行..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            marginRight: 10,
            borderRadius: 20,
            padding: '8px 12px',
            borderColor: '#d9d9d9',
            marginBottom: 10,
            flex: 1
          }}
        />

        {hasImages && (
          <Tooltip title="分析眼底照片">
            <Button
              onClick={startImageAnalysis}
              shape="circle"
              icon={<PictureOutlined />}
              style={{
                marginRight: 8,
                marginBottom: 10,
                background: '#52c41a',
                borderColor: '#52c41a',
                color: 'white'
              }}
            />
          </Tooltip>
        )}

        <Tooltip title="发送消息">
          <Button
            type="primary"
            onClick={handleSendMessage}
            loading={loading}
            shape="circle"
            icon={<SendOutlined />}
            size="large"
            style={{ background: '#1890ff', borderColor: '#1890ff', marginBottom: 10 }}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatBox;
