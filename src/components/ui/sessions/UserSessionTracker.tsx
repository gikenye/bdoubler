"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ActiveSessionComponent } from "./ActiveSessionComponent";

/**
 * UserSessionTracker allows users to manually track their active sessions.
 * 
 * Since checking all groups for participation would require hooks in loops,
 * this component lets users input their active group ID to track their session.
 */
export function UserSessionTracker() {
  const { address } = useAccount();
  const [groupId, setGroupId] = useState<string>("");
  const [activeGroupId, setActiveGroupId] = useState<bigint | null>(null);

  const handleTrackSession = () => {
    const id = parseInt(groupId);
    if (!isNaN(id) && id >= 0) {
      setActiveGroupId(BigInt(id));
    }
  };

  const handleStopTracking = () => {
    setActiveGroupId(null);
    setGroupId("");
  };

  if (!address) {
    return (
      <Card className="rpg-window">
        <CardContent className="p-6 text-center">
          <p className="rpg-text">Connect your wallet to track sessions</p>
        </CardContent>
      </Card>
    );
  }

  if (activeGroupId !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="rpg-title text-lg font-semibold">Active Session</h3>
          <Button variant="outline" onClick={handleStopTracking}>
            Stop Tracking
          </Button>
        </div>
        <ActiveSessionComponent 
          groupId={activeGroupId}
          onSessionEnd={handleStopTracking}
        />
      </div>
    );
  }

  return (
    <Card className="rpg-window">
      <CardHeader>
        <CardTitle className="rpg-title">Track Your Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="group-id">Group ID</Label>
          <Input
            id="group-id"
            type="number"
            min="0"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="Enter your group ID"
          />
        </div>
        <Button 
          onClick={handleTrackSession}
          disabled={!groupId}
          className="w-full"
        >
          Track Session
        </Button>
        <p className="rpg-text text-sm opacity-70 text-center">
          Enter the ID of a group you've joined to track your active session
        </p>
      </CardContent>
    </Card>
  );
}