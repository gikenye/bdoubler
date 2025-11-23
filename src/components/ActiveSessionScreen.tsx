import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  ArrowLeft,
  Users, 
  Clock, 
  Video, 
  Mic, 
  MicOff,
  Send,
  Hand,
  Bot,
  User,
  VideoOff,
  MessageSquare
} from "lucide-react";

interface ActiveSessionScreenProps {
  onBack: () => void;
}

interface ChatMessage {
  id: number;
  type: "bot" | "user" | "question" | "support";
  sender: string;
  content: string;
  timestamp: string;
  canRespond?: boolean;
  responses?: number;
}

export function ActiveSessionScreen({ onBack }: ActiveSessionScreenProps) {
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [message, setMessage] = useState("");

  const participants = [
    { id: 1, name: "Sarah K.", avatar: "SK", status: "active" },
    { id: 2, name: "Mike R.", avatar: "MR", status: "active" },
    { id: 3, name: "You", avatar: "JD", status: "active" },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: 1,
      type: "bot",
      sender: "Focus Bot",
      content: "Session started! 🎯 60 minutes on the clock. Good luck everyone!",
      timestamp: "10:00",
    },
    {
      id: 2,
      type: "user",
      sender: "Sarah K.",
      content: "Working on French vocabulary today! 📚",
      timestamp: "10:01",
    },
    {
      id: 3,
      type: "support",
      sender: "Mike R.",
      content: "You got this Sarah! 💪",
      timestamp: "10:02",
    },
    {
      id: 4,
      type: "question",
      sender: "Sarah K.",
      content: "Quick question - does anyone know a good conjugation resource?",
      timestamp: "10:15",
      canRespond: true,
      responses: 1,
    },
    {
      id: 5,
      type: "bot",
      sender: "Focus Bot",
      content: "⏰ 15 minutes remaining. Keep up the great work!",
      timestamp: "10:45",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b-4 border-[#3d3847]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-lg bg-[#252133] border-2 border-[#3d3847] text-white/60 hover:text-white hover:border-[#00d9ff] transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-[#00d9ff]">French Learning</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="w-3 h-3 text-white/60" />
                  <span className="text-xs text-white/60">
                    {participants.length} active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="game-badge rounded-full px-3 py-1.5 bg-[#6bcf7f] border-[#6bcf7f] text-[#1a1625] flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#1a1625] rounded-full animate-pulse"></div>
              <span className="text-xs">LIVE</span>
            </div>
          </div>

          {/* Timer & Progress */}
          <div className="game-card bg-[#252133] border-[#00d9ff]/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00d9ff]" />
                <span className="text-sm text-white/70">Time Remaining</span>
              </div>
              <span className="text-xl text-[#00d9ff] tabular-nums glow-effect">45:32</span>
            </div>
            <div className="game-progress">
              <div className="h-3 bg-[#00d9ff] rounded-full" style={{ width: "25%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="px-4 py-4 border-b-4 border-[#3d3847] bg-[#252133]">
        <div className="flex gap-4 overflow-x-auto">
          {participants.map((participant) => (
            <div key={participant.id} className="flex flex-col items-center gap-2 min-w-fit">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#00d9ff]/10 flex items-center justify-center border-2 border-[#00d9ff]/30 text-white">
                  <span className="text-lg">{participant.avatar}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6bcf7f] rounded-full border-3 border-[#1a1625] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#1a1625] rounded-full"></div>
                </div>
              </div>
              <span className="text-xs text-white/70">{participant.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 bg-[#1a1625]">
        <div className="space-y-3 pb-4">
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              {msg.type === "bot" && (
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center flex-shrink-0 border-2 border-[#00d9ff]/30">
                    <Bot className="w-5 h-5 text-[#00d9ff]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-[#00d9ff]">{msg.sender}</span>
                      <span className="text-xs text-white/40">{msg.timestamp}</span>
                    </div>
                    <div className="game-card bg-[#252133] border-[#00d9ff]/30 p-3">
                      <p className="text-sm text-white">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === "user" && (
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center flex-shrink-0 border-2 border-[#00d9ff]/30">
                    <User className="w-5 h-5 text-[#00d9ff]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-white">{msg.sender}</span>
                      <span className="text-xs text-white/40">{msg.timestamp}</span>
                    </div>
                    <div className="game-card bg-[#252133] border-[#4a4556] p-3">
                      <p className="text-sm text-white">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === "support" && (
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#6bcf7f]/10 flex items-center justify-center flex-shrink-0 border-2 border-[#6bcf7f]/30">
                    <User className="w-5 h-5 text-[#6bcf7f]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-white">{msg.sender}</span>
                      <span className="text-xs text-white/40">{msg.timestamp}</span>
                    </div>
                    <div className="game-card bg-[#252133] border-[#6bcf7f]/30 p-3">
                      <p className="text-sm text-white">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === "question" && (
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#ffd93d]/10 flex items-center justify-center flex-shrink-0 border-2 border-[#ffd93d]/30">
                    <Hand className="w-5 h-5 text-[#ffd93d]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-white">{msg.sender}</span>
                      <div className="rounded-full px-2 py-0.5 bg-[#ffd93d]/10 border border-[#ffd93d]/30">
                        <span className="text-xs text-[#ffd93d]">ASK</span>
                      </div>
                      <span className="text-xs text-white/40">{msg.timestamp}</span>
                    </div>
                    <div className="game-card bg-[#252133] border-[#ffd93d]/30 p-3">
                      <p className="text-sm text-white mb-3">{msg.content}</p>
                      <button className="game-button h-8 px-3 bg-[#ffd93d]/10 border-[#ffd93d]/30 text-[#ffd93d] text-xs flex items-center gap-1.5 hover:bg-[#ffd93d]/20">
                        <MessageSquare className="w-3 h-3" />
                        Respond ({msg.responses})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div className="border-t-4 border-[#3d3847] bg-[#252133]">
        {/* Controls */}
        <div className="flex items-center justify-center gap-3 p-3 border-b-2 border-white/10">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center game-badge transition-all ${
              micOn 
                ? "bg-[#6bcf7f] border-[#6bcf7f] text-[#1a1625]" 
                : "bg-[#1a1625] border-[#3d3847] text-white/40"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center game-badge transition-all ${
              videoOn 
                ? "bg-[#00d9ff] border-[#00d9ff] text-[#1a1625]" 
                : "bg-[#1a1625] border-[#3d3847] text-white/40"
            }`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button className="w-12 h-12 rounded-lg flex items-center justify-center game-badge bg-[#ffd93d] border-[#ffd93d] text-[#1a1625]">
            <Hand className="w-5 h-5" />
          </button>
        </div>

        {/* Message Input */}
        <div className="p-4 flex gap-2">
          <input
            placeholder="Send a message or ask a question..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 h-12 px-4 rounded-xl bg-[#1a1625] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
          />
          <button 
            onClick={handleSendMessage}
            className="w-12 h-12 rounded-xl game-button bg-[#00d9ff] border-[#00d9ff] text-[#1a1625] flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}