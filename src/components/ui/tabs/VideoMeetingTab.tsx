"use client";

import { useState } from "react";
import { useRoom, useLocalVideo, useLocalAudio, useLocalScreenShare, usePeerIds, useRemoteVideo, useRemoteAudio, useRemoteScreenShare } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { Audio, Video } from "@huddle01/react/components";
import { Button } from "../Button";

interface RemotePeerProps {
  peerId: string;
}

/**
 * RemotePeer component displays video and audio streams from a remote participant
 */
const RemotePeer: React.FC<RemotePeerProps> = ({ peerId }) => {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream } = useRemoteAudio({ peerId });
  const { videoStream: screenVideoStream, audioStream: screenAudioStream } = useRemoteScreenShare({ peerId });

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-sm font-semibold mb-2">Peer: {peerId.slice(0, 8)}...</p>
      <div className="space-y-2">
        {videoStream && (
          <div className="aspect-video bg-black rounded">
            <Video stream={videoStream} className="w-full h-full object-cover rounded" />
          </div>
        )}
        {audioStream && <Audio stream={audioStream} />}
        {screenVideoStream && (
          <div className="aspect-video bg-black rounded">
            <Video stream={screenVideoStream} className="w-full h-full object-cover rounded" />
          </div>
        )}
        {screenAudioStream && <Audio stream={screenAudioStream} />}
      </div>
    </div>
  );
};

/**
 * VideoMeetingTab component provides a complete video meeting interface
 * with room creation, joining, and media controls
 */
export default function VideoMeetingTab() {
  const [roomId, setRoomId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string>("");

  const { joinRoom, leaveRoom, state } = useRoom({
    onJoin: () => {
      console.log("Joined the room");
      setError("");
    },
    onLeave: () => {
      console.log("Left the room");
    },
    onFailed: (error) => {
      console.error("Failed to join room:", error);
      setError("Failed to join room. Please try again.");
    },
  });

  const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST, Role.GUEST] });

  /**
   * Creates a new Huddle01 room
   */
  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    setError("");
    
    try {
      const response = await fetch("/api/huddle/create-room", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      
      if (data.data?.roomId) {
        setRoomId(data.data.roomId);
        // Automatically get access token for the new room
        await handleGetAccessToken(data.data.roomId);
      } else {
        throw new Error("No roomId returned");
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room. Please try again.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  /**
   * Generates an access token for the given room ID
   */
  const handleGetAccessToken = async (roomIdParam?: string) => {
    const targetRoomId = roomIdParam || roomId;
    
    if (!targetRoomId) {
      setError("Please enter a room ID");
      return;
    }

    setError("");
    
    try {
      const response = await fetch(`/api/huddle/access-token?roomId=${targetRoomId}`);
      
      if (!response.ok) {
        throw new Error("Failed to get access token");
      }

      const data = await response.json();
      
      if (data.token) {
        setAccessToken(data.token);
      } else {
        throw new Error("No token returned");
      }
    } catch (err) {
      console.error("Error getting access token:", err);
      setError("Failed to get access token. Please try again.");
    }
  };

  /**
   * Joins the Huddle01 room with the provided credentials
   */
  const handleJoinRoom = async () => {
    if (!roomId || !accessToken) {
      setError("Room ID and access token are required");
      return;
    }

    try {
      await joinRoom({
        roomId,
        token: accessToken,
      });
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room. Please check your credentials.");
    }
  };

  const isInRoom = state === "connected";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Huddle01 Video Meeting</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!isInRoom ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID or create a new room"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom}
                className="flex-1"
              >
                {isCreatingRoom ? "Creating..." : "Create New Room"}
              </Button>
              
              <Button
                onClick={() => handleGetAccessToken()}
                disabled={!roomId}
                variant="outline"
                className="flex-1"
              >
                Get Access Token
              </Button>
            </div>

            {accessToken && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✓ Access token generated successfully
                </p>
              </div>
            )}

            <Button
              onClick={handleJoinRoom}
              disabled={!roomId || !accessToken}
              className="w-full"
            >
              Join Room
            </Button>

            <p className="text-xs text-gray-500">
              Room Status: {state}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                ✓ Connected to room: {roomId.slice(0, 12)}...
              </p>
            </div>

            {/* Local Video Preview */}
            {videoStream && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <Video stream={videoStream} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Media Controls */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => (isVideoOn ? disableVideo() : enableVideo())}
                variant={isVideoOn ? "primary" : "outline"}
              >
                {isVideoOn ? "Disable Video" : "Enable Video"}
              </Button>

              <Button
                onClick={() => (isAudioOn ? disableAudio() : enableAudio())}
                variant={isAudioOn ? "primary" : "outline"}
              >
                {isAudioOn ? "Mute Audio" : "Unmute Audio"}
              </Button>

              <Button
                onClick={() => (shareStream ? stopScreenShare() : startScreenShare())}
                variant={shareStream ? "primary" : "outline"}
              >
                {shareStream ? "Stop Sharing" : "Share Screen"}
              </Button>

              <Button onClick={leaveRoom} variant="secondary">
                Leave Room
              </Button>
            </div>

            {/* Remote Peers */}
            {peerIds.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Participants ({peerIds.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peerIds.map((peerId) => (
                    <RemotePeer key={peerId} peerId={peerId} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
