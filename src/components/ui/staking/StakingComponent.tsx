"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { celo } from "wagmi/chains";
import {
  useConnection as useSolanaConnection,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { truncateAddress } from "../../../lib/truncateAddress";
import { renderError } from "../../../lib/errorUtils";

/**
 * StakingComponent allows users to stake tokens for focus sessions.
 *
 * This component provides an interface for users to stake CELO on Celo or SOL
 * for focus sessions. It includes amount input, token selection, staking button,
 * and displays current staked amount and transaction status.
 *
 * Features:
 * - Stake amount input
 * - Token selection (CELO on Celo, SOL)
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
  const [selectedToken, setSelectedToken] = useState<"CELO" | "SOL">("CELO");
  const [currentStaked, setCurrentStaked] = useState<string>("0");

  // --- CELO/Celo Hooks ---
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data: ethTransactionHash,
    error: ethTransactionError,
    isError: isEthTransactionError,
    isPending: isEthTransactionPending,
  } = useSendTransaction();

  const {
    isLoading: isEthTransactionConfirming,
    isSuccess: isEthTransactionConfirmed,
  } = useWaitForTransactionReceipt({
    hash: ethTransactionHash,
  });

  // --- SOL Hooks ---
  const [solanaTransactionState, setSolanaTransactionState] = useState<
    | { status: "none" }
    | { status: "pending" }
    | { status: "error"; error: Error }
    | { status: "success"; signature: string }
  >({ status: "none" });

  const { connection: solanaConnection } = useSolanaConnection();
  const { sendTransaction: sendSolanaTransaction, publicKey } =
    useSolanaWallet();

  // --- Computed Values ---
  /**
   * Determines the staking recipient address based on the selected token.
   *
   * For CELO on Celo: Uses a fixed staking contract address
   * For SOL: Uses a fixed SOL address for staking
   */
  const stakingRecipientAddress = useMemo(() => {
    if (selectedToken === "CELO") {
      // Fixed address for CELO staking on Celo
      return "0x1234567890123456789012345678901234567890"; // Placeholder - replace with actual staking contract
    } else {
      // Fixed address for SOL staking
      return "So11111111111111111111111111111111111111112"; // Placeholder - replace with actual staking address
    }
  }, [selectedToken]);

  // --- Handlers ---
  /**
   * Handles CELO staking transaction on Celo.
   */
  const handleEthStake = useCallback(() => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    const amountInWei = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18)); // Convert CELO to wei

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

    setSolanaTransactionState({ status: "pending" });
    try {
      if (!publicKey) {
        throw new Error("no Solana publicKey");
      }

      const { blockhash } = await solanaConnection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error("failed to fetch latest Solana blockhash");
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
        })
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(fromPubkeyStr);

      const simulation =
        await solanaConnection.simulateTransaction(transaction);
      if (simulation.value.err) {
        const logs = simulation.value.logs?.join("\n") ?? "No logs";
        const errDetail = JSON.stringify(simulation.value.err);
        throw new Error(`Simulation failed: ${errDetail}\nLogs:\n${logs}`);
      }
      const signature = await sendSolanaTransaction(
        transaction,
        solanaConnection
      );
      setSolanaTransactionState({ status: "success", signature });

      // Update current staked amount (placeholder logic)
      setCurrentStaked((prev) =>
        (parseFloat(prev) + parseFloat(stakeAmount)).toString()
      );
    } catch (e) {
      if (e instanceof Error) {
        setSolanaTransactionState({ status: "error", error: e });
      } else {
        setSolanaTransactionState({ status: "none" });
      }
    }
  }, [
    stakeAmount,
    stakingRecipientAddress,
    sendSolanaTransaction,
    publicKey,
    solanaConnection,
  ]);

  /**
   * Handles the stake button click.
   */
  const handleStake = useCallback(() => {
    if (selectedToken === "CELO") {
      handleEthStake();
    } else {
      handleSolStake();
    }
  }, [selectedToken, handleEthStake, handleSolStake]);

  // --- Render ---
  const isStaking =
    selectedToken === "CELO"
      ? isEthTransactionPending
      : solanaTransactionState.status === "pending";
  const isTransactionError =
    selectedToken === "CELO"
      ? isEthTransactionError
      : solanaTransactionState.status === "error";
  const transactionHash =
    selectedToken === "CELO"
      ? ethTransactionHash
      : solanaTransactionState.status === "success"
        ? solanaTransactionState.signature
        : null;

  return (
    <div className="rpg-window space-y-4">
      <h3 className="rpg-title text-lg font-semibold mb-4">
        Stake for Focus Session
      </h3>

      {/* Current Staked Amount */}
      <div className="rpg-window-inner p-3">
        <Label className="rpg-label text-sm">
          Current Staked:{" "}
          <span className="rpg-title">
            {currentStaked} {selectedToken}
          </span>
        </Label>
      </div>

      {/* Token Selection */}
      <div>
        <Label htmlFor="token-select" className="rpg-label">
          Select Token
        </Label>
        <select
          id="token-select"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value as "CELO" | "SOL")}
          className="input"
        >
          <option value="CELO">CELO (Celo)</option>
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
          (selectedToken === "CELO" && (!isConnected || chainId !== celo.id)) ||
          (selectedToken === "SOL" && !publicKey)
        }
      >
        Stake {stakeAmount || "0"} {selectedToken}
      </Button>

      {/* Transaction Status */}
      {isTransactionError && (
        <div className="rpg-window-inner p-3">
          {selectedToken === "CELO"
            ? renderError(ethTransactionError)
            : solanaTransactionState.status === "error" &&
              renderError(solanaTransactionState.error)}
        </div>
      )}

      {transactionHash && (
        <div className="rpg-window-inner p-3 mt-2 text-xs space-y-1">
          <div className="rpg-text">
            <span className="rpg-label">Transaction:</span>{" "}
            {truncateAddress(transactionHash)}
          </div>
          <div className="rpg-text">
            <span className="rpg-label">Status:</span>{" "}
            {selectedToken === "CELO"
              ? isEthTransactionConfirming
                ? "Confirming..."
                : isEthTransactionConfirmed
                  ? "Confirmed!"
                  : "Pending"
              : solanaTransactionState.status === "success"
                ? "Confirmed!"
                : "Pending"}
          </div>
        </div>
      )}
    </div>
  );
}
