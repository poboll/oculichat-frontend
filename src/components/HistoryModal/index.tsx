import React, { useState, useEffect } from 'react';
import { Modal, List, Card, Typography, Button, Divider, Empty, Tooltip, Tag, Space, message, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined, ClockCircleOutlined, InboxOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;

// Add these constants to match main component
const CHAT_HISTORY_KEY = 'local_oculi_chat_history';
const ARCHIVED_CHAT_HISTORY_KEY = 'local_oculi_archived_chat_history';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadHistory: (history: any[]) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, onLoadHistory }) => {
  const [allHistoryGroups, setAllHistoryGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load history when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadHistoryData();
    }
  }, [visible]);

  // Load both active and archived history data and combine them
  const loadHistoryData = () => {
    setLoading(true);
    try {
      // Load active history
      const activeGroups = loadActiveHistory();

      // Load archived history
      const archivedGroups = loadArchivedHistory();

      // Combine and sort by timestamp (newest first)
      const combined = [...activeGroups, ...archivedGroups]
        .sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());

      setAllHistoryGroups(combined);
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
        // Mark as active
        groups.forEach(g => g.isArchived = false);
        return groups;
      }
      return [];
    } catch (error) {
      console.error('加载活动历史记录失败:', error);
      return [];
    }
  };

  // Load archived chat history
  const loadArchivedHistory = () => {
    try {
      const archivedData = localStorage.getItem(ARCHIVED_CHAT_HISTORY_KEY);

      if (archivedData) {
        const archivedChats = JSON.parse(archivedData);
        // Mark as archived
        archivedChats.forEach(g => g.isArchived = true);
        return archivedChats;
      }
      return [];
    } catch (error) {
      console.error('加载归档历史记录失败:', error);
      return [];
    }
  };

  // Group messages by conversation
  const groupMessagesByConversation = (messages: any[]) => {
    const groups: any[] = [];
    let currentGroup: any[] = [];
    let currentDate = '';

    messages.forEach((msg: any, index: number) => {
      // Use date as grouping basis
      const msgDate = msg.timestamp?.split(' ')[0] || '';

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

    return groups;
  };

  // Load history to main interface
  const handleLoadHistory = (group: any) => {
    onLoadHistory(group.messages);
    setSelectedGroupId(group.id);
    message.success('历史记录已加载');
    // Don't close the modal - allow user to switch between conversations
  };

  // Delete specific history record
  const handleDeleteHistory = (group: any) => {
    try {
      if (group.isArchived) {
        // Delete from archived storage
        const archivedData = localStorage.getItem(ARCHIVED_CHAT_HISTORY_KEY);
        if (archivedData) {
          const archivedGroups = JSON.parse(archivedData).filter((g: any) => g.id !== group.id);
          localStorage.setItem(ARCHIVED_CHAT_HISTORY_KEY, JSON.stringify(archivedGroups));
        }
      } else {
        // Delete from active storage
        const activeData = localStorage.getItem(CHAT_HISTORY_KEY);
        if (activeData) {
          const activeMessages = JSON.parse(activeData);
          const activeGroups = groupMessagesByConversation(activeMessages);
          const updatedGroups = activeGroups.filter(g => g.id !== group.id);
          const updatedMessages = updatedGroups.flatMap(g => g.messages);
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedMessages));
        }
      }

      // Update the combined list
      setAllHistoryGroups(prev => prev.filter(g => g.id !== group.id));
      message.success('历史记录已删除');
    } catch (error) {
      console.error('删除历史记录失败:', error);
      message.error('删除历史记录失败');
    }
  };

  // Toggle between archive and active status
  const handleToggleArchiveStatus = (group: any) => {
    try {
      if (group.isArchived) {
        // Restore from archive
        const archivedData = localStorage.getItem(ARCHIVED_CHAT_HISTORY_KEY);
        if (archivedData) {
          const archivedGroups = JSON.parse(archivedData).filter((g: any) => g.id !== group.id);
          localStorage.setItem(ARCHIVED_CHAT_HISTORY_KEY, JSON.stringify(archivedGroups));
        }

        // Add to active
        const activeData = localStorage.getItem(CHAT_HISTORY_KEY);
        const activeMessages = activeData ? JSON.parse(activeData) : [];
        const updatedMessages = [...activeMessages, ...group.messages];
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedMessages));
      } else {
        // Archive from active
        const activeData = localStorage.getItem(CHAT_HISTORY_KEY);
        if (activeData) {
          const activeMessages = JSON.parse(activeData);
          const activeGroups = groupMessagesByConversation(activeMessages);
          const updatedGroups = activeGroups.filter(g => g.id !== group.id);
          const updatedMessages = updatedGroups.flatMap(g => g.messages);
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedMessages));
        }

        // Add to archive
        const archivedData = localStorage.getItem(ARCHIVED_CHAT_HISTORY_KEY);
        const archivedGroups = archivedData ? JSON.parse(archivedData) : [];
        const groupToArchive = {
          ...group,
          archivedAt: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        localStorage.setItem(ARCHIVED_CHAT_HISTORY_KEY, JSON.stringify([...archivedGroups, groupToArchive]));
      }

      // Update UI
      loadHistoryData();
    } catch (error) {
      console.error('切换归档状态失败:', error);
      message.error('操作失败');
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

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 10, color: '#315167FF' }} />
          <span>历史记录</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '12px 24px' }}
    >
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ marginRight: 12 }}>
          <Tag color="#1890ff">活动</Tag>
          <Tag color="#722ed1">归档</Tag>
        </div>
        <Text type="secondary">选择一个对话即可加载，可随时切换不同对话</Text>
      </div>

      {allHistoryGroups.length > 0 ? (
        <List
          dataSource={allHistoryGroups}
          renderItem={(group) => {
            const summary = getDiagnosisSummary(group);
            const isSelected = selectedGroupId === group.id;

            return (
              <List.Item>
                <Card
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    borderLeft: isSelected ? '4px solid #315167FF' : 'none',
                    background: isSelected ? '#f8fAff' : 'white'
                  }}
                  bodyStyle={{ padding: 16 }}
                  onClick={() => handleLoadHistory(group)}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <Tag color={group.isArchived ? '#722ed1' : '#1890ff'} style={{ marginRight: 8 }}>
                        {group.isArchived ? '归档' : '活动'}
                      </Tag>
                      <Text strong style={{ fontSize: 15 }}>
                        {moment(group.timestamp).format('YYYY年MM月DD日 HH:mm')}
                      </Text>
                      {group.hasAnalysis && summary && (
                        <Tag color="#315167FF" style={{ marginLeft: 12 }}>
                          {summary.diagnosis}
                          {summary.grade && ` ${summary.grade}级`}
                        </Tag>
                      )}
                    </div>
                    <Space>
                      <Tooltip title={group.isArchived ? "恢复到活动记录" : "归档此记录"}>
                        <Button
                          type="text"
                          icon={group.isArchived ? <UndoOutlined /> : <InboxOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleArchiveStatus(group);
                          }}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确定要删除该记录吗？"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteHistory(group);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
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
                      {(group.messages?.length || 0)} 条消息
                      {group.hasAnalysis ? "（包含AI分析结果）" : "（无分析结果）"}
                    </Text>

                    {isSelected && (
                      <Tag color="#315167FF" style={{ marginLeft: 'auto' }}>
                        已加载
                      </Tag>
                    )}
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
