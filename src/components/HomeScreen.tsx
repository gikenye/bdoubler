import { Timer, Users, TrendingUp, Award, Clock, Zap, Star } from "lucide-react";

interface HomeScreenProps {
  onStartSession: () => void;
}

export function HomeScreen({ onStartSession }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#00d9ff] flex items-center justify-center game-badge border-[#00d9ff] text-[#1a1625]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white">FOCUS ARENA</h1>
              <p className="text-xs text-muted-foreground">Welcome back, Champion</p>
            </div>
          </div>
          <div className="game-badge rounded-full px-3 py-1.5 bg-[#252133] border-[#4a4556] text-white flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-[#ffd93d] text-[#ffd93d]" />
            <span>LVL 12</span>
          </div>
        </div>
      </div>

      {/* Reputation Score Card */}
      <div className="game-card bg-[#252133] border-[#4a4556] mb-4 overflow-hidden">
        <div className="p-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d9ff]/5 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-3 relative">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center border-2 border-[#00d9ff]/30">
                <Award className="w-5 h-5 text-[#00d9ff]" />
              </div>
              <h3 className="text-sm text-white/70">Reputation Score</h3>
            </div>
            <div className="flex items-center gap-1 text-[#6bcf7f]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">+32</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3 relative">
            <span className="text-5xl text-[#00d9ff] glow-effect">847</span>
            <span className="text-[#6bcf7f] text-sm">this week</span>
          </div>
          <div className="game-progress">
            <div className="h-3 bg-[#00d9ff] rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-card border-[#4a4556] p-4">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#00d9ff]/10 flex items-center justify-center mb-1 border-2 border-[#00d9ff]/30">
              <Timer className="w-6 h-6 text-[#00d9ff]" />
            </div>
            <span className="text-xs text-white/60">Total Sessions</span>
            <span className="text-3xl text-white">143</span>
            <div className="flex items-center gap-1 text-[#6bcf7f] text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+5 this week</span>
            </div>
          </div>
        </div>

        <div className="stat-card border-[#4a4556] p-4">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#ffd93d]/10 flex items-center justify-center mb-1 border-2 border-[#ffd93d]/30">
              <Clock className="w-6 h-6 text-[#ffd93d]" />
            </div>
            <span className="text-xs text-white/60">Focus Hours</span>
            <span className="text-3xl text-white">89.5</span>
            <div className="flex items-center gap-1 text-[#6bcf7f] text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5 hours</span>
            </div>
          </div>
        </div>

        <div className="stat-card border-[#4a4556] p-4">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#6bcf7f]/10 flex items-center justify-center mb-1 border-2 border-[#6bcf7f]/30">
              <Users className="w-6 h-6 text-[#6bcf7f]" />
            </div>
            <span className="text-xs text-white/60">People Helped</span>
            <span className="text-3xl text-white">56</span>
            <span className="text-xs text-white/40">participants</span>
          </div>
        </div>

        <div className="stat-card border-[#4a4556] p-4">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#00d9ff]/10 flex items-center justify-center mb-1 border-2 border-[#00d9ff]/30">
              <Zap className="w-6 h-6 text-[#00d9ff]" />
            </div>
            <span className="text-xs text-white/60">Current Streak</span>
            <span className="text-3xl text-white">18</span>
            <span className="text-xs text-white/40">days in a row</span>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mb-6">
        <h3 className="mb-3 text-white/70 text-sm uppercase tracking-wide">Recent Achievements</h3>
        <div className="space-y-3">
          <div className="game-card bg-[#252133] border-[#00d9ff]/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#00d9ff]/10 flex items-center justify-center text-2xl border-2 border-[#00d9ff]/30">
                🏆
              </div>
              <div className="flex-1">
                <p className="text-white">Focus Champion</p>
                <p className="text-xs text-white/50">Completed 100 sessions</p>
              </div>
              <div className="game-badge rounded-full px-2 py-1 bg-[#ffd93d] border-[#ffd93d]">
                <span className="text-xs text-[#1a1625]">NEW</span>
              </div>
            </div>
          </div>

          <div className="game-card bg-[#252133] border-[#4a4556] p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#6bcf7f]/10 flex items-center justify-center text-2xl border-2 border-[#6bcf7f]/30">
                🤝
              </div>
              <div className="flex-1">
                <p className="text-white">Community Helper</p>
                <p className="text-xs text-white/50">Helped 50 people stay focused</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Session Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <button 
            onClick={onStartSession}
            className="w-full h-16 game-button bg-[#00d9ff] border-[#00d9ff] text-[#1a1625] flex items-center justify-center gap-3"
          >
            <Timer className="w-6 h-6" />
            <span className="text-lg">START SESSION</span>
          </button>
        </div>
      </div>
    </div>
  );
}