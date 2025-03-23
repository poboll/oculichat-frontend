import React, { useState } from 'react';
import { Upload, Button, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FileUpload: React.FC<{ onUploadSuccess: (file: File) => void }> = ({ onUploadSuccess }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'your-upload-endpoint.com');
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.total) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        onSuccess?.({}, file);
        onUploadSuccess(file as File);
      } else {
        onError?.(new Error('上传失败'));
      }
    };
    xhr.onerror = () => {
      onError?.(new Error('上传失败'));
    };
    xhr.send(file);
  };

  return (
    <div>
      <Upload customRequest={customRequest} showUploadList={false} accept="image/*">
        <Button icon={<UploadOutlined />} block>选择文件</Button>
      </Upload>
      {uploading && <Progress percent={progress} status="active" />}
    </div>
  );
};

export default FileUpload;
