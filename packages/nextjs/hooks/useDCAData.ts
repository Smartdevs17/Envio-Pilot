import { useCallback, useEffect, useState } from "react";
import { gql } from "graphql-request";
import { envioClient } from "~~/lib/envio/client";

// Types
export interface DCAOrderCreated {
  id: string;
  orderId: string;
  user: string;
  tokenPair: string;
  amountPerExecution: string;
  intervalSeconds: string;
  totalExecutions: string;
  timestamp: string;
}

export interface DCAOrderExecuted {
  id: string;
  orderId: string;
  user: string;
  executionNumber: string;
  amountIn: string;
  amountOut: string;
  timestamp: string;
}

export interface DCAOrderCancelled {
  id: string;
  orderId: string;
  user: string;
  timestamp: string;
}

// Queries
const GET_DCA_ORDERS = gql`
  query GetDCAOrders($limit: Int = 100) {
    EnvioPilot_DCAOrderCreated(limit: $limit, order_by: { timestamp: desc }) {
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

const GET_DCA_EXECUTIONS = gql`
  query GetDCAExecutions($limit: Int = 100) {
    EnvioPilot_DCAOrderExecuted(limit: $limit, order_by: { timestamp: desc }) {
      id
      orderId
      user
      executionNumber
      amountIn
      amountOut
      timestamp
    }
  }
`;

const GET_DCA_CANCELLATIONS = gql`
  query GetDCACancellations($limit: Int = 100) {
    EnvioPilot_DCAOrderCancelled(limit: $limit, order_by: { timestamp: desc }) {
      id
      orderId
      user
      timestamp
    }
  }
`;

// Response types
interface GetDCAOrdersResponse {
  EnvioPilot_DCAOrderCreated: DCAOrderCreated[];
}

interface GetDCAExecutionsResponse {
  EnvioPilot_DCAOrderExecuted: DCAOrderExecuted[];
}

interface GetDCACancellationsResponse {
  EnvioPilot_DCAOrderCancelled: DCAOrderCancelled[];
}

// Hook state interface
interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch DCA orders
 */
export function useDCAOrders(): UseDataState<DCAOrderCreated[]> {
  const [data, setData] = useState<DCAOrderCreated[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await envioClient.request<GetDCAOrdersResponse>(GET_DCA_ORDERS, { limit: 100 });
      setData(response.EnvioPilot_DCAOrderCreated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch DCA orders"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch DCA executions
 */
export function useDCAExecutions(): UseDataState<DCAOrderExecuted[]> {
  const [data, setData] = useState<DCAOrderExecuted[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await envioClient.request<GetDCAExecutionsResponse>(GET_DCA_EXECUTIONS, { limit: 100 });
      setData(response.EnvioPilot_DCAOrderExecuted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch DCA executions"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch DCA cancellations
 */
export function useDCACancellations(): UseDataState<DCAOrderCancelled[]> {
  const [data, setData] = useState<DCAOrderCancelled[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await envioClient.request<GetDCACancellationsResponse>(GET_DCA_CANCELLATIONS, { limit: 100 });
      setData(response.EnvioPilot_DCAOrderCancelled);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch DCA cancellations"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
