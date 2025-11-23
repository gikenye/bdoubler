"use client";

import { useCallback, useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "../Button";
import { Input } from "../input";
import { Label } from "../label";
import { useNeynarUser } from "../../../hooks/useNeynarUser";
import { sendMiniAppNotification } from "../../../lib/notifs";

/**
 * SessionMatchingComponent allows users to create or join focus sessions.
 *
 * This component provides an interface for users to create new focus sessions
 * with task description, duration, and start time, or join existing sessions.
 * It displays matched users based on Farcaster best friends and sends notifications
 * for session updates.
 *
 * Features:
 * - Session creation with task details
 * - Joining existing sessions
 * - User matching via Farcaster best friends
 * - Notification updates for session events
 *
 * @example
 * ```tsx
 * <SessionMatchingComponent />
 * ```
 */
export function SessionMatchingComponent() {
  // --- Hooks ---
  const { context } = useMiniApp();
  const { user: neynarUser } = useNeynarUser({ user: { fid: context?.user?.fid } });

  // --- State ---
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [sessions, setSessions] = useState<Array<{
    id: string;
    taskDescription: string;
    duration: string;
    startTime: string;
    creator: number;
    participants: number[];
  }>>([]);
  const [matchedUsers, setMatchedUsers] = useState<Array<{ fid: number; username: string }>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (context?.user?.fid) {
      // Fetch best friends for matching
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

  // --- Handlers ---
  /**
   * Handles creating a new session.
   */
  const handleCreateSession = useCallback(async () => {
    if (!taskDescription || !duration || !startTime || !context?.user?.fid) return;

    setIsCreating(true);
    try {
      const newSession = {
        id: crypto.randomUUID(),
        taskDescription,
        duration,
        startTime,
        creator: context.user.fid,
        participants: [context.user.fid],
      };

      setSessions((prev) => [...prev, newSession]);

      // Send notification to creator
      await sendMiniAppNotification({
        fid: context.user.fid,
        title: "Session Created",
        body: `Your focus session "${taskDescription}" has been created.`,
      });

      // Reset form
      setTaskDescription("");
      setDuration("");
      setStartTime("");
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  }, [taskDescription, duration, startTime, context?.user?.fid]);

  /**
   * Handles joining an existing session.
   */
  const handleJoinSession = useCallback(async (sessionId: string) => {
    if (!context?.user?.fid) return;

    setIsJoining(sessionId);
    try {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, participants: [...session.participants, context.user.fid] }
            : session
        )
      );

      // Send notification to participants
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        await Promise.all(
          session.participants.map((fid) =>
            sendMiniAppNotification({
              fid,
              title: "New Participant",
              body: `Someone joined the session "${session.taskDescription}".`,
            })
          )
        );
      }
    } catch (error) {
      console.error("Failed to join session:", error);
    } finally {
      setIsJoining(null);
    }
  }, [context?.user?.fid, sessions]);

  // --- Render ---
  return (
    <div className="rpg-window space-y-4">
      <h3 className="rpg-title text-lg font-semibold mb-4">Focus Session Matching</h3>

      {/* Create Session Form */}
      <div className="space-y-3">
        <h4 className="rpg-label text-md font-medium">Create New Session</h4>

        <div>
          <Label htmlFor="task-description">Task Description</Label>
          <Input
            id="task-description"
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Enter task description"
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration in minutes"
          />
        </div>

        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateSession}
          disabled={!taskDescription || !duration || !startTime || isCreating}
          isLoading={isCreating}
        >
          Create Session
        </Button>
      </div>

      {/* Existing Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="rpg-label text-md font-medium">Join Existing Sessions</h4>
          {sessions.map((session) => (
            <div key={session.id} className="rpg-window-inner p-3 space-y-2">
              <p className="rpg-text"><strong className="rpg-label">Task:</strong> {session.taskDescription}</p>
              <p className="rpg-text"><strong className="rpg-label">Duration:</strong> {session.duration} minutes</p>
              <p className="rpg-text"><strong className="rpg-label">Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
              <p className="rpg-text"><strong className="rpg-label">Participants:</strong> {session.participants.length}</p>
              <Button
                onClick={() => handleJoinSession(session.id)}
                disabled={session.participants.includes(context?.user?.fid || 0) || isJoining === session.id}
                isLoading={isJoining === session.id}
                className="mt-2"
              >
                {session.participants.includes(context?.user?.fid || 0) ? "Joined" : "Join Session"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Matched Users */}
      {matchedUsers.length > 0 && (
        <div className="space-y-3">
          <h4 className="rpg-label text-md font-medium">Matched Users</h4>
          <div className="grid grid-cols-1 gap-2">
            {matchedUsers.map((user) => (
              <div key={user.fid} className="rpg-window-inner p-2">
                <p className="rpg-text"><strong className="rpg-label">Username:</strong> {user.username}</p>
                <p className="rpg-text"><strong className="rpg-label">FID:</strong> {user.fid}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}