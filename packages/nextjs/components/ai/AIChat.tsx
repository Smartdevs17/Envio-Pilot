"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { type AIMessage, processAIMessage } from "~~/services/ai/aiService";

export function AIChat() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm EnvioPilot AI. I can help you query your blockchain data, create DCA orders, or execute trades. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newMessages: AIMessage[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Process with AI
      const response = await processAIMessage(userMessage, address, messages);

      // Add AI response
      setMessages([...newMessages, { role: "assistant", content: response.message }]);

      // Handle action if needed
      if (response.action) {
        // Show action feedback
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `💡 **Action detected:** This would execute a ${response.action?.type} action. Ready to proceed?`,
            },
          ]);
        }, 500);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-[500px] flex flex-col">
      <div className="card-body flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">🤖 AI Agent</h2>
          {!isConnected && (
            <div className="badge badge-warning badge-sm">Connect wallet for personalized responses</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
              </div>
              <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-primary" : ""}`}>{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">🤖</div>
              </div>
              <div className="chat-bubble">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              isConnected
                ? "Ask me about your permissions, trades, or create a DCA order..."
                : "Connect your wallet to get started..."
            }
            className="input input-bordered flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
          </button>
        </div>

        {/* Suggestions */}
        {messages.length === 1 && isConnected && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <button className="btn btn-xs btn-outline" onClick={() => setInput("What are my active permissions?")}>
              My permissions
            </button>
            <button className="btn btn-xs btn-outline" onClick={() => setInput("Show my recent trades")}>
              Recent trades
            </button>
            <button className="btn btn-xs btn-outline" onClick={() => setInput("Create a $50 weekly ETH DCA")}>
              Create DCA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
