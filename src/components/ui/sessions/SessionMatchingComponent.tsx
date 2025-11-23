"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import { formatEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../dialog";
import { parseEther } from "viem";
import { useNeynarUser } from "../../../hooks/useNeynarUser";
import { sendMiniAppNotification } from "../../../lib/notifs";
import { 
  useNextGroupId, 
  useGetGroupSummary, 
  useGetGroupState, 
  useUserParticipation,
  useStartSession,
  useCreateGroup,
  TokenType,
  GroupState 
} from "../../../hooks/useFocusStaking";
import { UserSessionTracker } from './UserSessionTracker';

/**
 * SessionMatchingComponent displays user's active sessions and allows starting sessions.
 *
 * This component shows:
 * - User's joined groups that haven't started yet
 * - Active sessions the user is participating in
 * - Ability to start sessions (if user is creator or authorized)
 *
 * @example
 * ```tsx
 * <SessionMatchingComponent />
 * ```
 */
export function SessionMatchingComponent() {
  const { address } = useAccount();
  const { context } = useMiniApp();
  const { user: neynarUser } = useNeynarUser({ user: { fid: context?.user?.fid } });
  const [matchedUsers, setMatchedUsers] = useState<Array<{ fid: number; username: string }>>([]);
  
  const { nextGroupId, isLoading: groupIdLoading } = useNextGroupId();
  const { startSession, isPending: isStarting, isConfirmed: startConfirmed } = useStartSession();
  const { createGroup, isPending: isCreating, isConfirmed: createConfirmed } = useCreateGroup();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");
  const [maxInactivity, setMaxInactivity] = useState("");

  // Get all group IDs to check
  const groupIds = useMemo(() => {
    if (!nextGroupId) return [];
    return Array.from({ length: Number(nextGroupId) }, (_, i) => BigInt(i));
  }, [nextGroupId]);

  // For now, we'll show a simplified view without checking all groups
  // In a production app, you'd want to implement proper participant tracking
  const userGroups: Array<{
    groupId: bigint;
    summary: any;
    state: GroupState;
    isParticipant: boolean;
  }> = [];

  // Separate groups by state
  const waitingGroups = userGroups.filter(g => g.state === GroupState.CREATED);
  const activeGroups = userGroups.filter(g => g.state === GroupState.STARTED);
  const completedGroups = userGroups.filter(g => g.state === GroupState.FINALIZED);

  // Fetch best friends for matching
  useEffect(() => {
    if (context?.user?.fid) {
      fetch(`/api/best-friends?fid=${context.user.fid}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.bestFriends) {
            setMatchedUsers(data.bestFriends.map((bf: any) => bf.user));
          }
        })
        .catch((error) => console.error("Failed to fetch best friends:", error));
    }
  }, [context?.user?.fid]);

  // Handle creating a session
  const handleCreateSession = async () => {
    if (!address || !stakeAmount || !maxParticipants || !sessionDuration || !maxInactivity) return;
    
    try {
      const stakeAmountWei = parseEther(stakeAmount);
      const maxSize = BigInt(maxParticipants);
      const duration = BigInt(sessionDuration) * 60n; // Convert minutes to seconds
      const inactivity = BigInt(maxInactivity);
      
      await createGroup(
        TokenType.NATIVE,
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stakeAmountWei,
        maxSize,
        duration,
        inactivity
      );
      
      // Send notification
      if (context?.user?.fid) {
        await sendMiniAppNotification({
          fid: context.user.fid,
          title: "Session Created",
          body: `New focus session created with ${stakeAmount} ETH stake!`,
        });
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  // Handle starting a session
  const handleStartSession = async (groupId: bigint) => {
    if (!address) return;
    
    try {
      await startSession(groupId);
      
      // Send notification
      if (context?.user?.fid) {
        await sendMiniAppNotification({
          fid: context.user.fid,
          title: "Session Started",
          body: `Focus session #${groupId} has started!`,
        });
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  if (groupIdLoading) {
    return (
      <div className="rpg-window space-y-4">
        <h3 className="rpg-title text-lg font-semibold mb-4">Your Sessions</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Close dialog on successful creation
  useMemo(() => {
    if (createConfirmed) {
      setCreateDialogOpen(false);
      setStakeAmount("");
      setMaxParticipants("");
      setSessionDuration("");
      setMaxInactivity("");
    }
  }, [createConfirmed]);

  return (
    <div className="rpg-window space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="rpg-title text-lg font-semibold">Your Sessions</h3>
        
        {/* Create Session Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>CREATE SESSION</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Focus Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Stake Amount (ETH)</Label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Session Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Max Inactivity (seconds)</Label>
                <Input
                  type="number"
                  placeholder="300"
                  value={maxInactivity}
                  onChange={(e) => setMaxInactivity(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreating || !stakeAmount || !maxParticipants || !sessionDuration || !maxInactivity}
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Session Tracker */}
      <UserSessionTracker />



      {/* Matched Users */}
      {matchedUsers.length > 0 && (
        <div className="space-y-3">
          <h4 className="rpg-label text-md font-medium">Farcaster Friends</h4>
          <div className="grid grid-cols-1 gap-2">
            {matchedUsers.slice(0, 3).map((user) => (
              <div key={user.fid} className="rpg-window-inner p-2">
                <p className="rpg-text text-sm">
                  <strong className="rpg-label">@{user.username}</strong> - Invite them to focus together!
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}