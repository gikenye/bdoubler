import { useContractWrite, useContractRead, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther } from 'viem';
import FocusStakingABI from '../../FocusStaking.abi.json';

// Types based on the ABI
export enum TokenType {
  NATIVE = 0,
  ERC20 = 1,
}

export enum GroupState {
  CREATED = 0,
  STARTED = 1,
  FINALIZED = 2,
}

export enum ParticipantStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  DROPPED_OUT = 2,
}

export interface GroupSummary {
  id: bigint;
  tokenType: TokenType;
  tokenAddr: Address;
  stakeAmount: bigint;
  maxSize: bigint;
  sessionDuration: bigint;
  maxInactivity: bigint;
  started: boolean;
  finalized: boolean;
  startTimestamp: bigint;
  totalCollected: bigint;
  totalCompleted: bigint;
  joinedCount: bigint;
  creator: Address;
}

export interface Participant {
  addr: Address;
  stake: bigint;
  status: ParticipantStatus;
  lastAliveTs: bigint;
}

// Contract configuration
const contractConfig = {
  address: '0xbF5fE6f5547Bbf7b88D8f4371c80A7784CeE12fa' as Address,
  abi: FocusStakingABI,
} as const;

// Custom hook for createGroup
export function useCreateGroup() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createGroup = (
    tokenType: TokenType,
    tokenAddr: Address,
    stakeAmount: bigint,
    maxSize: bigint,
    sessionDuration: bigint,
    maxInactivity: bigint
  ) => {
    writeContract({
      ...contractConfig,
      functionName: 'createGroup',
      args: [tokenType, tokenAddr, stakeAmount, maxSize, sessionDuration, maxInactivity],
    });
  };

  return {
    createGroup,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for joinGroup
export function useJoinGroup() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const joinGroup = (groupId: bigint, value?: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'joinGroup',
      args: [groupId],
      value,
    });
  };

  return {
    joinGroup,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for startSession
export function useStartSession() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const startSession = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'startSession',
      args: [groupId],
    });
  };

  return {
    startSession,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for userPing
export function useUserPing() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const userPing = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'userPing',
      args: [groupId],
    });
  };

  return {
    userPing,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for markCompleted
export function useMarkCompleted() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const markCompleted = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'markCompleted',
      args: [groupId],
    });
  };

  return {
    markCompleted,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for finalizeGroup
export function useFinalizeGroup() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const finalizeGroup = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'finalizeGroup',
      args: [groupId],
    });
  };

  return {
    finalizeGroup,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for withdraw
export function useWithdraw() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'withdraw',
      args: [groupId],
    });
  };

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for getGroupSummary
export function useGetGroupSummary(groupId: bigint) {
  const { data, isLoading, error, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'getGroupSummary',
    args: [groupId],
    query: {
      enabled: groupId !== undefined,
    },
  });

  return {
    groupSummary: data as GroupSummary | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for getParticipant
export function useGetParticipant(groupId: bigint, index: bigint) {
  const { data, isLoading, error, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'getParticipant',
    args: [groupId, index],
    query: {
      enabled: groupId !== undefined && index !== undefined,
    },
  });

  return {
    participant: data as Participant | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for getGroupState
export function useGetGroupState(groupId: bigint) {
  const { data, isLoading, error, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'getGroupState',
    args: [groupId],
    query: {
      enabled: groupId !== undefined,
    },
  });

  return {
    groupState: data as GroupState | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for nextGroupId
export function useNextGroupId() {
  const { data, isLoading, error, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'nextGroupId',
  });

  return {
    nextGroupId: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Utility function to get contract configuration
export function getFocusStakingConfig() {
  return contractConfig;
}

// Export all types and utilities
export { contractConfig };