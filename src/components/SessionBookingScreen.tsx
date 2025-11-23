import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Users,
  Clock,
  Video,
  Mic,
  MessageSquare,
  Plus,
  Search,
  BookOpen,
  Code,
  Palette,
  TrendingUp,
} from "lucide-react";

interface SessionBookingScreenProps {
  onBack: () => void;
  onJoinSession: () => void;
}

export function SessionBookingScreen({
  onBack,
  onJoinSession,
}: SessionBookingScreenProps) {
  const sessions = [
    {
      id: 1,
      topic: "French Learning",
      icon: <BookOpen className="w-5 h-5" />,
      color: "#00d9ff",
      participants: 3,
      maxParticipants: 5,
      endTime: "45 min",
      hasVideo: true,
      hasVoice: true,
      hasChat: true,
    },
    {
      id: 2,
      topic: "Solidity Dev",
      icon: <Code className="w-5 h-5" />,
      color: "#00d9ff",
      participants: 2,
      maxParticipants: 4,
      endTime: "1h 20min",
      hasVideo: false,
      hasVoice: true,
      hasChat: true,
    },
    {
      id: 3,
      topic: "Art Project",
      icon: <Palette className="w-5 h-5" />,
      color: "#ffd93d",
      participants: 4,
      maxParticipants: 6,
      endTime: "2h 15min",
      hasVideo: true,
      hasVoice: false,
      hasChat: true,
    },
    {
      id: 4,
      topic: "Finance Study",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "#6bcf7f",
      participants: 1,
      maxParticipants: 3,
      endTime: "30 min",
      hasVideo: false,
      hasVoice: false,
      hasChat: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-white mb-1">SESSION ROOMS</h2>
          <p className="text-muted-foreground text-sm">
            Join or create a focus session
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            placeholder="Search sessions..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#252133] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
          />
        </div>

        <Tabs defaultValue="join" className="w-full">
          <div className="game-card bg-[#252133] border-[#4a4556] p-1.5 mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 p-0">
              <TabsTrigger
                value="join"
                className="game-button border-[#00d9ff] data-[state=active]:bg-[#00d9ff] data-[state=active]:text-[#1a1625] bg-transparent data-[state=inactive]:border-[#3d3847] data-[state=inactive]:text-white/60 h-12"
              >
                Join Room
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="game-button border-[#00d9ff] data-[state=active]:bg-[#00d9ff] data-[state=active]:text-[#1a1625] bg-transparent data-[state=inactive]:border-[#3d3847] data-[state=inactive]:text-white/60 h-12"
              >
                Create Room
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Join Session Tab */}
          <TabsContent value="join" className="space-y-3 mt-0">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="game-card bg-[#252133] border-[#4a4556] hover:border-[#00d9ff] transition-all cursor-pointer"
                onClick={onJoinSession}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center border-2 text-white"
                        style={{
                          backgroundColor: `${session.color}15`,
                          borderColor: `${session.color}50`,
                        }}
                      >
                        <div style={{ color: session.color }}>
                          {session.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white mb-1">{session.topic}</h4>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-white/60" />
                          <span className="text-xs text-white/60">
                            Ends in {session.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-3 py-1.5 text-sm border-2"
                      style={{
                        backgroundColor: `${session.color}15`,
                        borderColor: `${session.color}50`,
                        color: session.color,
                      }}
                    >
                      {session.participants}/{session.maxParticipants}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t-2 border-white/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/60" />
                      <span className="text-xs text-white/60">
                        {session.participants} active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.hasVideo && (
                        <div className="w-7 h-7 rounded-lg bg-[#00d9ff]/10 border-2 border-[#00d9ff]/30 flex items-center justify-center">
                          <Video className="w-3.5 h-3.5 text-[#00d9ff]" />
                        </div>
                      )}
                      {session.hasVoice && (
                        <div className="w-7 h-7 rounded-lg bg-[#6bcf7f]/10 border-2 border-[#6bcf7f]/30 flex items-center justify-center">
                          <Mic className="w-3.5 h-3.5 text-[#6bcf7f]" />
                        </div>
                      )}
                      {session.hasChat && (
                        <div className="w-7 h-7 rounded-lg bg-[#ffd93d]/10 border-2 border-[#ffd93d]/30 flex items-center justify-center">
                          <MessageSquare className="w-3.5 h-3.5 text-[#ffd93d]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Create Session Tab */}
          <TabsContent value="create" className="space-y-4 mt-0">
            <div className="game-card bg-[#252133] border-[#4a4556] p-4">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="topic"
                    className="text-sm text-white/70 mb-2 block"
                  >
                    Session Topic
                  </Label>
                  <input
                    id="topic"
                    placeholder="e.g., Python Study, Meditation..."
                    className="w-full h-12 px-4 rounded-xl bg-[#1a1625] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="duration"
                      className="text-sm text-white/70 mb-2 block"
                    >
                      Duration (min)
                    </Label>
                    <input
                      id="duration"
                      type="number"
                      placeholder="60"
                      className="w-full h-12 px-4 rounded-xl bg-[#1a1625] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="max-participants"
                      className="text-sm text-white/70 mb-2 block"
                    >
                      Max Players
                    </Label>
                    <input
                      id="max-participants"
                      type="number"
                      placeholder="5"
                      className="w-full h-12 px-4 rounded-xl bg-[#1a1625] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="stake"
                    className="text-sm text-white/70 mb-2 block"
                  >
                    Stake Amount (CELO)
                  </Label>
                  <input
                    id="stake"
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    className="w-full h-12 px-4 rounded-xl bg-[#1a1625] border-4 border-[#3d3847] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d9ff] transition-colors"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm text-white/70">
                    Communication Options
                  </Label>

                  <div className="game-card bg-[#1a1625] border-[#3d3847] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-[#00d9ff]" />
                      <span className="text-sm text-white">Video Call</span>
                    </div>
                    <Switch />
                  </div>

                  <div className="game-card bg-[#1a1625] border-[#3d3847] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-[#6bcf7f]" />
                      <span className="text-sm text-white">Voice Chat</span>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="game-card bg-[#1a1625] border-[#3d3847] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#ffd93d]" />
                      <span className="text-sm text-white">Text Chat</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full h-14 game-button bg-[#00d9ff] border-[#00d9ff] text-[#1a1625] flex items-center justify-center gap-3">
              <Plus className="w-5 h-5" />
              CREATE SESSION
            </button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
