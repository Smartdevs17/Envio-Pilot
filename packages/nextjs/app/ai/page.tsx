"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract } from "wagmi";
import { type AIMessage, processAIMessage } from "~~/services/ai/aiService";
import { parseDCAIntent, prepareDCATransaction } from "~~/services/ai/contractExecutionService";

export default function AIPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<{ type: string; params: any } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your EnvioPilot AI assistant. I can help you query blockchain data, create DCA orders, or execute trades. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

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
      console.error("AI error:", err);
      const errorMessage = err.message?.includes("401")
        ? "🔑 RPC Error: Unauthorized. Your Alchemy API key might be invalid or restricted."
        : "Sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
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

  const suggestions = [
    "What are my active permissions?",
    "Show my recent trades",
    "Create a $50 weekly ETH DCA",
    "What's my total trading volume?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Header */}
      <div className="border-b border-base-300 bg-base-100/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Assistant
              </h1>
            </div>
            {mounted && !isConnected && (
              <div className="badge badge-warning gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-4 h-4 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Connect wallet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="py-8 pt-4 min-h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-6 mb-6 mt-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-xl">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-content shadow-xl"
                      : "bg-base-100 shadow-lg border border-base-300"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content.split("\n\n🔗")[0]}</p>

                  {msg.content.includes("https://sepolia.etherscan.io/tx/") && (
                    <div className="mt-4 pt-4 border-t border-base-300/50">
                      {(() => {
                        const link = msg.content.match(/https:\/\/sepolia\.etherscan\.io\/tx\/0x[a-fA-F0-9]*/)?.[0];
                        console.log("Link matched:", link);
                        return (
                          <a
                            href={link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary w-full gap-2 shadow-md hover:scale-[1.02] transition-transform"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                            View on Sepolia Etherscan
                          </a>
                        );
                      })()}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-neutral flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-xl">👤</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="bg-base-100 rounded-2xl px-6 py-4 shadow-lg border border-base-300">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show only on first message) */}
          {messages.length === 1 && mounted && isConnected && (
            <div className="mb-6">
              <p className="text-sm text-base-content/60 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-base-100 hover:bg-base-200 rounded-full text-sm border border-base-300 transition-all hover:shadow-md hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="sticky bottom-0 pb-4">
            {pendingAction ? (
              <div className="bg-base-100 rounded-2xl shadow-2xl border border-primary/20 p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-primary font-medium">
                    <span className="loading loading-ring loading-md"></span>
                    Ready to execute your {pendingAction.type.toUpperCase()} request
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSend("YES")}
                      disabled={isLoading}
                      className="btn btn-primary flex-1 shadow-xl hover:scale-105 transition-all text-lg font-bold animate-pulse py-4 h-auto"
                    >
                      {isLoading ? "Processing..." : "🚀 Confirm & Execute"}
                    </button>
                    <button
                      onClick={() => {
                        setPendingAction(null);
                        setMessages(prev => [
                          ...prev,
                          { role: "assistant", content: "Action cancelled. How else can I help?" },
                        ]);
                      }}
                      disabled={isLoading}
                      className="btn btn-ghost px-8"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-4">
                <div className="flex gap-4 items-end">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      mounted && isConnected
                        ? "Ask me anything about your DeFi activity..."
                        : "Connect your wallet to get started..."
                    }
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 text-base"
                    style={{ minHeight: "24px" }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="btn btn-primary btn-circle shadow-lg hover:scale-110 transition-transform"
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-center text-base-content/40 mt-2">
              AI can make mistakes. Verify important information on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
