"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { usePermissions } from "~~/app/erc-7715-permissions/hooks/usePermissions";
import { type AIMessage, processAIMessage } from "~~/services/ai/aiService";
import { parseDCAIntent, prepareDCATransaction } from "~~/services/ai/contractExecutionService";

export function AIChat() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  usePermissions();
  const [pendingAction, setPendingAction] = useState<{ type: string; params: any } | null>(null);

  const handleSend = async (confirmation?: string) => {
    if (!confirmation && (!input.trim() || isLoading)) return;

    const userMessage = confirmation ? confirmation.toLowerCase() : input.trim().toLowerCase();
    const displayMessage = confirmation || input.trim();

    if (!confirmation) setInput("");

    // Add user message to chat
    const newMessages: AIMessage[] = [...messages, { role: "user", content: displayMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Check if this is a confirmation for a pending action
      const isConfirmed = ["yes", "confirm", "proceed", "yep", "sure", "agree", "do it", "ok", "alright"].includes(
        userMessage,
      );

      console.log("Chat Debug:", { userMessage, isConfirmed, hasPendingAction: !!pendingAction });

      if (pendingAction && isConfirmed) {
        setMessages(prev => [...prev, { role: "assistant", content: "🚀 Executing your request..." }]);

        let hash: string | undefined;

        if (pendingAction.type === "dca" && pendingAction.params) {
          try {
            const tx = prepareDCATransaction({
              amount: pendingAction.params.amount,
              interval: pendingAction.params.interval || "daily",
              tokenPair: pendingAction.params.tokenPair || "ETH/USDC",
            });
            hash = await writeContractAsync(tx);
          } catch (execErr: any) {
            console.error("Execution error:", execErr);
            setMessages(prev => [
              ...prev,
              {
                role: "assistant",
                content: `❌ Execution failed: ${execErr.shortMessage || execErr.message || "Unknown error"}. Please check your connection and wallet balance.`,
              },
            ]);
            setPendingAction(null);
            setIsLoading(false);
            return;
          }
        } else if (pendingAction.type === "trade") {
          // ... (Trade logic if needed)
        }

        if (hash) {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `✅ Success! Your DCA order has been submitted. Envio will index it shortly.\n\n🔗 [View on Sepolia Etherscan](https://sepolia.etherscan.io/tx/${hash})`,
            },
          ]);
        }
        setPendingAction(null);
        setIsLoading(false);
        return;
      }

      // Process with AI
      const response = await processAIMessage(displayMessage, address, messages);

      // Add AI response
      setMessages([...newMessages, { role: "assistant", content: response.message }]);

      // Handle action if needed
      if (response.action) {
        const intent = response.action.data.intent;
        let params = null;

        if (intent === "dca") {
          params = parseDCAIntent(displayMessage);
        }

        setPendingAction({ type: intent, params });
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage = err.message?.includes("401")
        ? "🔑 RPC Error: Unauthorized. Your Alchemy API key might be invalid or restricted."
        : err.shortMessage || err.message || "Please try again.";

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
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
          {mounted && !isConnected && (
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

        {/* Input & Actions */}
        <div className="flex flex-col gap-2">
          {pendingAction ? (
            <div className="flex flex-col gap-2 p-3 bg-base-200 rounded-lg border border-primary/20">
              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                <span className="loading loading-ring loading-xs"></span>
                Waiting for confirmation...
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-primary flex-1 shadow-lg border-2 border-white/20 animate-pulse"
                  onClick={() => handleSend("YES")}
                  disabled={isLoading}
                >
                  {isLoading ? "Executing..." : "✅ Proceed & Execute"}
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setPendingAction(null);
                    setMessages(prev => [
                      ...prev,
                      { role: "assistant", content: "Action cancelled. How else can I help?" },
                    ]);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  mounted && isConnected
                    ? "Ask me about your permissions, trades, or create a DCA order..."
                    : "Connect your wallet to get started..."
                }
                className="input input-bordered flex-1"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button className="btn btn-primary" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
              </button>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {!pendingAction && messages.length === 1 && mounted && isConnected && (
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
