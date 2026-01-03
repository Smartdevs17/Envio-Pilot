import {
  formatDCAOrdersForAI,
  formatPermissionsForAI,
  formatTradesForAI,
  getUserDCAOrders,
  getUserPermissions,
  getUserTrades,
} from "./envioQueryService";
import { SYSTEM_PROMPT, openai } from "./openaiClient";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  message: string;
  action?: {
    type: "query" | "execute";
    data?: any;
  };
  error?: string;
}

/**
 * Process user message and generate AI response
 * Handles intent classification and data retrieval from Envio
 */
export async function processAIMessage(
  userMessage: string,
  userAddress?: string,
  conversationHistory: AIMessage[] = [],
): Promise<AIResponse> {
  try {
    // Build context from Envio if user is connected
    let envioContext = "";

    if (userAddress) {
      // Fetch user data from Envio for context
      const [permissions, trades, dcaOrders] = await Promise.all([
        getUserPermissions(userAddress),
        getUserTrades(userAddress, 5),
        getUserDCAOrders(userAddress),
      ]);

      envioContext = `
USER CONTEXT (from Envio blockchain indexer):
Address: ${userAddress}

Active Permissions:
${formatPermissionsForAI(permissions)}

Recent Trades:
${formatTradesForAI(trades)}

DCA Orders:
${formatDCAOrdersForAI(dcaOrders)}

Use this context to provide accurate, personalized responses.
`;
    }

    // Build messages array for OpenAI
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(envioContext ? [{ role: "system", content: envioContext }] : []),
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "I couldn't process that request.";

    // Detect if this requires an action
    const needsExecution = detectActionIntent(userMessage.toLowerCase());

    return {
      message: assistantMessage,
      action: needsExecution
        ? {
            type: "execute",
            data: { intent: needsExecution },
          }
        : undefined,
    };
  } catch (error: any) {
    console.error("AI processing error:", error);

    // Handle specific error cases
    if (error?.error?.code === "insufficient_quota") {
      return {
        message: "AI service is temporarily unavailable. Please try again later.",
        error: "QUOTA_EXCEEDED",
      };
    }

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return {
        message: "AI service is not configured. Please add your OpenAI API key to continue.",
        error: "NO_API_KEY",
      };
    }

    return {
      message: "I encountered an error processing your request. Please try rephrasing.",
      error: error.message,
    };
  }
}

/**
 * Detect if message requires contract execution
 */
function detectActionIntent(message: string): string | null {
  const executionKeywords = {
    dca: ["create dca", "set up dca", "dca order", "buy every"],
    trade: ["buy", "sell", "swap", "trade"],
    permission: ["grant permission", "approve", "allow"],
  };

  for (const [intent, keywords] of Object.entries(executionKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }

  return null;
}
