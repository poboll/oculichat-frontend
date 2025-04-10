import React, { useState, useEffect } from 'react';
import { Modal, List, Card, Typography, Button, Divider, Empty, Tooltip, Tag, Space, message, Popconfirm, Tabs } from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined, ClockCircleOutlined, InboxOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

// Add these constants to match main component
const CHAT_HISTORY_KEY = 'local_oculi_chat_history';
const ARCHIVED_CHAT_HISTORY_KEY = 'local_oculi_archived_chat_history';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadHistory: (history: any[]) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, onLoadHistory }) => {
  const [activeHistoryGroups, setActiveHistoryGroups] = useState<any[]>([]);
  const [archivedHistoryGroups, setArchivedHistoryGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);

  // Load history when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadHistoryData();
    }
  }, [visible]);

  // Load both active and archived history data
  const loadHistoryData = () => {
    setLoading(true);
    try {
      // Load active history
      loadActiveHistory();

      // Load archived history
      loadArchivedHistory();
    } catch (error) {
      console.error('加载历史记录失败:', error);
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  // Load active chat history
  const loadActiveHistory = () => {
    try {
      const historyData = localStorage.getItem(CHAT_HISTORY_KEY);

      if (historyData) {
        const allMessages = JSON.parse(historyData);
        const groups = groupMessagesByConversation(allMessages);
        setActiveHistoryGroups(groups);
      } else {
        setActiveHistoryGroups([]);
      }
    } catch (error) {
      console.error('加载活动历史记录失败:', error);
    }
  };

  // Load archived chat history
  const loadArchivedHistory = () => {
    try {
      const archivedData = localStorage.getItem(ARCHIVED_CHAT_HISTORY_KEY);

      if (archivedData) {
        const archivedChats = JSON.parse(archivedData);
        // Sort by archive time (newest first)
        archivedChats.sort((a: any, b: any) =>
          moment(b.archivedAt).valueOf() - moment(a.archivedAt).valueOf()
        );
        setArchivedHistoryGroups(archivedChats);
      } else {
        setArchivedHistoryGroups([]);
      }
    } catch (error) {
      console.error('加载归档历史记录失败:', error);
    }
  };

  // Group messages by conversation
  const groupMessagesByConversation = (messages: any[]) => {
    const groups: any[] = [];
    let currentGroup: any[] = [];
    let currentDate = '';

    messages.forEach((msg: any, index: number) => {
      // Use date as grouping basis
      const msgDate = msg.timestamp.split(' ')[0];

      // Create new group if new day or new image upload
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

      // Handle last group
      if (index === messages.length - 1 && currentGroup.length > 0) {
        groups.push({
          id: `group-${groups.length}`,
          date: currentDate,
          messages: [...currentGroup],
          hasAnalysis: currentGroup.some(m => m.aiAnalysis),
          timestamp: currentGroup[0].timestamp
        });
      }
    });

    // Sort by time (newest first)
    return groups.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());
  };

  // Load history to main interface
  const handleLoadHistory = (group: any) => {
    onLoadHistory(group.messages);
    message.success('历史记录已加载');
    onClose();
  };

  // Delete specific history record
  const handleDeleteHistory = (groupId: string) => {
    try {
      const updatedGroups = activeHistoryGroups.filter(g => g.id !== groupId);
      setActiveHistoryGroups(updatedGroups);

      // Update localStorage
      const allMessages = updatedGroups.flatMap(g => g.messages);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allMessages));

      message.success('历史记录已删除');
    } catch (error) {
      console.error('删除历史记录失败:', error);
      message.error('删除历史记录失败');
    }
  };

  // Restore archived history
  const handleRestoreArchived = (archivedChat: any) => {
    try {
      // Get current active history
      const activeHistoryData = localStorage.getItem(CHAT_HISTORY_KEY);
      const activeMessages = activeHistoryData ? JSON.parse(activeHistoryData) : [];

      // Add archived messages to active history
      const updatedActiveMessages = [...activeMessages, ...archivedChat.messages];
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedActiveMessages));

      // Remove from archived
      const updatedArchivedChats = archivedHistoryGroups.filter(g => g.id !== archivedChat.id);
      localStorage.setItem(ARCHIVED_CHAT_HISTORY_KEY, JSON.stringify(updatedArchivedChats));

      // Update state
      setArchivedHistoryGroups(updatedArchivedChats);
      loadActiveHistory();

      message.success('归档记录已恢复');
    } catch (error) {
      console.error('恢复归档记录失败:', error);
      message.error('恢复归档记录失败');
    }
  };

  // Permanently delete archived history
  const handleDeleteArchived = (archivedId: string) => {
    try {
      const updatedArchivedChats = archivedHistoryGroups.filter(g => g.id !== archivedId);
      localStorage.setItem(ARCHIVED_CHAT_HISTORY_KEY, JSON.stringify(updatedArchivedChats));
      setArchivedHistoryGroups(updatedArchivedChats);
      message.success('归档记录已永久删除');
    } catch (error) {
      console.error('删除归档记录失败:', error);
      message.error('删除归档记录失败');
    }
  };

  // Get diagnosis summary
  const getDiagnosisSummary = (group: any) => {
    const messages = group.messages || [];
    for (const msg of messages) {
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

  // Render history card
  const renderHistoryCard = (group: any, isArchived: boolean = false) => {
    const summary = getDiagnosisSummary(group);
    return (
      <Card
        style={{ width: '100%', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Text strong style={{ fontSize: 15 }}>
              {isArchived ?
                `归档于: ${moment(group.archivedAt).format('YYYY年MM月DD日 HH:mm:ss')}` :
                moment(group.timestamp).format('YYYY年MM月DD日 HH:mm:ss')}
            </Text>
            {group.hasAnalysis && summary && (
              <Tag color="#315167FF" style={{ marginLeft: 12 }}>
                {summary.diagnosis}
                {summary.grade && ` ${summary.grade}级`}
              </Tag>
            )}
          </div>
          <Space>
            {isArchived ? (
              <>
                <Tooltip title="恢复此记录">
                  <Button
                    type="primary"
                    icon={<UndoOutlined />}
                    onClick={() => handleRestoreArchived(group)}
                    style={{ background: '#315167FF', borderColor: '#315167FF' }}
                  >
                    恢复
                  </Button>
                </Tooltip>
                <Popconfirm
                  title="确定要永久删除该记录吗？此操作不可撤销。"
                  onConfirm={() => handleDeleteArchived(group.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>永久删除</Button>
                </Popconfirm>
              </>
            ) : (
              <>
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
              </>
            )}
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
            {(group.messages?.length || 0)} 条消息
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
    );
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
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'active',
            label: (
              <span>
                <ClockCircleOutlined /> 活动记录
              </span>
            ),
            children: activeHistoryGroups.length > 0 ? (
              <List
                dataSource={activeHistoryGroups}
                renderItem={(group) => (
                  <List.Item>
                    {renderHistoryCard(group)}
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无活动历史记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              />
            )
          },
          {
            key: 'archived',
            label: (
              <span>
                <InboxOutlined /> 归档记录 {archivedHistoryGroups.length > 0 && `(${archivedHistoryGroups.length})`}
              </span>
            ),
            children: archivedHistoryGroups.length > 0 ? (
              <List
                dataSource={archivedHistoryGroups}
                renderItem={(group) => (
                  <List.Item>
                    {renderHistoryCard(group, true)}
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无归档历史记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              />
            )
          }
        ]}
      />
    </Modal>
  );
};

export default HistoryModal;
