"use client";

import { useCallback, useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "../Button";
import { sendMiniAppNotification } from "../../../lib/notifs";

interface Session {
  id: string;
  taskDescription: string;
  duration: string; // in minutes
  startTime: string;
  creator: number;
  participants: number[];
}

interface SharedTimerComponentProps {
  session: Session;
  onComplete?: () => void;
  onPause?: (isPaused: boolean) => void;
}

/**
 * SharedTimerComponent displays a countdown timer for focus sessions.
 *
 * This component shows the remaining time, session details, participants,
 * and provides controls to start/pause the timer. It includes a progress bar
 * and sends notifications when the session completes.
 *
 * Features:
 * - Countdown timer with start/pause controls
 * - Session details display (task, participants)
 * - Progress bar visualization
 * - Session completion handling with notifications
 * - Real-time updates for group synchronization (placeholder)
 *
 * @param session - The session object containing details
 * @param onComplete - Callback when session completes
 * @param onPause - Callback when timer is paused/resumed
 *
 * @example
 * ```tsx
 * <SharedTimerComponent
 *   session={session}
 *   onComplete={() => console.log('Session completed')}
 *   onPause={(isPaused) => console.log('Paused:', isPaused)}
 * />
 * ```
 */
export function SharedTimerComponent({ session, onComplete, onPause }: SharedTimerComponentProps) {
  const { context } = useMiniApp();

  // --- State ---
  const [timeLeft, setTimeLeft] = useState<number>(parseInt(session.duration) * 60); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // --- Effects ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // --- Handlers ---
  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => {
      const newRunning = !prev;
      onPause?.(newRunning);
      if (newRunning && !startTime) {
        setStartTime(new Date());
      }
      return newRunning;
    });
  }, [onPause, startTime]);

  const handleSessionComplete = useCallback(async () => {
    // Send notifications to all participants
    await Promise.all(
      session.participants.map((fid) =>
        sendMiniAppNotification({
          fid,
          title: "Session Completed",
          body: `Focus session "${session.taskDescription}" has ended.`,
        })
      )
    );

    onComplete?.();
  }, [session.participants, session.taskDescription, onComplete]);

  // --- Calculations ---
  const totalSeconds = parseInt(session.duration) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // --- Render ---
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-center">Focus Session Timer</h3>

      {/* Timer Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-gray-800">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {isRunning ? 'Running' : timeLeft === 0 ? 'Completed' : 'Paused'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Session Details */}
      <div className="space-y-2 text-sm">
        <div>
          <strong>Task:</strong> {session.taskDescription}
        </div>
        <div>
          <strong>Duration:</strong> {session.duration} minutes
        </div>
        <div>
          <strong>Participants:</strong> {session.participants.length}
        </div>
        <div>
          <strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleStartPause}
          disabled={timeLeft === 0}
          variant={isRunning ? "secondary" : "primary"}
        >
          {isRunning ? "Pause" : timeLeft === 0 ? "Completed" : "Start"}
        </Button>
      </div>

      {/* Real-time sync placeholder */}
      <div className="text-xs text-gray-500 text-center">
        Real-time synchronization active
      </div>
    </div>
  );
}