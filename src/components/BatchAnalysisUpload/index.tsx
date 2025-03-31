// src/components/BatchAnalysisUpload/index.tsx
import React, { useState, useRef } from 'react';
import {
  Upload, Button, Table, Modal, Progress, Typography,
  Space, Badge, message, Tooltip, Card, Tag, Spin
} from 'antd';
import {
  UploadOutlined, CheckCircleOutlined,
  CloseCircleOutlined, LoadingOutlined, InfoCircleOutlined,
  DownloadOutlined, EyeOutlined, FileExcelOutlined, HistoryOutlined
} from '@ant-design/icons';

import * as XLSX from 'xlsx';

import moment from 'moment';

const { Text, Title } = Typography;

interface BatchTask {
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  totalFiles: number;
  processedFiles: number;
  startTime: string;
  endTime?: string;
  results?: any[];
  error?: string;
}

interface BatchAnalysisUploadProps {
  onBatchComplete?: (results: any[]) => void;
}

function ExcelOutlined(props: { style: { color: string } }) {
  return null;
}
// 定义主题色
const THEME_COLORS = {
  primary: '#4996C3',
  primaryLight: '#EBF5FB',
  secondaryLight: '#F0F7FF',
  success: '#52c41a',
  successLight: '#f6ffed',
  error: '#ff4d4f',
  errorLight: '#fff2f0',
  textPrimary: '#315167',
  borderRadius: '6px',
};
const BatchAnalysisUpload: React.FC<BatchAnalysisUploadProps> = ({ onBatchComplete }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [excelParseError, setExcelParseError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<BatchTask | null>(null);
  const [taskHistory, setTaskHistory] = useState<BatchTask[]>([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedTaskResults, setSelectedTaskResults] = useState<any[]>([]);

  const uploadRef = useRef<any>();

  // Excel解析函数
  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          // 验证数据格式
          if (json.length === 0) {
            reject(new Error('Excel文件不包含数据'));
            return;
          }

          // 检查必要字段
          const firstRow = json[0] as any;
          const hasPatientId = 'patientId' in firstRow || 'patient_id' in firstRow;
          const hasImagePath =
            'leftEyePath' in firstRow ||
            'rightEyePath' in firstRow ||
            'left_eye_path' in firstRow ||
            'right_eye_path' in firstRow;

          if (!hasPatientId || !hasImagePath) {
            reject(new Error('Excel缺少必要字段：患者ID及左右眼图像路径'));
            return;
          }

          resolve(json);
        } catch (error) {
          reject(new Error('Excel解析失败，请检查文件格式'));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取错误'));
      };

      reader.readAsBinaryString(file);
    });
  };

  // 文件上传前检查
  const beforeUpload = async (file: File) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      message.error('只能上传Excel文件!');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件大小不能超过10MB!');
      return Upload.LIST_IGNORE;
    }

    try {
      // 预览Excel数据
      const data = await parseExcel(file);
      setPreviewData(data.slice(0, 5)); // 仅展示前5条
      setExcelParseError(null);
      setPreviewVisible(true);
      return true;
    } catch (error: any) {
      setExcelParseError(error.message);
      setPreviewVisible(true);
      return Upload.LIST_IGNORE;
    }
  };

  // 提交批量任务
  const submitBatchTask = async () => {
    if (fileList.length === 0) {
      message.warning('请先上传Excel文件');
      return;
    }

    setUploading(true);

    try {
      const file = fileList[0].originFileObj;
      const data = await parseExcel(file);

      // 创建新任务
      const taskId = `task_${Date.now()}`;
      const newTask: BatchTask = {
        id: taskId,
        status: 'pending',
        progress: 0,
        totalFiles: data.length,
        processedFiles: 0,
        startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      };

      setCurrentTask(newTask);
      setTaskHistory((prev) => [newTask, ...prev]);

      // 模拟任务处理过程
      await processBatchTask(newTask, data);
    } catch (error: any) {
      message.error(`批量任务提交失败: ${error.message}`);
    } finally {
      setUploading(false);
      setFileList([]);
    }
  };

  // 模拟批量处理任务
  const processBatchTask = async (task: BatchTask, data: any[]) => {
    // 更新任务状态为处理中
    const updatedTask = { ...task, status: 'processing' as const };
    setCurrentTask(updatedTask);
    updateTaskInHistory(updatedTask);

    const results: any[] = [];
    const totalItems = data.length;

    try {
      // 模拟API处理每个项目
      for (let i = 0; i < totalItems; i++) {
        const item = data[i];

        // 模拟进度更新
        const progress = Math.round(((i + 1) / totalItems) * 100);
        const progressTask = {
          ...updatedTask,
          progress,
          processedFiles: i + 1,
        };

        setCurrentTask(progressTask);
        updateTaskInHistory(progressTask);

        // 模拟处理单个项目
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 800));

        // 模拟分析结果
        const result = {
          patientId: item.patientId || item.patient_id,
          status: Math.random() > 0.15 ? 'success' : 'error',
          leftEye: {
            severity: ['normal', 'mild', 'moderate', 'severe'][Math.floor(Math.random() * 4)],
            confidence: (0.7 + Math.random() * 0.28).toFixed(2),
          },
          rightEye: {
            severity: ['normal', 'mild', 'moderate', 'severe'][Math.floor(Math.random() * 4)],
            confidence: (0.7 + Math.random() * 0.28).toFixed(2),
          },
          main_class: {
            label: ['Normal', 'Diabetes', 'Glaucoma', 'AMD'][Math.floor(Math.random() * 4)],
            confidence: (0.7 + Math.random() * 0.28).toFixed(2),
            grade: Math.floor(Math.random() * 4),
          },
          processed_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        };

        results.push(result);
      }

      // 完成任务
      const completedTask = {
        ...updatedTask,
        status: 'success' as const,
        progress: 100,
        processedFiles: totalItems,
        endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        results,
      };

      setCurrentTask(completedTask);
      updateTaskInHistory(completedTask);

      if (onBatchComplete) {
        onBatchComplete(results);
      }

      message.success(`批量分析完成，共处理${totalItems}个眼底图像`);
    } catch (error: any) {
      // 任务失败
      const failedTask = {
        ...updatedTask,
        status: 'error' as const,
        endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        error: error.message,
      };

      setCurrentTask(failedTask);
      updateTaskInHistory(failedTask);
      message.error(`批量分析失败: ${error.message}`);
    }
  };

  // 更新历史任务列表中的任务状态
  const updateTaskInHistory = (updatedTask: BatchTask) => {
    setTaskHistory((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  // 显示任务结果
  const showTaskResults = (task: BatchTask) => {
    if (task.results && task.results.length > 0) {
      setSelectedTaskResults(task.results);
      setResultModalVisible(true);
    } else {
      message.warning('该任务没有可用的结果');
    }
  };

  // 导出任务结果为Excel
  const exportResultsToExcel = (results: any[]) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        results.map((r) => ({
          患者ID: r.patientId,
          分析状态: r.status === 'success' ? '成功' : '失败',
          主要诊断: r.main_class.label,
          诊断置信度: r.main_class.confidence,
          分级: r.main_class.grade,
          左眼状态: r.leftEye.severity,
          左眼置信度: r.leftEye.confidence,
          右眼状态: r.rightEye.severity,
          右眼置信度: r.rightEye.confidence,
          处理时间: r.processed_time,
        })),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '眼底分析结果');

      // 生成文件并下载
      XLSX.writeFile(workbook, `眼底批量分析结果_${moment().format('YYYYMMDDHHmmss')}.xlsx`);

      message.success('分析结果导出成功');
    } catch (error) {
      message.error('导出结果失败');
      console.error(error);
    }
  };

  // 任务历史表格列
  const historyColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Text ellipsis style={{ width: 100 }}>
          {text.substring(5)}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'pending') return <Badge status="warning" text="等待中" />;
        if (status === 'processing') return <Badge status="processing" text="处理中" />;
        if (status === 'success') return <Badge status="success" text="已完成" />;
        if (status === 'error') return <Badge status="error" text="失败" />;
        return null;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: BatchTask) => (
        <div style={{ minWidth: 120 }}>
          <Progress
            percent={progress}
            size="small"
            status={record.status === 'error' ? 'exception' : undefined}
          />
        </div>
      ),
    },
    {
      title: '文件数',
      key: 'files',
      render: (record: BatchTask) => (
        <Text>
          {record.processedFiles} / {record.totalFiles}
        </Text>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: BatchTask) => (
        <Space>
          {record.status === 'success' && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showTaskResults(record)}
            >
              查看结果
            </Button>
          )}
          {record.error && (
            <Tooltip title={record.error}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 结果预览表格列
  const resultColumns = [
    {
      title: '患者ID',
      dataIndex: 'patientId',
      key: 'patientId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'success') return <Badge status="success" text="成功" />;
        return <Badge status="error" text="失败" />;
      },
    },
    {
      title: '主要诊断',
      key: 'diagnosis',
      render: (record: any) => (
        <span>
          {record.main_class.label}
          {record.main_class.grade !== undefined && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.main_class.grade}级
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: '左眼',
      key: 'leftEye',
      render: (record: any) => (
        <span>
          {record.leftEye.severity === 'normal'
            ? '正常'
            : record.leftEye.severity === 'mild'
            ? '轻度'
            : record.leftEye.severity === 'moderate'
            ? '中度'
            : '重度'}
          <Text type="secondary" style={{ marginLeft: 4 }}>
            ({(record.leftEye.confidence * 100).toFixed(0)}%)
          </Text>
        </span>
      ),
    },
    {
      title: '右眼',
      key: 'rightEye',
      render: (record: any) => (
        <span>
          {record.rightEye.severity === 'normal'
            ? '正常'
            : record.rightEye.severity === 'mild'
            ? '轻度'
            : record.rightEye.severity === 'moderate'
            ? '中度'
            : '重度'}
          <Text type="secondary" style={{ marginLeft: 4 }}>
            ({(record.rightEye.confidence * 100).toFixed(0)}%)
          </Text>
        </span>
      ),
    },
    {
      title: '处理时间',
      dataIndex: 'processed_time',
      key: 'processed_time',
    },
  ];

  return (
    <div className="batch-analysis-container">
      <Card
        title={
          <Space>
            <ExcelOutlined style={{ color: THEME_COLORS.primary }} />
            <span style={{ color: THEME_COLORS.textPrimary }}>批量眼底分析</span>
          </Space>
        }
        style={{
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(73, 150, 195, 0.1)',
          borderRadius: THEME_COLORS.borderRadius,
          border: `1px solid ${THEME_COLORS.primaryLight}`,
        }}
        bodyStyle={{ padding: '16px 12px' }}
        size="small"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ fontSize: '13px', flex: 1 }}>上传Excel文件进行批量分析</Text>
            <Tooltip title="Excel文件需包含以下字段：patientId(患者ID)、leftEyePath(左眼图片路径)、rightEyePath(右眼图片路径)">
              <InfoCircleOutlined style={{ color: THEME_COLORS.primary }} />
            </Tooltip>
          </div>

          <div className="upload-actions" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <Upload
              ref={uploadRef}
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              accept=".xlsx,.xls"
              style={{ marginRight: 8 }}
            >
              <Button
                icon={<UploadOutlined />}
                size="middle"
                style={{
                  borderColor: THEME_COLORS.primary,
                  color: THEME_COLORS.primary,
                }}
              >
                选择文件
              </Button>
            </Upload>

            <Button
              type="primary"
              onClick={submitBatchTask}
              loading={uploading}
              disabled={fileList.length === 0}
              style={{
                background: THEME_COLORS.primary,
                borderColor: THEME_COLORS.primary,
              }}
              icon={<FileExcelOutlined />}
              size="middle"
            >
              {uploading ? '处理中' : '开始分析'}
            </Button>

            <Button
              onClick={() => setTaskModalVisible(true)}
              icon={<HistoryOutlined />}
              size="middle"
              style={{
                color: THEME_COLORS.textPrimary
              }}
            >
              历史
            </Button>
          </div>

          {currentTask && currentTask.status === 'processing' && (
            <Card size="small" style={{
              background: THEME_COLORS.secondaryLight,
              borderRadius: THEME_COLORS.borderRadius,
              border: `1px solid ${THEME_COLORS.primaryLight}`,
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LoadingOutlined style={{ fontSize: 20, color: THEME_COLORS.primary }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    marginBottom: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px'
                  }}>
                    <Text strong style={{ color: THEME_COLORS.textPrimary }}>处理中</Text>
                    <Text type="secondary">
                      {currentTask.processedFiles} / {currentTask.totalFiles}
                    </Text>
                  </div>
                  <Progress
                    percent={currentTask.progress}
                    status="active"
                    size="small"
                    strokeColor={THEME_COLORS.primary}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              </div>
            </Card>
          )}

          {currentTask && currentTask.status === 'success' && (
            <Card size="small" style={{
              background: THEME_COLORS.successLight,
              borderRadius: THEME_COLORS.borderRadius,
              border: '1px solid #b7eb8f',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircleOutlined style={{ fontSize: 20, color: THEME_COLORS.success }} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: '13px' }}>批量分析已完成</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    共 {currentTask.totalFiles} 项，用时
                    {moment(currentTask.endTime).diff(moment(currentTask.startTime), 'seconds')} 秒
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => showTaskResults(currentTask)}
                    style={{
                      background: THEME_COLORS.primary,
                      borderColor: THEME_COLORS.primary,
                      padding: '0 8px',
                      height: '24px'
                    }}
                  >
                    查看
                  </Button>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      if (currentTask.results) {
                        exportResultsToExcel(currentTask.results);
                      }
                    }}
                    style={{
                      padding: '0 8px',
                      height: '24px'
                    }}
                  >
                    导出
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {currentTask && currentTask.status === 'error' && (
            <Card size="small" style={{
              background: THEME_COLORS.errorLight,
              borderRadius: THEME_COLORS.borderRadius,
              border: '1px solid #ffccc7',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CloseCircleOutlined style={{ fontSize: 20, color: THEME_COLORS.error }} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong type="danger" style={{ fontSize: '13px' }}>
                      批量分析失败
                    </Text>
                  </div>
                  <Text type="danger" style={{ fontSize: '12px' }}>
                    {currentTask.error || '处理过程中发生错误'}
                  </Text>
                </div>
                <Button
                  size="small"
                  danger
                  onClick={() => setCurrentTask(null)}
                  style={{
                    padding: '0 8px',
                    height: '24px'
                  }}
                >
                  关闭
                </Button>
              </div>
            </Card>
          )}
        </Space>
      </Card>

      {/* Excel预览弹窗 */}
      <Modal
        title={
          <div style={{ color: THEME_COLORS.textPrimary }}>
            <FileExcelOutlined style={{ marginRight: 8, color: THEME_COLORS.primary }} />
            Excel文件预览
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={
          excelParseError
            ? [
              <Button key="close" onClick={() => setPreviewVisible(false)}>
                关闭
              </Button>,
            ]
            : [
              <Button
                key="cancel"
                onClick={() => {
                  setPreviewVisible(false);
                  setFileList([]);
                }}
              >
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                style={{ background: THEME_COLORS.primary, borderColor: THEME_COLORS.primary }}
                onClick={() => {
                  setPreviewVisible(false);
                  submitBatchTask();
                }}
              >
                确认并开始分析
              </Button>,
            ]

        }
        width={800}
        bodyStyle={{ padding: '16px 24px' }}
        style={{ top: 20 }}
      >
        {excelParseError ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
            <Title level={4} type="danger">
              Excel解析错误
            </Title>
            <Text type="danger">{excelParseError}</Text>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text>
                以下是Excel文件的前5条数据预览，共 {previewData.length}{' '}
                条记录。确认无误后点击"确认并开始分析"。
              </Text>
            </div>
            <Table
              dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
              columns={Object.keys(previewData[0] || {}).map((key) => ({
                title: key,
                dataIndex: key,
                key: key,
                ellipsis: true,
              }))}
              size="small"
              pagination={false}
              scroll={{ x: 800 }}
            />
          </>
        )}
      </Modal>

      {/* 任务历史弹窗 */}
      <Modal
        title={
          <div style={{ color: THEME_COLORS.textPrimary }}>
            <HistoryOutlined style={{ marginRight: 8, color: THEME_COLORS.primary }} />
            批量分析任务历史
          </div>
        }
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTaskModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <Table
          dataSource={taskHistory.map((task) => ({ ...task, key: task.id }))}
          columns={historyColumns}
          size="small"
          pagination={{ pageSize: 5 }}
          style={{
            '--ant-primary-color': THEME_COLORS.primary,
          } as React.CSSProperties}
        />
      </Modal>

      {/* 结果预览弹窗 */}
      <Modal
        title={
          <div style={{ color: THEME_COLORS.textPrimary }}>
            <EyeOutlined style={{ marginRight: 8, color: THEME_COLORS.primary }} />
            批量分析结果
          </div>
        }
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => exportResultsToExcel(selectedTaskResults)}
            style={{ color: THEME_COLORS.primary }}
          >
            导出Excel
          </Button>,
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <Table
          dataSource={selectedTaskResults.map((item, index) => ({ ...item, key: index }))}
          columns={resultColumns}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
          style={{
            '--ant-primary-color': THEME_COLORS.primary,
          } as React.CSSProperties}
        />
      </Modal>

      {/* 添加全局样式 */}
      <style jsx global>{`
        .batch-analysis-container .ant-btn {
          transition: all 0.3s;
        }
        .batch-analysis-container .ant-card-head {
          min-height: 40px;
          padding: 0 12px;
          background: ${THEME_COLORS.primaryLight};
        }
        .batch-analysis-container .ant-card-head-title {
          padding: 10px 0;
        }
        .batch-analysis-container .ant-table-thead > tr > th {
          background: ${THEME_COLORS.primaryLight};
          color: ${THEME_COLORS.textPrimary};
        }
        .batch-analysis-container .ant-progress-bg {
          background-color: ${THEME_COLORS.primary};
        }
      `}</style>
    </div>
  );
};

export default BatchAnalysisUpload;
