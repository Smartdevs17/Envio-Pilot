"use client";

import { useCallback, useState } from "react";
import {
  RequestExecutionPermissionsReturnType,
  erc7710BundlerActions,
  erc7715ProviderActions,
} from "@metamask/smart-accounts-kit/actions";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { Hex, parseEther } from "viem";
import { createPublicClient, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { useSessionAccount } from "~~/app/erc-7715-permissions/providers/SessionAccountProvider";

// EnvioPilot contract address (new with DCA)
const ENVIO_PILOT_ADDRESS = "0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB";

// ABI for grantPermission function
const GRANT_PERMISSION_ABI = [
  {
    inputs: [
      { name: "perm", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    name: "grantPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const usePermissions = () => {
  const [grantedPermissions, setGrantedPermissions] = useState<RequestExecutionPermissionsReturnType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { sessionAccount } = useSessionAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();

  const requestPermission = useCallback(async () => {
    if (!address) {
      setError("Wallet not connected");
      return;
    }

    if (!sessionAccount) {
      setError("Session account not ready");
      return;
    }

    if (!walletClient) {
      setError("Wallet client not ready");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = walletClient!.extend(erc7715ProviderActions());

      const currentTime = Math.floor(Date.now() / 1000);
      // 1 day in seconds.
      const periodDuration = 86400;
      // 30 days in seconds.
      const expiry = currentTime + 30 * 86400;

      const permissionAmount = parseEther("0.001");

      const permission = await client.requestExecutionPermissions([
        {
          chainId: sepolia.id,
          expiry,
          signer: {
            type: "account",
            data: {
              address: sessionAccount.address as `0x${string}`,
            },
          },
          isAdjustmentAllowed: true,
          permission: {
            type: "native-token-periodic",
            data: {
              periodAmount: permissionAmount,
              periodDuration,
              justification: "Request permisison to spend 0.001 ETH per day",
              startTime: currentTime,
            },
          },
        },
      ]);

      setGrantedPermissions(permission);

      // Also call the contract to emit a PermissionGranted event for Envio indexing
      try {
        const hash = await writeContractAsync({
          address: ENVIO_PILOT_ADDRESS,
          abi: GRANT_PERMISSION_ABI,
          functionName: "grantPermission",
          args: ["ERC7715_NATIVE_PERIODIC", permissionAmount],
        });
        setTxHash(hash);
      } catch (contractErr: unknown) {
        // Log but don't fail - the ERC-7715 permission was still granted
        console.warn("Contract call failed, but ERC-7715 permission was granted:", contractErr);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to request permission";
      setError(errorMessage);
      console.error("Permission request error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address, sessionAccount, walletClient, writeContractAsync]);

  const redeemPermission = useCallback(async () => {
    if (!grantedPermissions) {
      setError("Permission not found");
      return;
    }

    if (!sessionAccount) {
      setError("Session account not available");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const pimlicoKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
      if (!pimlicoKey) {
        throw new Error("Pimlico API key not configured");
      }

      const bundlerClient = createBundlerClient({
        transport: http(`https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${pimlicoKey}`),
        paymaster: true,
      }).extend(erc7710BundlerActions());

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const pimlicoClient = createPimlicoClient({
        transport: http(`https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${pimlicoKey}`),
      });

      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      const hash = await bundlerClient.sendUserOperationWithDelegation({
        publicClient,
        account: sessionAccount,
        calls: [
          {
            to: sessionAccount.address as Hex,
            value: parseEther("0.0000001"),
            permissionsContext: grantedPermissions[0].context,
            delegationManager: grantedPermissions[0].signer.data.address,
          },
        ],
        ...fee,
      });

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash,
      });

      setTxHash(receipt.transactionHash);

      // Also call the contract to emit a TradeExecuted event for Envio indexing
      try {
        const transferAmount = parseEther("0.0000001");
        const simulatedOutput = parseEther("0.00000009"); // Simulating ~10% less (fees/slippage)

        await writeContractAsync({
          address: ENVIO_PILOT_ADDRESS,
          abi: [
            {
              inputs: [
                { name: "fromAmount", type: "uint256" },
                { name: "toAmount", type: "uint256" },
              ],
              name: "executeTrade",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ] as const,
          functionName: "executeTrade",
          args: [transferAmount, simulatedOutput],
        });
      } catch (tradeErr: unknown) {
        // Log but don't fail - the transfer was still successful
        console.warn("Trade event emission failed, but transfer succeeded:", tradeErr);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to redeem permission";
      setError(errorMessage);
      console.error("Permission redeem error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [grantedPermissions, sessionAccount, writeContractAsync]);

  return {
    grantedPermissions,
    isLoading,
    error,
    txHash,
    requestPermission,
    redeemPermission,
  };
};
