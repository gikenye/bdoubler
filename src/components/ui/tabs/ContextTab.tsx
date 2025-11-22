"use client";

import { RewardsDisplayComponent } from "../rewards";

/**
 * ContextTab component displays the user's rewards and session history.
 *
 * This component serves as the rewards view, showing:
 * - Stake returns from completed sessions
 * - Bonuses earned from group completions
 * - Total earnings accumulated
 * - Recent session history with outcomes
 *
 * @example
 * ```tsx
 * <ContextTab />
 * ```
 */
export function ContextTab() {
  // Mock reward data - in a real app, this would come from hooks or API
  const mockRewardData = {
    stakeReturns: 12.0,
    groupBonuses: 3.25,
    totalEarnings: 15.25,
    sessionHistory: [
      {
        id: "1",
        outcome: "success" as const,
        reward: 10.0,
        stakeReturn: 8.0,
        groupBonus: 2.0,
        date: new Date("2024-01-15"),
      },
      {
        id: "2",
        outcome: "partial" as const,
        reward: 5.25,
        stakeReturn: 4.0,
        groupBonus: 1.25,
        date: new Date("2024-01-14"),
      },
    ],
  };

  return (
    <div className="mx-6">
      <RewardsDisplayComponent rewardData={mockRewardData} />
    </div>
  );
}
