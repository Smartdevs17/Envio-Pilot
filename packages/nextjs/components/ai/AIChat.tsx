"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { usePermissions } from "~~/app/erc-7715-permissions/hooks/usePermissions";
import { type AIMessage, processAIMessage } from "~~/services/ai/aiService";
import { parseDCAIntent, prepareDCATransaction } from "~~/services/ai/contractExecutionService";

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

  const { writeContractAsync } = useWriteContract();
  const { grantedPermissions } = usePermissions();
  const [pendingAction, setPendingAction] = useState<{ type: string; data: any } | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim().toLowerCase();
    setInput("");

    // Add user message to chat
    const newMessages: AIMessage[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Check if this is a confirmation for a pending action
      if (pendingAction && (userMessage === "yes" || userMessage === "confirm" || userMessage === "proceed")) {
        setMessages(prev => [...prev, { role: "assistant", content: "🚀 Executing your request..." }]);

        let hash: string | undefined;

        if (pendingAction.type === "dca") {
          const params = parseDCAIntent(messages[messages.length - 1].content);
          if (params && params.amount) {
            const tx = prepareDCATransaction({
              amount: params.amount,
              interval: params.interval || "weekly",
              tokenPair: params.tokenPair || "ETH/USDC",
            });

            // If we have permissions, try to redeem/delegate
            if (grantedPermissions && grantedPermissions.length > 0) {
              // This is a simplified version, ideally we'd use a generic redeem helper
              // For now, we'll use the standard write if redeem logic isn't generic yet
              hash = await writeContractAsync(tx);
            } else {
              hash = await writeContractAsync(tx);
            }
          }
        } else if (pendingAction.type === "trade") {
          // Similar logic for trade...
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: "Execution for manual trades is still being refined. Please use the 'Trade' page for now.",
            },
          ]);
          setIsLoading(false);
          setPendingAction(null);
          return;
        }

        if (hash) {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `✅ Success! Your DCA order has been submitted. Envio will index it shortly.\n\n[View on Etherscan](https://sepolia.etherscan.io/tx/${hash})`,
            },
          ]);
        }
        setPendingAction(null);
        setIsLoading(false);
        return;
      }

      // Process with AI
      const response = await processAIMessage(input.trim(), address, messages);

      // Add AI response
      setMessages([...newMessages, { role: "assistant", content: response.message }]);

      // Handle action if needed
      if (response.action) {
        setPendingAction({ type: response.action.data.intent, data: response.action.data });
        // The AI already asks "Shall I proceed?" based on the system prompt
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.message || "Please try again."}`,
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
