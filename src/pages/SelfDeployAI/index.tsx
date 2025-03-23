import React, { useState, useEffect } from "react";
import { Card, Input, Button, message, Spin, Upload, Progress, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;

// Simulate AI Response
const getAIResponse = async (file: File, query: string): Promise<string> => {
  // Here, you can replace this with your own AI logic (e.g., fetch to your own API)
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = `AI response for file: ${file.name}, Query: ${query}`;
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

    // Add the user's message to the chat
    setMessages((prev) => [...prev, { sender: "用户", content: userInput }]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await getAIResponse(fileList[0].originFileObj as File, userInput); // Replace file with uploaded file
      setMessages((prev) => [...prev, { sender: "AI", content: response }]);
    } catch (error) {
      message.error("Error while fetching AI response.");
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
      message.success(`${file.name} file uploaded successfully.`);
      setUploading(false);
    } else if (file.status === "error") {
      message.error(`${file.name} file upload failed.`);
      setUploading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed.");
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
        onError?.(new Error("Upload failed"));
        setUploading(false);
      }
    };
    xhr.onerror = () => {
      onError?.(new Error("Upload failed"));
      setUploading(false);
    };
    xhr.send(file);
  };

  useEffect(() => {
    setMessages([{ sender: "AI", content: "Hello! How can I assist you today?" }]);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* Left Panel for File Upload */}
      <Card hoverable style={{ width: 400, padding: "20px", marginRight: "20px" }}>
        <Title level={4}>Upload Files</Title>
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
            Choose File
          </Button>
        </Upload>
        {uploading && (
          <div style={{ marginTop: 20 }}>
            <Progress percent={progress} status="active" />
          </div>
        )}
      </Card>

      {/* Right Panel for Chat with AI */}
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
          placeholder="Enter message..."
          style={{ marginBottom: 10 }}
        />
        <Button type="primary" block onClick={handleSendMessage}>
          Send
        </Button>
      </Card>
    </div>
  );
};

export default SelfDeployAIPage;
