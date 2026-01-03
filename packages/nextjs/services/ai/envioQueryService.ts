import { gql } from "graphql-request";
import { envioClient } from "~~/lib/envio/client";

/**
 * Envio Query Service for AI Agent
 * Provides data access methods for AI to query blockchain indexed data
 */

export interface UserPermissions {
  id: string;
  user: string;
  permission: string;
  amount: string;
  timestamp: string;
}

export interface UserTrade {
  id: string;
  user: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
}

export interface DCAOrder {
  id: string;
  orderId: string;
  user: string;
  tokenPair: string;
  amountPerExecution: string;
  intervalSeconds: string;
  totalExecutions: string;
  timestamp: string;
}

/**
 * Get user's active permissions from Envio
 */
export async function getUserPermissions(userAddress: string): Promise<UserPermissions[]> {
  const query = gql`
    query GetUserPermissions($user: String!) {
      EnvioPilot_PermissionGranted(where: { user: { _ilike: $user } }, order_by: { timestamp: desc }, limit: 10) {
        id
        user
        permission
        amount
        timestamp
      }
    }
  `;

  try {
    const data = await envioClient.request<{ EnvioPilot_PermissionGranted: UserPermissions[] }>(query, {
      user: userAddress,
    });
    return data.EnvioPilot_PermissionGranted || [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
}

/**
 * Get user's trade history from Envio
 */
export async function getUserTrades(userAddress: string, limit = 10): Promise<UserTrade[]> {
  const query = gql`
    query GetUserTrades($user: String!) {
      EnvioPilot_TradeExecuted(
        where: { user: { _ilike: $user } }
        order_by: { timestamp: desc }
        limit: ${limit}
      ) {
        id
        user
        fromAmount
        toAmount
        timestamp
      }
    }
  `;

  try {
    const data = await envioClient.request<{ EnvioPilot_TradeExecuted: UserTrade[] }>(query, {
      user: userAddress,
    });
    return data.EnvioPilot_TradeExecuted || [];
  } catch (error) {
    console.error("Error fetching user trades:", error);
    return [];
  }
}

/**
 * Get user's DCA orders from Envio
 */
export async function getUserDCAOrders(userAddress: string): Promise<DCAOrder[]> {
  const query = gql`
    query GetDCAOrders($user: String!) {
      EnvioPilot_DCAOrderCreated(where: { user: { _ilike: $user } }, order_by: { timestamp: desc }) {
        id
        orderId
        user
        tokenPair
        amountPerExecution
        intervalSeconds
        totalExecutions
        timestamp
      }
    }
  `;

  try {
    const data = await envioClient.request<{ EnvioPilot_DCAOrderCreated: DCAOrder[] }>(query, {
      user: userAddress,
    });
    return data.EnvioPilot_DCAOrderCreated || [];
  } catch (error) {
    console.error("Error fetching DCA orders:", error);
    return [];
  }
}

/**
 * Get total stats across the platform from Envio
 */
export async function getPlatformStats() {
  const query = gql`
    query GetPlatformStats {
      EnvioPilot_PermissionGranted_aggregate {
        aggregate {
          count
        }
      }
      EnvioPilot_TradeExecuted_aggregate {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const data = await envioClient.request<{
      EnvioPilot_PermissionGranted_aggregate: { aggregate: { count: number } };
      EnvioPilot_TradeExecuted_aggregate: { aggregate: { count: number } };
    }>(query);

    return {
      totalPermissions: data.EnvioPilot_PermissionGranted_aggregate.aggregate.count,
      totalTrades: data.EnvioPilot_TradeExecuted_aggregate.aggregate.count,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return { totalPermissions: 0, totalTrades: 0 };
  }
}

/**
 * Format permission data for AI consumption
 */
export function formatPermissionsForAI(permissions: UserPermissions[]): string {
  if (permissions.length === 0) return "No permissions found.";

  return permissions
    .map(p => {
      const amount = (BigInt(p.amount) / BigInt(10 ** 18)).toString();
      const date = new Date(Number(p.timestamp) * 1000).toLocaleDateString();
      return `- ${p.permission}: ${amount} ETH (granted ${date})`;
    })
    .join("\n");
}

/**
 * Format trade data for AI consumption
 */
export function formatTradesForAI(trades: UserTrade[]): string {
  if (trades.length === 0) return "No trades found.";

  return trades
    .map(t => {
      const from = (BigInt(t.fromAmount) / BigInt(10 ** 18)).toString();
      const to = (BigInt(t.toAmount) / BigInt(10 ** 18)).toString();
      const date = new Date(Number(t.timestamp) * 1000).toLocaleDateString();
      return `- ${from} → ${to} ETH (${date})`;
    })
    .join("\n");
}

/**
 * Format DCA orders for AI consumption
 */
export function formatDCAOrdersForAI(orders: DCAOrder[]): string {
  if (orders.length === 0) return "No DCA orders found.";

  return orders
    .map(o => {
      const amount = (BigInt(o.amountPerExecution) / BigInt(10 ** 18)).toString();
      const interval = Number(o.intervalSeconds);
      const intervalLabel =
        interval === 3600
          ? "hourly"
          : interval === 86400
            ? "daily"
            : interval === 604800
              ? "weekly"
              : `every ${interval}s`;
      return `- Order #${o.orderId}: ${amount} ETH ${intervalLabel} (${o.tokenPair})`;
    })
    .join("\n");
}
