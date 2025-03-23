// ... existing code ...
import React, { useState } from 'react';
import { Input, Button, message, Select } from 'antd';
import { SendOutlined } from "@ant-design/icons";

const { Option } = Select;

const ChatBox: React.FC<{ onSendMessage: (message: string) => void }> = ({ onSendMessage }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string>('');

  const commonQueries = [
    '这些眼底照片是否有异常？',
    '这些照片显示有青光眼风险吗？',
    '请分析这些照片中的视网膜状态',
    '是否有糖尿病视网膜病变的迹象？',
    '这些眼底照片需要进一步检查吗？'
  ];

  const handleSendMessage = async () => {
    const message = userInput.trim() || selectedQuery;
    if (!message) return;

    try {
      setLoading(true);
      await onSendMessage(message);
      setUserInput(''); // 发送后清空输入框
      setSelectedQuery('');
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Select
        placeholder="选择常见问题或输入自定义问题"
        style={{ width: '100%' }}
        value={selectedQuery || undefined}
        onChange={setSelectedQuery}
        allowClear
      >
        {commonQueries.map((query, index) => (
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
          }}
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          loading={loading}
          shape="circle"
          icon={<SendOutlined />}
          size="large"
          style={{ background: '#52c41a', borderColor: '#52c41a', marginBottom: 10, }}
        />
      </div>
    </div>
  );
};

export default ChatBox;
