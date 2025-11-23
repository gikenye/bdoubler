"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { HomeScreen } from "../components/HomeScreen";
import { SessionBookingScreen } from "../components/SessionBookingScreen";
import { ActiveSessionScreen } from "../components/ActiveSessionScreen";
import { Home, Users } from "lucide-react";

type View = "booking" | "session";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [sessionView, setSessionView] = useState<View>("booking");

  const handleStartSession = () => {
    setActiveTab("session");
    setSessionView("booking");
  };

  const handleJoinSession = () => {
    setSessionView("session");
  };

  const handleBackToBooking = () => {
    setSessionView("booking");
  };

  return (
    <div className="dark min-h-screen bg-background">
      {/* Mobile container */}
      <div className="max-w-md mx-auto bg-background min-h-screen relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Top Navigation Tabs */}
          <div className="sticky top-0 bg-[#252133] border-b-4 border-[#3d3847] z-20">
            <div className="game-card bg-[#252133] border-[#4a4556] m-2 p-1.5">
              <TabsList className="w-full h-14 grid grid-cols-2 bg-transparent gap-2 rounded-xl p-0">
                <TabsTrigger 
                  value="home"
                  className="game-button border-[#00d9ff] data-[state=active]:bg-[#00d9ff] data-[state=active]:text-[#1a1625] bg-transparent data-[state=inactive]:border-[#3d3847] data-[state=inactive]:text-white/60 flex items-center justify-center gap-2 h-full"
                >
                  <Home className="w-5 h-5" />
                  <span>HOME</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="session"
                  className="game-button border-[#00d9ff] data-[state=active]:bg-[#00d9ff] data-[state=active]:text-[#1a1625] bg-transparent data-[state=inactive]:border-[#3d3847] data-[state=inactive]:text-white/60 flex items-center justify-center gap-2 h-full"
                >
                  <Users className="w-5 h-5" />
                  <span>SESSION</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="home" className="m-0">
            <HomeScreen onStartSession={handleStartSession} />
          </TabsContent>

          <TabsContent value="session" className="m-0">
            {sessionView === "booking" ? (
              <SessionBookingScreen 
                onBack={() => setActiveTab("home")}
                onJoinSession={handleJoinSession}
              />
            ) : (
              <ActiveSessionScreen onBack={handleBackToBooking} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
