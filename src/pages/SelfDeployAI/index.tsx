import React, { useState, useEffect } from "react";
import { Card, Input, Button, message, Spin, Upload, Progress, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;

// 模拟AI响应
const getAIResponse = async (file: File, query: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = `文件: ${file.name}，查询: ${query} 的AI响应。`;
      resolve(response);
    }, 1000);
  });
};

const SelfDeployAIPage: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setMessages((prev) => [...prev, { sender: "用户", content: userInput }]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await getAIResponse(fileList[0].originFileObj as File, userInput);
      setMessages((prev) => [...prev, { sender: "AI", content: response }]);
    } catch (error) {
      message.error("获取AI响应时出错。");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ file, fileList: newFileList }: { file: UploadFile; fileList: UploadFile[] }) => {
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
      message.error("只允许上传图片文件。");
    }
    return isImage;
  };

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "your-upload-endpoint.com");
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.total) {
        setProgress(Math.round((event.loaded / event.total) * 100));
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

  useEffect(() => {
    setMessages([{ sender: "AI", content: "你好！今天我能为你做些什么？" }]);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Card hoverable style={{ width: 400, padding: "20px", marginRight: "20px" }}>
        <Title level={4}>上传文件</Title>
        <Upload
          customRequest={customRequest}
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={beforeUpload}
          showUploadList={{ showPreviewIcon: false }}
          multiple={false}
          accept="image/*"
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
      </Card>

      <Card hoverable style={{ flex: 1, width: 600, padding: "20px" }}>
        <div style={{ height: "300px", overflowY: "auto", marginBottom: 16 }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "用户" ? "right" : "left",
                marginBottom: 10,
                color: msg.sender === "用户" ? "#007bff" : "#333",
              }}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
          {loading && <Spin style={{ display: "block", margin: "auto" }} />}
        </div>

        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="输入消息..."
          style={{ marginBottom: 10 }}
        />
        <Button type="primary" block onClick={handleSendMessage}>
          发送
        </Button>
      </Card>
    </div>
  );
};

export default SelfDeployAIPage;
