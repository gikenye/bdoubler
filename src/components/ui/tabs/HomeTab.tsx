"use client";

import { SessionMatchingComponent } from '../sessions';
import { RewardsDisplayComponent } from '../rewards';

/**
 * HomeTab component displays the focus session dashboard.
 *
 * This tab provides session matching and rewards display for focus sessions.
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  // Mock reward data - in a real app, this would come from hooks or API
  const mockRewardData = {
    stakeReturns: 15.50,
    groupBonuses: 5.25,
    totalEarnings: 20.75,
    sessionHistory: [
      {
        id: '1',
        outcome: 'success' as const,
        reward: 10.00,
        stakeReturn: 8.00,
        groupBonus: 2.00,
        date: new Date(),
      },
      {
        id: '2',
        outcome: 'partial' as const,
        reward: 5.25,
        stakeReturn: 4.00,
        groupBonus: 1.25,
        date: new Date(Date.now() - 86400000), // yesterday
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Focus Session Dashboard</h1>
      <div className="space-y-6">
        <SessionMatchingComponent />
        <RewardsDisplayComponent rewardData={mockRewardData} />
      </div>
    </div>
  );
}