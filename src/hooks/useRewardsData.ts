import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useNextGroupId, useGetGroupSummary, useGetParticipant, useGetGroupState, GroupState, ParticipantStatus } from './useFocusStaking';

interface SessionHistoryEntry {
  id: string;
  outcome: "success" | "partial" | "failed";
  reward: number;
  stakeReturn: number;
  groupBonus: number;
  date: Date;
}

interface RewardData {
  stakeReturns: number;
  groupBonuses: number;
  totalEarnings: number;
  sessionHistory: SessionHistoryEntry[];
}

/**
 * Hook to fetch user's rewards data from completed focus sessions
 */
export function useRewardsData() {
  const { address } = useAccount();
  const { nextGroupId, isLoading: groupIdLoading } = useNextGroupId();

  // Get all group IDs to check
  const groupIds = useMemo(() => {
    if (!nextGroupId) return [];
    return Array.from({ length: Number(nextGroupId) }, (_, i) => BigInt(i));
  }, [nextGroupId]);

  // For now, return empty data to avoid hooks in loops
  // In production, you'd implement proper event-based tracking
  const groupData: Array<{
    groupId: bigint;
    summary: { groupSummary: any; isLoading: boolean };
    state: { groupState: GroupState; isLoading: boolean };
  }> = [];

  // Calculate rewards data
  const rewardData = useMemo(() => {
    if (!address || groupIdLoading) {
      return {
        stakeReturns: 0,
        groupBonuses: 0,
        totalEarnings: 0,
        sessionHistory: [],
      };
    }

    let totalStakeReturns = 0;
    let totalGroupBonuses = 0;
    const sessionHistory: SessionHistoryEntry[] = [];

    groupData.forEach(({ groupId, summary, state }) => {
      const { groupSummary } = summary;
      const { groupState } = state;

      // Only process finalized groups
      if (groupState !== GroupState.FINALIZED || !groupSummary) return;

      // Check if user participated in this group
      // For simplicity, we'll estimate rewards based on group completion
      // In a real implementation, you'd need to track individual participant data
      if (groupSummary.totalCompleted > 0n) {
        const stakeAmount = parseFloat(formatEther(groupSummary.stakeAmount));
        const completionRate = Number(groupSummary.totalCompleted) / Number(groupSummary.joinedCount);
        
        // Estimate user's share if they completed
        const userStakeReturn = stakeAmount;
        const userBonus = stakeAmount * 0.1 * completionRate; // 10% bonus based on completion rate
        
        totalStakeReturns += userStakeReturn;
        totalGroupBonuses += userBonus;

        sessionHistory.push({
          id: groupId.toString(),
          outcome: completionRate > 0.8 ? "success" : completionRate > 0.5 ? "partial" : "failed",
          reward: userStakeReturn + userBonus,
          stakeReturn: userStakeReturn,
          groupBonus: userBonus,
          date: new Date(Number(groupSummary.startTimestamp) * 1000),
        });
      }
    });

    return {
      stakeReturns: totalStakeReturns,
      groupBonuses: totalGroupBonuses,
      totalEarnings: totalStakeReturns + totalGroupBonuses,
      sessionHistory: sessionHistory.sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
  }, [address, groupIdLoading, groupData]);

  const isLoading = groupIdLoading;

  return {
    rewardData,
    isLoading,
  };
}