"use client";

import { useMemo } from "react";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

/**
 * Interface for individual session history entry
 */
interface SessionHistoryEntry {
  id: string;
  outcome: "success" | "partial" | "failed";
  reward: number;
  stakeReturn: number;
  groupBonus: number;
  date: Date;
}

/**
 * Interface for reward data props
 */
interface RewardData {
  stakeReturns: number;
  groupBonuses: number;
  totalEarnings: number;
  sessionHistory: SessionHistoryEntry[];
}

/**
 * Props for RewardsDisplayComponent
 */
interface RewardsDisplayComponentProps {
  rewardData: RewardData;
}

/**
 * RewardsDisplayComponent displays user's rewards from completed focus sessions.
 *
 * This component shows:
 * - Stake returns from completed sessions
 * - Bonuses earned from group completions
 * - Total earnings accumulated
 * - Recent session history with outcomes
 * - Progress indicators for earnings visualization
 *
 * @param rewardData - The reward data to display
 *
 * @example
 * ```tsx
 * <RewardsDisplayComponent rewardData={userRewardData} />
 * ```
 */
export function RewardsDisplayComponent({ rewardData }: RewardsDisplayComponentProps) {
  const { stakeReturns, groupBonuses, totalEarnings, sessionHistory } = rewardData;

  // Calculate progress percentages for visualization
  const maxEarnings = useMemo(() => {
    const allRewards = sessionHistory.map(s => s.reward);
    return Math.max(...allRewards, totalEarnings) || 100; // fallback to 100 if no history
  }, [sessionHistory, totalEarnings]);

  const stakeProgress = (stakeReturns / maxEarnings) * 100;
  const bonusProgress = (groupBonuses / maxEarnings) * 100;
  const totalProgress = (totalEarnings / maxEarnings) * 100;

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-white dark:bg-neutral-950">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Your Rewards
      </h3>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stake Returns */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Stake Returns</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stakeReturns.toFixed(2)}</div>
          <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stakeProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Group Bonuses */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Group Bonuses</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{groupBonuses.toFixed(2)}</div>
          <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(bonusProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{totalEarnings.toFixed(2)}</div>
          <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(totalProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Session History */}
      <div>
        <h4 className="text-lg font-medium mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {sessionHistory.slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  session.outcome === 'success' ? 'bg-green-500' :
                  session.outcome === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium capitalize">{session.outcome} Session</div>
                  <div className="text-sm text-neutral-500">
                    {session.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">+{session.reward.toFixed(2)}</div>
                <div className="text-sm text-neutral-500">
                  Stake: {session.stakeReturn.toFixed(2)} | Bonus: {session.groupBonus.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          {sessionHistory.length === 0 && (
            <div className="text-center text-neutral-500 py-8">
              No sessions completed yet. Start focusing to earn rewards!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}