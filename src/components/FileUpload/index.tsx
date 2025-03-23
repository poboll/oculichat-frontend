import React, { useState, useEffect } from 'react';
import {Upload, Progress, Card} from 'antd';
import {InboxOutlined} from '@ant-design/icons';


const FileUpload: React.FC<{ onUploadSuccess: (file: File) => void }> = ({ onUploadSuccess }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file } = options;

    setUploading(true);
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
    }, 500); // 每500ms更新进度

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

  return (
    <div style={{ textAlign: 'center' }}>
      <Upload.Dragger
        customRequest={customRequest}
        showUploadList={false}
        accept="image/*,application/pdf,text/plain"
        style={{ padding: '20px 0' }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持单个或批量上传</p>
      </Upload.Dragger>

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status="active" strokeColor={{
            from: '#108ee9',
            to: '#87d068',
          }} />
        </div>
      )}

      {previewUrl && !uploading && (
        <div style={{ marginTop: 16 }}>
          <Card
            hoverable
            cover={<img alt="预览" src={previewUrl} style={{ maxHeight: '200px', objectFit: 'contain' }} />}
            style={{ width: '100%' }}
          >
            <Card.Meta title="文件预览" />
          </Card>
        </div>
      )}
    </div>
  );
};


export default FileUpload;
