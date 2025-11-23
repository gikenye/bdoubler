// Mock data for groups and participants (to be replaced with contract data later)
interface MockGroup {
  id: string;
  stakeAmount: bigint;
  totalCollected: bigint;
  totalCompleted: bigint;
  participants: { userId: string; stake: bigint; completed: boolean }[];
}

const mockGroups: MockGroup[] = [
  {
    id: "group1",
    stakeAmount: 1000000000000000000n, // 1 CELO in wei
    totalCollected: 5000000000000000000n, // 5 CELO
    totalCompleted: 3n,
    participants: [
      { userId: "user1", stake: 1000000000000000000n, completed: true },
      { userId: "user2", stake: 1000000000000000000n, completed: true },
      { userId: "user3", stake: 1000000000000000000n, completed: false },
    ],
  },
  {
    id: "group2",
    stakeAmount: 2000000000000000000n, // 2 CELO
    totalCollected: 6000000000000000000n, // 6 CELO
    totalCompleted: 2n,
    participants: [
      { userId: "user1", stake: 2000000000000000000n, completed: true },
      { userId: "user4", stake: 2000000000000000000n, completed: true },
    ],
  },
];

// Convert bigint to number for calculations (assuming CELO, divide by 10^18)
const toEth = (wei: bigint): number => Number(wei) / 1e18;

// Calculate stake return for a participant in a group
export function calculateStakeReturn(
  stakeAmount: bigint,
  totalCollected: bigint,
  totalCompleted: bigint,
  participantCount: number,
  completedCount: number
): number {
  const stakeEth = toEth(stakeAmount);
  const totalEth = toEth(totalCollected);
  const completed = Number(totalCompleted);

  // If not completed, lose stake
  if (completed === 0) return 0;

  // Stake return: stake back + share of pot
  const share = (stakeEth / (participantCount * stakeEth)) * totalEth;
  return stakeEth + share;
}

// Calculate group bonus based on completion rate
export function calculateGroupBonus(
  groupSize: number,
  completionRate: number
): number {
  // Bonus: 10% of total stake if 100% completion, less otherwise
  const baseBonus = 0.1; // 10%
  return baseBonus * completionRate * groupSize; // Simplified
}

// Get total rewards for a user across all groups
export async function getUserRewards(userId: string): Promise<{
  stakeReturns: number;
  groupBonuses: number;
  totalEarnings: number;
}> {
  let totalStakeReturns = 0;
  let totalGroupBonuses = 0;

  for (const group of mockGroups) {
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant) continue;

    const participantCount = group.participants.length;
    const completedCount = group.participants.filter((p) => p.completed).length;
    const completionRate = completedCount / participantCount;

    const stakeReturn = calculateStakeReturn(
      participant.stake,
      group.totalCollected,
      group.totalCompleted,
      participantCount,
      completedCount
    );
    totalStakeReturns += stakeReturn;

    const groupBonus = calculateGroupBonus(participantCount, completionRate);
    totalGroupBonuses += groupBonus;
  }

  const totalEarnings = totalStakeReturns + totalGroupBonuses;

  return {
    stakeReturns: totalStakeReturns,
    groupBonuses: totalGroupBonuses,
    totalEarnings,
  };
}

// Function to get rewards for a specific group (for future integration)
export function calculateGroupRewards(groupId: string): {
  participants: {
    userId: string;
    stakeReturn: number;
    bonus: number;
    total: number;
  }[];
} {
  const group = mockGroups.find((g) => g.id === groupId);
  if (!group) return { participants: [] };

  const participantCount = group.participants.length;
  const completedCount = group.participants.filter((p) => p.completed).length;
  const completionRate = completedCount / participantCount;

  const participants = group.participants.map((p) => {
    const stakeReturn = calculateStakeReturn(
      p.stake,
      group.totalCollected,
      group.totalCompleted,
      participantCount,
      completedCount
    );
    const bonus = calculateGroupBonus(participantCount, completionRate);
    return {
      userId: p.userId,
      stakeReturn,
      bonus,
      total: stakeReturn + bonus,
    };
  });

  return { participants };
}
