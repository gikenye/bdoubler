"use client";

import { SessionRooms, SessionMatchingComponent } from '../sessions';
import { RewardsDisplayComponent } from '../rewards';
import { useRewardsData } from '../../../hooks/useRewardsData';

/**
 * HomeTab component displays the focus session dashboard.
 *
 * This tab provides session rooms and rewards display for focus sessions.
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  const { rewardData, isLoading } = useRewardsData();

  return (
    <div className="p-4 space-y-6">
      <h1 className="rpg-title text-2xl font-bold mb-6 text-center">Focus Session Dashboard</h1>
      <div className="space-y-6">
        <SessionRooms />
        <SessionMatchingComponent />
        <RewardsDisplayComponent rewardData={rewardData} isLoading={isLoading} />
      </div>
    </div>
  );
}