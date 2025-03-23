// ... existing code ...
import React, { useState, useEffect } from 'react';
import { Upload, Progress, Card, message } from 'antd';
import { InboxOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const FileUpload: React.FC<{
  onUploadSuccess: (file: File) => void,
  fileType: string
}> = ({ onUploadSuccess, fileType }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            cover={<img alt="预览" src={previewUrl} style={{ maxHeight: '120px', objectFit: 'contain' }} />}
            style={{ width: '100%' }}
          >
            <Card.Meta title={`${fileType}预览`} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
