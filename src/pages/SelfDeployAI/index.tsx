import React, { useState } from "react";
import { Card, Upload, Button, message, Progress, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;

const SelfDeployAI: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = ({ file, fileList: newFileList }: { file: UploadFile; fileList: UploadFile[] }) => {
    setFileList(newFileList);

    if (file.status === "uploading") {
      setUploading(true);
    }

    if (file.status === "done") {
      message.success(`${file.name} 文件上传成功。`);
      setUploading(false);
    } else if (file.status === "error") {
      message.error(`${file.name} 文件上传失败。`);
      setUploading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件。");
    }
    return isImage;
  };

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "your-upload-endpoint.com"); // 替换为实际的上传接口
    xhr.setRequestHeader("X-Custom-Header", "SomeValue"); // 添加你需要的自定义头部

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        onSuccess?.({}, file);
        setUploading(false);
      } else {
        onError?.(new Error("上传失败"));
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      onError?.(new Error("上传失败"));
      setUploading(false);
    };

    xhr.send(file);
  };

  return (
    <Card hoverable style={{ width: 400, margin: "auto", padding: "20px" }}>
      <Title level={4} style={{ textAlign: "center" }}>
        上传文件
      </Title>
      <Upload
        customRequest={customRequest}
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        showUploadList={{ showPreviewIcon: false }}
        multiple
        accept="image/*"
        maxCount={5}
      >
        <Button icon={<UploadOutlined />} block>
          选择文件
        </Button>
      </Upload>
      {uploading && (
        <div style={{ marginTop: 20 }}>
          <Progress percent={progress} status="active" />
        </div>
      )}
      {fileList.length > 0 && !uploading && (
        <div style={{ marginTop: 20 }}>
          <Title level={5}>已上传文件</Title>
          <ul>
            {fileList.map((file) => (
              <li key={file.uid}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default SelfDeployAI;
