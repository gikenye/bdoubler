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
  isLoading?: boolean;
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
export function RewardsDisplayComponent({ rewardData, isLoading = false }: RewardsDisplayComponentProps) {
  const { stakeReturns, groupBonuses, totalEarnings, sessionHistory } = rewardData;

  // Calculate progress percentages for visualization
  const maxEarnings = useMemo(() => {
    const allRewards = sessionHistory.map(s => s.reward);
    return Math.max(...allRewards, totalEarnings) || 100; // fallback to 100 if no history
  }, [sessionHistory, totalEarnings]);

  const stakeProgress = (stakeReturns / maxEarnings) * 100;
  const bonusProgress = (groupBonuses / maxEarnings) * 100;
  const totalProgress = (totalEarnings / maxEarnings) * 100;

  if (isLoading) {
    return (
      <div className="rpg-window space-y-6">
        <h3 className="rpg-title text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-rpg-gold" />
          Your Rewards
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rpg-window space-y-6">
      <h3 className="rpg-title text-xl font-semibold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-rpg-gold" />
        Your Rewards
      </h3>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stake Returns */}
        <div className="rpg-window-inner p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-rpg-green" />
            <span className="rpg-label text-sm font-medium">Stake Returns</span>
          </div>
          <div className="rpg-title text-2xl font-bold">{stakeReturns.toFixed(2)}</div>
          <div className="mt-2 bg-rpg-darker-brown rounded-full h-2 border border-rpg-brown">
            <div
              className="bg-rpg-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stakeProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Group Bonuses */}
        <div className="rpg-window-inner p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-rpg-gold" />
            <span className="rpg-label text-sm font-medium">Group Bonuses</span>
          </div>
          <div className="rpg-title text-2xl font-bold">{groupBonuses.toFixed(2)}</div>
          <div className="mt-2 bg-rpg-darker-brown rounded-full h-2 border border-rpg-brown">
            <div
              className="bg-rpg-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(bonusProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="rpg-window-inner p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-rpg-gold" />
            <span className="rpg-label text-sm font-medium">Total Earnings</span>
          </div>
          <div className="rpg-title text-2xl font-bold">{totalEarnings.toFixed(2)}</div>
          <div className="mt-2 bg-rpg-darker-brown rounded-full h-2 border border-rpg-brown">
            <div
              className="bg-rpg-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(totalProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Session History */}
      <div>
        <h4 className="rpg-label text-lg font-medium mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {sessionHistory.slice(0, 5).map((session) => (
            <div key={session.id} className="rpg-window-inner flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border border-rpg-brown ${
                  session.outcome === 'success' ? 'bg-rpg-green' :
                  session.outcome === 'partial' ? 'bg-rpg-gold' : 'bg-red-600'
                }`} />
                <div>
                  <div className="rpg-text font-medium capitalize">{session.outcome} Session</div>
                  <div className="rpg-text text-sm opacity-70">
                    {session.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="rpg-title font-medium">+{session.reward.toFixed(2)}</div>
                <div className="rpg-text text-sm opacity-70">
                  Stake: {session.stakeReturn.toFixed(2)} | Bonus: {session.groupBonus.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          {sessionHistory.length === 0 && (
            <div className="rpg-text text-center opacity-70 py-8">
              No sessions completed yet. Start focusing to earn rewards!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}