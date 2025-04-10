import React, { useState, useEffect } from 'react';
import { Modal, List, Card, Typography, Button, Divider, Empty, Tooltip, Tag, Space, message, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadHistory: (history: any[]) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, onLoadHistory }) => {
  const [historyGroups, setHistoryGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 从本地存储加载历史记录
  useEffect(() => {
    if (visible) {
      loadHistoryData();
    }
  }, [visible]);

  // 加载历史记录数据
  const loadHistoryData = () => {
    setLoading(true);
    try {
      // 从localStorage获取所有历史记录
      const historyData = localStorage.getItem('local_oculi_chat_history');

      if (historyData) {
        const allMessages = JSON.parse(historyData);

        // 按照对话分组，每次用户上传图片开始一个新对话
        const groups: any[] = [];
        let currentGroup: any[] = [];
        let currentDate = '';

        allMessages.forEach((msg: any, index: number) => {
          // 使用日期作为分组依据
          const msgDate = msg.timestamp.split(' ')[0];

          // 如果是新的一天或者是新的图片上传，创建新组
          if (msgDate !== currentDate || (msg.sender === '用户' && (msg.leftEye || msg.rightEye))) {
            if (currentGroup.length > 0) {
              groups.push({
                id: `group-${groups.length}`,
                date: currentDate,
                messages: [...currentGroup],
                hasAnalysis: currentGroup.some(m => m.aiAnalysis),
                timestamp: currentGroup[0].timestamp
              });
            }
            currentGroup = [msg];
            currentDate = msgDate;
          } else {
            currentGroup.push(msg);
          }

          // 处理最后一组
          if (index === allMessages.length - 1 && currentGroup.length > 0) {
            groups.push({
              id: `group-${groups.length}`,
              date: currentDate,
              messages: [...currentGroup],
              hasAnalysis: currentGroup.some(m => m.aiAnalysis),
              timestamp: currentGroup[0].timestamp
            });
          }
        });

        // 按时间倒序排列
        groups.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());
        setHistoryGroups(groups);
      } else {
        setHistoryGroups([]);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载特定历史记录到主界面
  const handleLoadHistory = (group: any) => {
    onLoadHistory(group.messages);
    message.success('历史记录已加载');
    onClose();
  };

  // 删除特定历史记录
  const handleDeleteHistory = (groupId: string) => {
    try {
      const updatedGroups = historyGroups.filter(g => g.id !== groupId);
      setHistoryGroups(updatedGroups);

      // 更新本地存储
      const allMessages = updatedGroups.flatMap(g => g.messages);
      localStorage.setItem('local_oculi_chat_history', JSON.stringify(allMessages));

      message.success('历史记录已删除');
    } catch (error) {
      console.error('删除历史记录失败:', error);
      message.error('删除历史记录失败');
    }
  };

  // 获取诊断结果摘要
  const getDiagnosisSummary = (group: any) => {
    for (const msg of group.messages) {
      if (msg.aiAnalysis?.main_class) {
        const analysis = msg.aiAnalysis;
        return {
          diagnosis: analysis.main_class.label === 'Normal' ? '正常眼底' :
            analysis.main_class.label === 'Diabetes' ? '糖尿病视网膜病变' :
              analysis.main_class.label === 'Glaucoma' ? '青光眼' :
                analysis.main_class.label === 'Cataract' ? '白内障' :
                  analysis.main_class.label === 'AMD' ? '年龄相关性黄斑变性' :
                    analysis.main_class.label === 'Hypertension' ? '高血压性视网膜病变' :
                      analysis.main_class.label === 'Myopia' ? '高度近视' :
                        '其他眼底异常',
          confidence: analysis.main_class.confidence,
          grade: analysis.main_class.grade,
          left_eye: analysis.left_eye.severity,
          right_eye: analysis.right_eye.severity
        };
      }
    }
    return null;
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 10, color: '#315167FF' }} />
          <span>历史诊断记录</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '12px 24px' }}
    >
      {historyGroups.length > 0 ? (
        <List
          dataSource={historyGroups}
          renderItem={(group) => {
            const summary = getDiagnosisSummary(group);
            return (
              <List.Item>
                <Card
                  style={{ width: '100%', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <Text strong style={{ fontSize: 15 }}>
                        {moment(group.timestamp).format('YYYY年MM月DD日 HH:mm:ss')}
                      </Text>
                      {group.hasAnalysis && summary && (
                        <Tag color="#315167FF" style={{ marginLeft: 12 }}>
                          {summary.diagnosis}
                          {summary.grade && ` ${summary.grade}级`}
                        </Tag>
                      )}
                    </div>
                    <Space>
                      <Tooltip title="加载此记录">
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={() => handleLoadHistory(group)}
                          style={{ background: '#315167FF', borderColor: '#315167FF' }}
                        >
                          加载
                        </Button>
                      </Tooltip>
                      <Popconfirm
                        title="确定要删除该记录吗？"
                        onConfirm={() => handleDeleteHistory(group.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    </Space>
                  </div>

                  {group.hasAnalysis && summary && (
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: 6,
                      padding: '10px 12px',
                      marginBottom: 12
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 13 }}>诊断结果:</Text>
                          <div style={{ fontWeight: 'bold', color: '#315167FF' }}>
                            {summary.diagnosis}
                            {summary.grade && ` (${summary.grade}级)`}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            置信度: {(summary.confidence * 100).toFixed(1)}%
                          </div>
                        </div>

                        <Divider type="vertical" style={{ height: 40, margin: '0 4px' }} />

                        <div>
                          <Text type="secondary" style={{ fontSize: 13 }}>左眼状态:</Text>
                          <div style={{
                            fontWeight: 'bold',
                            color: summary.left_eye === 'normal' ? '#52c41a' :
                              summary.left_eye === 'mild' ? '#1890ff' :
                                summary.left_eye === 'moderate' ? '#fa8c16' : '#f5222d'
                          }}>
                            {summary.left_eye === 'normal' ? '正常' :
                              summary.left_eye === 'mild' ? '轻度异常' :
                                summary.left_eye === 'moderate' ? '中度异常' : '重度异常'}
                          </div>
                        </div>

                        <Divider type="vertical" style={{ height: 40, margin: '0 4px' }} />

                        <div>
                          <Text type="secondary" style={{ fontSize: 13 }}>右眼状态:</Text>
                          <div style={{
                            fontWeight: 'bold',
                            color: summary.right_eye === 'normal' ? '#52c41a' :
                              summary.right_eye === 'mild' ? '#1890ff' :
                                summary.right_eye === 'moderate' ? '#fa8c16' : '#f5222d'
                          }}>
                            {summary.right_eye === 'normal' ? '正常' :
                              summary.right_eye === 'mild' ? '轻度异常' :
                                summary.right_eye === 'moderate' ? '中度异常' : '重度异常'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Text type="secondary">
                      {group.messages.length} 条消息
                      {group.hasAnalysis ? "（包含AI分析结果）" : "（无分析结果）"}
                    </Text>
                    <Tooltip title="查看详细内容">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        style={{ color: '#315167FF' }}
                        onClick={() => handleLoadHistory(group)}
                      >
                        查看详情
                      </Button>
                    </Tooltip>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty
          description="暂无历史记录"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '40px 0' }}
        />
      )}
    </Modal>
  );
};

export default HistoryModal;
