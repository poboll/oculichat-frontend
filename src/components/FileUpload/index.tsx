import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

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
    <div>
      <Upload customRequest={customRequest} showUploadList={false} accept="image/*">
        <Button icon={<UploadOutlined />} block>
          选择文件
        </Button>
      </Upload>
      {uploading && <Progress percent={progress} status="active" />}
      {previewUrl && (
        <div style={{ marginTop: 10 }}>
          <img src={previewUrl} alt="预览" style={{ maxWidth: '100%', border: '1px solid #ddd', padding: 4 }} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
