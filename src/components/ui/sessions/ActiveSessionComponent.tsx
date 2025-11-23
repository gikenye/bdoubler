"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Progress } from "../progress";
import { Timer, Users, Zap, AlertTriangle } from "lucide-react";
import {
  useGetGroupSummary,
  useGetGroupState,
  useUserPing,
  useMarkCompleted,
  useFinalizeGroup,
  useWithdraw,
  useUserParticipation,
  GroupState,
} from "../../../hooks/useFocusStaking";

interface ActiveSessionComponentProps {
  groupId: bigint;
  onSessionEnd?: () => void;
}

/**
 * ActiveSessionComponent manages an active focus session with real-time updates.
 *
 * Features:
 * - Real-time session timer
 * - Liveness ping functionality
 * - Session completion tracking
 * - Automatic finalization when session ends
 * - Reward withdrawal
 */
export function ActiveSessionComponent({
  groupId,
  onSessionEnd,
}: ActiveSessionComponentProps) {
  const { address } = useAccount();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [lastPingTime, setLastPingTime] = useState<number>(0);

  // Contract hooks
  const { groupSummary, refetch: refetchSummary } = useGetGroupSummary(groupId);
  const { groupState, refetch: refetchState } = useGetGroupState(groupId);
  const { isParticipant, participant } = useUserParticipation(
    groupId,
    address!
  );
  const {
    userPing,
    isPending: isPinging,
    isConfirmed: pingConfirmed,
  } = useUserPing();
  const {
    markCompleted,
    isPending: isMarkingCompleted,
    isConfirmed: completedConfirmed,
  } = useMarkCompleted();
  const {
    finalizeGroup,
    isPending: isFinalizing,
    isConfirmed: finalizeConfirmed,
  } = useFinalizeGroup();
  const {
    withdraw,
    isPending: isWithdrawing,
    isConfirmed: withdrawConfirmed,
  } = useWithdraw();

  // Calculate session progress
  const sessionProgress = useMemo(() => {
    if (!groupSummary || !groupSummary.started) return 0;

    const now = Math.floor(Date.now() / 1000);
    const startTime = Number(groupSummary.startTimestamp);
    const duration = Number(groupSummary.sessionDuration);
    const elapsed = now - startTime;

    return Math.min((elapsed / duration) * 100, 100);
  }, [groupSummary, timeRemaining]);

  // Update timer
  useEffect(() => {
    if (!groupSummary || !groupSummary.started) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(groupSummary.startTimestamp);
      const duration = Number(groupSummary.sessionDuration);
      const endTime = startTime + duration;
      const remaining = Math.max(0, endTime - now);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onSessionEnd?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [groupSummary, onSessionEnd]);

  // Handle ping confirmation
  useEffect(() => {
    if (pingConfirmed) {
      setLastPingTime(Date.now());
      refetchSummary();
    }
  }, [pingConfirmed, refetchSummary]);

  // Handle completion confirmation
  useEffect(() => {
    if (completedConfirmed) {
      refetchSummary();
      refetchState();
    }
  }, [completedConfirmed, refetchSummary, refetchState]);

  // Handle finalization confirmation
  useEffect(() => {
    if (finalizeConfirmed) {
      refetchSummary();
      refetchState();
    }
  }, [finalizeConfirmed, refetchSummary, refetchState]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle user actions
  const handlePing = () => {
    if (address && groupId) {
      userPing(groupId);
    }
  };

  const handleMarkCompleted = () => {
    if (address && groupId) {
      markCompleted(groupId);
    }
  };

  const handleFinalize = () => {
    if (address && groupId) {
      finalizeGroup(groupId);
    }
  };

  const handleWithdraw = () => {
    if (address && groupId) {
      withdraw(groupId);
    }
  };

  // Check if user needs to ping soon
  const needsPing = useMemo(() => {
    if (!groupSummary || !participant) return false;

    const now = Math.floor(Date.now() / 1000);
    const lastAlive = Number(participant.lastAliveTs);
    const maxInactivity = Number(groupSummary.maxInactivity);

    return now - lastAlive > maxInactivity * 0.8; // Warn at 80% of max inactivity
  }, [groupSummary, participant]);

  if (!groupSummary || !isParticipant) {
    return (
      <Card className="rpg-window">
        <CardContent className="p-6">
          <p className="rpg-text text-center">
            You are not participating in this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSessionEnded = timeRemaining === 0;
  const canFinalize = isSessionEnded && groupState === GroupState.STARTED;
  const canWithdraw = groupState === GroupState.FINALIZED;

  return (
    <Card className="rpg-window">
      <CardHeader>
        <CardTitle className="rpg-title flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Focus Session #{groupId.toString()}
        </CardTitle>
        <Badge variant={isSessionEnded ? "secondary" : "default"}>
          {isSessionEnded ? "Ended" : "Active"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="rpg-label">Time Remaining</span>
            <span className="rpg-title text-lg font-mono">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <Progress value={sessionProgress} className="h-2" />
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rpg-window-inner p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" />
              <span className="rpg-label text-sm">Participants</span>
            </div>
            <span className="rpg-title">
              {groupSummary.joinedCount.toString()}
            </span>
          </div>

          <div className="rpg-window-inner p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" />
              <span className="rpg-label text-sm">Stake</span>
            </div>
            <span className="rpg-title">
              {formatEther(groupSummary.stakeAmount)} CELO
            </span>
          </div>
        </div>

        {/* Ping Warning */}
        {needsPing && !isSessionEnded && (
          <div className="rpg-window-inner p-3 border-yellow-500 bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Ping required soon to stay active!
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isSessionEnded && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handlePing}
                disabled={isPinging}
                variant="outline"
                className="w-full"
              >
                {isPinging ? "Pinging..." : "Ping (Stay Active)"}
              </Button>

              <Button
                onClick={handleMarkCompleted}
                disabled={isMarkingCompleted}
                className="w-full"
              >
                {isMarkingCompleted ? "Marking..." : "Mark Completed"}
              </Button>
            </div>
          )}

          {canFinalize && (
            <Button
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="w-full"
            >
              {isFinalizing ? "Finalizing..." : "Finalize Session"}
            </Button>
          )}

          {canWithdraw && (
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              variant="outline"
              className="w-full"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Rewards"}
            </Button>
          )}
        </div>

        {/* Last Ping Time */}
        {lastPingTime > 0 && (
          <p className="rpg-text text-sm text-center opacity-70">
            Last ping: {new Date(lastPingTime).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
