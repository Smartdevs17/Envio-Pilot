import { gql } from "graphql-request";

/**
 * TypeScript types for Envio indexed events
 */

export interface PermissionGrantedEvent {
  id: string;
  user: string;
  permission: string;
  amount: string;
  timestamp: string;
}

export interface TradeExecutedEvent {
  id: string;
  user: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
}

/**
 * Filter types
 */

export interface PermissionFilters {
  userAddress?: string;
  permission?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface TradeFilters {
  userAddress?: string;
  minFromAmount?: string;
  maxFromAmount?: string;
  minToAmount?: string;
  maxToAmount?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * GraphQL Queries
 */

// Get all permission granted events (basic)
export const GET_PERMISSION_GRANTS = gql`
  query GetPermissionGrants(
    $limit: Int = 100
    $offset: Int = 0
    $orderBy: [EnvioPilot_PermissionGranted_order_by!] = { timestamp: desc }
  ) {
    EnvioPilot_PermissionGranted(limit: $limit, offset: $offset, order_by: $orderBy) {
      id
      user
      permission
      amount
      timestamp
    }
  }
`;

// Get filtered permission grants
export const GET_FILTERED_PERMISSIONS = gql`
  query GetFilteredPermissions(
    $where: EnvioPilot_PermissionGranted_bool_exp
    $limit: Int = 100
    $offset: Int = 0
    $orderBy: [EnvioPilot_PermissionGranted_order_by!] = { timestamp: desc }
  ) {
    EnvioPilot_PermissionGranted(where: $where, limit: $limit, offset: $offset, order_by: $orderBy) {
      id
      user
      permission
      amount
      timestamp
    }
  }
`;

// Get all trade executed events (basic)
export const GET_TRADE_EXECUTIONS = gql`
  query GetTradeExecutions(
    $limit: Int = 100
    $offset: Int = 0
    $orderBy: [EnvioPilot_TradeExecuted_order_by!] = { timestamp: desc }
  ) {
    EnvioPilot_TradeExecuted(limit: $limit, offset: $offset, order_by: $orderBy) {
      id
      user
      fromAmount
      toAmount
      timestamp
    }
  }
`;

// Get filtered trade executions
export const GET_FILTERED_TRADES = gql`
  query GetFilteredTrades(
    $where: EnvioPilot_TradeExecuted_bool_exp
    $limit: Int = 100
    $offset: Int = 0
    $orderBy: [EnvioPilot_TradeExecuted_order_by!] = { timestamp: desc }
  ) {
    EnvioPilot_TradeExecuted(where: $where, limit: $limit, offset: $offset, order_by: $orderBy) {
      id
      user
      fromAmount
      toAmount
      timestamp
    }
  }
`;

// Get permissions for a specific user
export const GET_USER_PERMISSIONS = gql`
  query GetUserPermissions($userAddress: String!, $limit: Int = 100) {
    EnvioPilot_PermissionGranted(where: { user: { _eq: $userAddress } }, limit: $limit, order_by: { timestamp: desc }) {
      id
      user
      permission
      amount
      timestamp
    }
  }
`;

// Get trades for a specific user
export const GET_USER_TRADES = gql`
  query GetUserTrades($userAddress: String!, $limit: Int = 100) {
    EnvioPilot_TradeExecuted(where: { user: { _eq: $userAddress } }, limit: $limit, order_by: { timestamp: desc }) {
      id
      user
      fromAmount
      toAmount
      timestamp
    }
  }
`;

/**
 * Response types for queries
 */

export interface GetPermissionGrantsResponse {
  EnvioPilot_PermissionGranted: PermissionGrantedEvent[];
}

export interface GetTradeExecutionsResponse {
  EnvioPilot_TradeExecuted: TradeExecutedEvent[];
}

export interface GetUserPermissionsResponse {
  EnvioPilot_PermissionGranted: PermissionGrantedEvent[];
}

export interface GetUserTradesResponse {
  EnvioPilot_TradeExecuted: TradeExecutedEvent[];
}

/**
 * Helper functions to build where clauses
 */

export function buildPermissionWhereClause(filters: PermissionFilters) {
  const where: any = {};

  if (filters.userAddress) {
    where.user = { _ilike: `%${filters.userAddress}%` };
  }

  if (filters.permission) {
    where.permission = { _ilike: `%${filters.permission}%` };
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

export function buildTradeWhereClause(filters: TradeFilters) {
  const where: any = {};

  if (filters.userAddress) {
    where.user = { _ilike: `%${filters.userAddress}%` };
  }

  if (filters.minFromAmount || filters.maxFromAmount) {
    where.fromAmount = {};
    if (filters.minFromAmount) {
      where.fromAmount._gte = filters.minFromAmount;
    }
    if (filters.maxFromAmount) {
      where.fromAmount._lte = filters.maxFromAmount;
    }
  }

  if (filters.minToAmount || filters.maxToAmount) {
    where.toAmount = {};
    if (filters.minToAmount) {
      where.toAmount._gte = filters.minToAmount;
    }
    if (filters.maxToAmount) {
      where.toAmount._lte = filters.maxToAmount;
    }
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

export function buildOrderBy(sortOrder: "asc" | "desc" = "desc") {
  return { timestamp: sortOrder };
}
