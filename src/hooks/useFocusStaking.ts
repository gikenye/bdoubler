import { useMemo, useState, useEffect } from 'react';
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

// Custom hook for markAFK
export function useMarkAFK() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const markAFK = (groupId: bigint, user: Address) => {
    writeContract({
      ...contractConfig,
      functionName: 'markAFK',
      args: [groupId, user],
    });
  };

  return {
    markAFK,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Custom hook for leaveGroupBeforeStart
export function useLeaveGroup() {
  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const leaveGroup = (groupId: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: 'leaveGroupBeforeStart',
      args: [groupId],
    });
  };

  return {
    leaveGroup,
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

// Custom hook for isAlive
export function useIsAlive(groupId: bigint, user: Address) {
  const { data, isLoading, error, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'isAlive',
    args: [groupId, user],
    query: {
      enabled: groupId !== undefined && user !== undefined,
    },
  });

  return {
    isAlive: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Simplified hook - just check first few participant slots
export function useUserParticipation(groupId: bigint, userAddress: Address) {
  const { groupSummary } = useGetGroupSummary(groupId);
  
  // Check up to 10 participant slots (most groups won't be larger)
  const participant0 = useGetParticipant(groupId, 0n);
  const participant1 = useGetParticipant(groupId, 1n);
  const participant2 = useGetParticipant(groupId, 2n);
  const participant3 = useGetParticipant(groupId, 3n);
  const participant4 = useGetParticipant(groupId, 4n);
  
  const participants = [participant0, participant1, participant2, participant3, participant4];
  
  const userParticipant = participants.find(({ participant }) => 
    participant?.addr.toLowerCase() === userAddress?.toLowerCase()
  );

  const isLoading = participants.some(({ isLoading }) => isLoading);

  return {
    isParticipant: !!userParticipant?.participant,
    participant: userParticipant?.participant,
    isLoading,
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

// Utility hook to get user's groups
export function useUserGroups(userAddress: Address) {
  const { nextGroupId } = useNextGroupId();
  
  const groupIds = useMemo(() => {
    if (!nextGroupId) return [];
    return Array.from({ length: Number(nextGroupId) }, (_, i) => BigInt(i));
  }, [nextGroupId]);

  const userGroups = groupIds.filter(groupId => {
    const { isParticipant } = useUserParticipation(groupId, userAddress);
    return isParticipant;
  });

  return {
    userGroups,
    totalGroups: groupIds.length,
  };
}

// Export all types and utilities
export { contractConfig };