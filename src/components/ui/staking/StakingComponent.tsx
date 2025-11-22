"use client";

import { useCallback, useMemo, useState } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { celo } from "wagmi/chains";
import { useConnection as useSolanaConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Button } from "../Button";
import { Input } from "../input";
import { Label } from "../label";
import { truncateAddress } from "../../../lib/truncateAddress";
import { renderError } from "../../../lib/errorUtils";

/**
 * StakingComponent allows users to stake tokens for focus sessions.
 *
 * This component provides an interface for users to stake ETH on Celo or SOL
 * for focus sessions. It includes amount input, token selection, staking button,
 * and displays current staked amount and transaction status.
 *
 * Features:
 * - Stake amount input
 * - Token selection (ETH on Celo, SOL)
 * - Staking transaction handling
 * - Transaction status tracking
 * - Current staked amount display
 * - Error handling and display
 *
 * @example
 * ```tsx
 * <StakingComponent />
 * ```
 */
export function StakingComponent() {
  // --- State ---
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "SOL">("ETH");
  const [currentStaked, setCurrentStaked] = useState<string>("0");

  // --- ETH/Celo Hooks ---
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data: ethTransactionHash,
    error: ethTransactionError,
    isError: isEthTransactionError,
    isPending: isEthTransactionPending,
  } = useSendTransaction();

  const { isLoading: isEthTransactionConfirming, isSuccess: isEthTransactionConfirmed } =
    useWaitForTransactionReceipt({
      hash: ethTransactionHash,
    });

  // --- SOL Hooks ---
  const [solanaTransactionState, setSolanaTransactionState] = useState<
    | { status: 'none' }
    | { status: 'pending' }
    | { status: 'error'; error: Error }
    | { status: 'success'; signature: string }
  >({ status: 'none' });

  const { connection: solanaConnection } = useSolanaConnection();
  const { sendTransaction: sendSolanaTransaction, publicKey } = useSolanaWallet();

  // --- Computed Values ---
  /**
   * Determines the staking recipient address based on the selected token.
   *
   * For ETH on Celo: Uses a fixed staking contract address
   * For SOL: Uses a fixed SOL address for staking
   */
  const stakingRecipientAddress = useMemo(() => {
    if (selectedToken === "ETH") {
      // Fixed address for ETH staking on Celo
      return "0x1234567890123456789012345678901234567890"; // Placeholder - replace with actual staking contract
    } else {
      // Fixed address for SOL staking
      return "So11111111111111111111111111111111111111112"; // Placeholder - replace with actual staking address
    }
  }, [selectedToken]);

  // --- Handlers ---
  /**
   * Handles ETH staking transaction on Celo.
   */
  const handleEthStake = useCallback(() => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    const amountInWei = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18)); // Convert ETH to wei

    sendTransaction({
      to: stakingRecipientAddress as `0x${string}`,
      value: amountInWei,
    });
  }, [stakeAmount, stakingRecipientAddress, sendTransaction]);

  /**
   * Handles SOL staking transaction.
   */
  const handleSolStake = useCallback(async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    setSolanaTransactionState({ status: 'pending' });
    try {
      if (!publicKey) {
        throw new Error('no Solana publicKey');
      }

      const { blockhash } = await solanaConnection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error('failed to fetch latest Solana blockhash');
      }

      const fromPubkeyStr = publicKey.toBase58();
      const toPubkeyStr = stakingRecipientAddress;
      const transaction = new Transaction();
      const lamports = BigInt(Math.floor(parseFloat(stakeAmount) * 1e9)); // Convert SOL to lamports

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(fromPubkeyStr),
          toPubkey: new PublicKey(toPubkeyStr),
          lamports: lamports,
        }),
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(fromPubkeyStr);

      const simulation = await solanaConnection.simulateTransaction(transaction);
      if (simulation.value.err) {
        const logs = simulation.value.logs?.join('\n') ?? 'No logs';
        const errDetail = JSON.stringify(simulation.value.err);
        throw new Error(`Simulation failed: ${errDetail}\nLogs:\n${logs}`);
      }
      const signature = await sendSolanaTransaction(transaction, solanaConnection);
      setSolanaTransactionState({ status: 'success', signature });

      // Update current staked amount (placeholder logic)
      setCurrentStaked((prev) => (parseFloat(prev) + parseFloat(stakeAmount)).toString());
    } catch (e) {
      if (e instanceof Error) {
        setSolanaTransactionState({ status: 'error', error: e });
      } else {
        setSolanaTransactionState({ status: 'none' });
      }
    }
  }, [stakeAmount, stakingRecipientAddress, sendSolanaTransaction, publicKey, solanaConnection]);

  /**
   * Handles the stake button click.
   */
  const handleStake = useCallback(() => {
    if (selectedToken === "ETH") {
      handleEthStake();
    } else {
      handleSolStake();
    }
  }, [selectedToken, handleEthStake, handleSolStake]);

  // --- Render ---
  const isStaking = selectedToken === "ETH" ? isEthTransactionPending : solanaTransactionState.status === 'pending';
  const isTransactionError = selectedToken === "ETH" ? isEthTransactionError : solanaTransactionState.status === 'error';
  const transactionHash = selectedToken === "ETH" ? ethTransactionHash : solanaTransactionState.status === 'success' ? solanaTransactionState.signature : null;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Stake for Focus Session</h3>

      {/* Current Staked Amount */}
      <div className="text-sm">
        <Label>Current Staked: {currentStaked} {selectedToken}</Label>
      </div>

      {/* Token Selection */}
      <div>
        <Label htmlFor="token-select">Select Token</Label>
        <select
          id="token-select"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value as "ETH" | "SOL")}
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
        >
          <option value="ETH">ETH (Celo)</option>
          <option value="SOL">SOL</option>
        </select>
      </div>

      {/* Stake Amount Input */}
      <div>
        <Label htmlFor="stake-amount">Stake Amount</Label>
        <Input
          id="stake-amount"
          type="number"
          step="0.01"
          min="0"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder={`Enter amount in ${selectedToken}`}
        />
      </div>

      {/* Stake Button */}
      <Button
        onClick={handleStake}
        disabled={
          !stakeAmount ||
          parseFloat(stakeAmount) <= 0 ||
          isStaking ||
          (selectedToken === "ETH" && (!isConnected || chainId !== celo.id)) ||
          (selectedToken === "SOL" && !publicKey)
        }
        isLoading={isStaking}
      >
        Stake {stakeAmount || "0"} {selectedToken}
      </Button>

      {/* Transaction Status */}
      {isTransactionError && (
        <div>
          {selectedToken === "ETH"
            ? renderError(ethTransactionError)
            : solanaTransactionState.status === 'error' && renderError(solanaTransactionState.error)
          }
        </div>
      )}

      {transactionHash && (
        <div className="mt-2 text-xs">
          <div>Transaction: {truncateAddress(transactionHash)}</div>
          <div>
            Status:{" "}
            {selectedToken === "ETH"
              ? isEthTransactionConfirming
                ? "Confirming..."
                : isEthTransactionConfirmed
                ? "Confirmed!"
                : "Pending"
              : solanaTransactionState.status === 'success'
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
    </div>
  );
}