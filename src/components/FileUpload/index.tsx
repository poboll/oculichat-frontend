// ... existing code ...
import React, { useState, useEffect } from 'react';
import {Upload, Progress, Card, message, Image, Typography, Space, Tag, Descriptions, Tooltip, Spin, Modal} from 'antd';
import { InboxOutlined, EyeOutlined, EyeInvisibleOutlined, FileImageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatBytes } from '@/utils/fileUtils'; // 假设有这个工具函数，如果没有我会在下面提供

const { Text, Title } = Typography;

const FileUpload: React.FC<{
  onUploadSuccess: (file: File) => void,
  fileType: string
}> = ({ onUploadSuccess, fileType }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null>(null);

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file } = options;

    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('请上传图片文件');
      onError?.(new Error('文件类型错误'));
      return;
    }

    setUploading(true);
    // 保存文件信息以供展示
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    let uploadedProgress = 0;
    const uploadInterval = setInterval(() => {
      if (uploadedProgress < 100) {
        uploadedProgress += 10;
        setProgress(uploadedProgress);
      } else {
        clearInterval(uploadInterval);
        onSuccess?.({}, file);
        const url = URL.createObjectURL(file as File);
        setPreviewUrl(url);
        onUploadSuccess(file as File); // 模拟上传成功
        setUploading(false);
      }
    }, 200); // 每200ms更新进度

    // 模拟上传失败情况
    setTimeout(() => {
      if (uploadedProgress < 100) {
        clearInterval(uploadInterval);
        onError?.(new Error('上传失败'));
        setUploading(false);
      }
    }, 6000); // 6秒后模拟失败
  };

  // 组件卸载时清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 格式化日期显示
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 如果没有formatBytes工具函数，可以使用此函数
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Upload.Dragger
        customRequest={customRequest}
        showUploadList={false}
        accept="image/*"
        style={{ padding: '10px 0' }}
      >
        <p className="ant-upload-drag-icon">
          {fileType === "左眼照片" ?
            <EyeOutlined style={{ fontSize: 36, color: '#52c41a' }} /> :
            <EyeInvisibleOutlined style={{ fontSize: 36, color: '#52c41a' }} />
          }
        </p>
        <p className="ant-upload-text">点击或拖拽{fileType}到此区域上传</p>
        <p className="ant-upload-hint">支持JPG、PNG格式</p>
      </Upload.Dragger>

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status="active" strokeColor={{
            from: '#52c41a',
            to: '#87d068',
          }} />
        </div>
      )}

      {previewUrl && !uploading && (
        <div style={{ marginTop: 16 }}>
          <Card
            hoverable
            style={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: '0 0 12px 0' }}>
                <Space>
                  <FileImageOutlined style={{ color: '#52c41a' }} />
                  {`${fileType}预览`}
                  {fileInfo?.type.includes('jpeg') && <Tag color="blue">JPG</Tag>}
                  {fileInfo?.type.includes('png') && <Tag color="green">PNG</Tag>}
                </Space>
              </Title>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewUrl}
                  alt={`${fileType}预览`}
                  style={{
                    maxHeight: '160px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    border: '1px solid #f0f0f0'
                  }}
                  placeholder={
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '160px',
                      background: '#f5f5f5'
                    }}>
                      <Spin />
                    </div>
                  }
                  preview={{
                    mask: <div><EyeOutlined /> 查看大图</div>,
                    maskClassName: 'custom-mask'
                  }}
                />
              </div>

              {fileInfo && (
                <Tooltip title="查看详细信息">
                  <InfoCircleOutlined
                    style={{
                      color: '#1890ff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      margin: '12px 0 0 0'
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // 防止触发Card的点击事件
                      Modal.info({
                        title: '图片详细信息',
                        content: (
                          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
                            <Descriptions.Item label="文件名">{fileInfo.name}</Descriptions.Item>
                            <Descriptions.Item label="文件大小">{formatFileSize(fileInfo.size)}</Descriptions.Item>
                            <Descriptions.Item label="文件类型">{fileInfo.type}</Descriptions.Item>
                            <Descriptions.Item label="上传时间">{formatDate(new Date().getTime())}</Descriptions.Item>
                            <Descriptions.Item label="最后修改时间">{formatDate(fileInfo.lastModified)}</Descriptions.Item>
                          </Descriptions>
                        ),
                        okText: '关闭',
                        width: 500
                      });
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
// ... existing code ...
