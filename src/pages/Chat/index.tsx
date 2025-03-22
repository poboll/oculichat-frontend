import React, { useState, useEffect } from "react";
import { Card, Input, Button, message, Spin } from "antd";

// 模拟 AI 响应的函数
const getAIResponse = (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse = `AI 回复: ${userMessage}`;
      resolve(mockResponse);
    }, 1000); // 模拟延迟
  });
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: "用户", content: userInput }];
    setMessages(newMessages);
    setUserInput(""); // 清空输入框
    setLoading(true); // 开始加载 AI 响应

    try {
      const aiResponse = await getAIResponse(userInput); // 获取 AI 的响应
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "AI", content: aiResponse },
      ]);
    } catch (error) {
      message.error("获取 AI 响应时发生错误。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始化时显示 AI 的欢迎信息
    setMessages([{ sender: "AI", content: "你好！我能为你做些什么？" }]);
  }, []);

  return (
    <Card hoverable style={{ width: 400, margin: "0 auto", marginTop: 50 }}>
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
        {loading && (
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Spin />
          </div>
        )}
      </div>

      <Input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onPressEnter={handleSend}
        placeholder="请输入消息..."
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" block onClick={handleSend}>
        发送
      </Button>
    </Card>
  );
};

export default Chat;
