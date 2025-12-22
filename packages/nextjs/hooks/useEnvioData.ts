import { useCallback, useEffect, useMemo, useState } from "react";
import { envioClient } from "~~/lib/envio/client";
import {
  GET_FILTERED_PERMISSIONS,
  GET_FILTERED_TRADES,
  GET_PERMISSION_GRANTS,
  GET_TRADE_EXECUTIONS,
  GET_USER_PERMISSIONS,
  GET_USER_TRADES,
  GetPermissionGrantsResponse,
  GetTradeExecutionsResponse,
  GetUserPermissionsResponse,
  GetUserTradesResponse,
  PermissionFilters,
  PermissionGrantedEvent,
  TradeExecutedEvent,
  TradeFilters,
  buildOrderBy,
  buildPermissionWhereClause,
  buildTradeWhereClause,
} from "~~/lib/envio/queries";

/**
 * Hook state interface
 */
interface UseEnvioDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all permission grants with optional filters
 */
export function usePermissionGrants(filters?: PermissionFilters): UseEnvioDataState<PermissionGrantedEvent[]> {
  const [data, setData] = useState<PermissionGrantedEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize filters to prevent infinite loops

  const filtersKey = useMemo(
    () => JSON.stringify(filters || {}),
    [filters?.userAddress, filters?.permission, filters?.sortOrder, filters?.limit, filters?.offset],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedFilters = JSON.parse(filtersKey) as PermissionFilters;
      const hasFilters = parsedFilters && (parsedFilters.userAddress || parsedFilters.permission);

      if (hasFilters) {
        const where = buildPermissionWhereClause(parsedFilters);
        const orderBy = buildOrderBy(parsedFilters.sortOrder);

        const response = await envioClient.request<GetPermissionGrantsResponse>(GET_FILTERED_PERMISSIONS, {
          where,
          limit: parsedFilters.limit || 100,
          offset: parsedFilters.offset || 0,
          orderBy,
        });
        setData(response.EnvioPilot_PermissionGranted);
      } else {
        const orderBy = buildOrderBy(parsedFilters?.sortOrder);

        const response = await envioClient.request<GetPermissionGrantsResponse>(GET_PERMISSION_GRANTS, {
          limit: parsedFilters?.limit || 100,
          offset: parsedFilters?.offset || 0,
          orderBy,
        });
        setData(response.EnvioPilot_PermissionGranted);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch permission grants"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch all trade executions with optional filters
 */
export function useTradeExecutions(filters?: TradeFilters): UseEnvioDataState<TradeExecutedEvent[]> {
  const [data, setData] = useState<TradeExecutedEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize filters to prevent infinite loops

  const filtersKey = useMemo(
    () => JSON.stringify(filters || {}),
    [
      filters?.userAddress,
      filters?.minFromAmount,
      filters?.maxFromAmount,
      filters?.minToAmount,
      filters?.maxToAmount,
      filters?.sortOrder,
      filters?.limit,
      filters?.offset,
    ],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedFilters = JSON.parse(filtersKey) as TradeFilters;
      const hasFilters =
        parsedFilters &&
        (parsedFilters.userAddress ||
          parsedFilters.minFromAmount ||
          parsedFilters.maxFromAmount ||
          parsedFilters.minToAmount ||
          parsedFilters.maxToAmount);

      if (hasFilters) {
        const where = buildTradeWhereClause(parsedFilters);
        const orderBy = buildOrderBy(parsedFilters.sortOrder);

        const response = await envioClient.request<GetTradeExecutionsResponse>(GET_FILTERED_TRADES, {
          where,
          limit: parsedFilters.limit || 100,
          offset: parsedFilters.offset || 0,
          orderBy,
        });
        setData(response.EnvioPilot_TradeExecuted);
      } else {
        const orderBy = buildOrderBy(parsedFilters?.sortOrder);

        const response = await envioClient.request<GetTradeExecutionsResponse>(GET_TRADE_EXECUTIONS, {
          limit: parsedFilters?.limit || 100,
          offset: parsedFilters?.offset || 0,
          orderBy,
        });
        setData(response.EnvioPilot_TradeExecuted);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch trade executions"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch permissions for a specific user
 */
export function useUserPermissions(
  userAddress: string | null | undefined,
  limit = 100,
): UseEnvioDataState<PermissionGrantedEvent[]> {
  const [data, setData] = useState<PermissionGrantedEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userAddress) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await envioClient.request<GetUserPermissionsResponse>(GET_USER_PERMISSIONS, {
        userAddress: userAddress.toLowerCase(),
        limit,
      });
      setData(response.EnvioPilot_PermissionGranted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user permissions"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userAddress, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch trades for a specific user
 */
export function useUserTrades(
  userAddress: string | null | undefined,
  limit = 100,
): UseEnvioDataState<TradeExecutedEvent[]> {
  const [data, setData] = useState<TradeExecutedEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userAddress) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await envioClient.request<GetUserTradesResponse>(GET_USER_TRADES, {
        userAddress: userAddress.toLowerCase(),
        limit,
      });
      setData(response.EnvioPilot_TradeExecuted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user trades"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userAddress, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
