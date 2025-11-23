import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, showWallet = false }) => (
  <div className="fixed bottom-0 left-0 right-0 mx-4 mb-4 rpg-window px-2 py-2 z-50">
    <div className="flex justify-around items-center h-14">
      <button
        onClick={() => setActiveTab(Tab.Home)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === Tab.Home 
            ? 'rpg-title scale-110' 
            : 'rpg-text opacity-70 hover:opacity-100'
        }`}
      >
        <span className="text-xl">🏠</span>
        <span className="text-xs mt-1 font-medium">Sessions</span>
      </button>
      <button
        onClick={() => setActiveTab(Tab.Actions)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === Tab.Actions 
            ? 'rpg-title scale-110' 
            : 'rpg-text opacity-70 hover:opacity-100'
        }`}
      >
        <span className="text-xl">⚡</span>
        <span className="text-xs mt-1 font-medium">Stake</span>
      </button>
      <button
        onClick={() => setActiveTab(Tab.Context)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === Tab.Context 
            ? 'rpg-title scale-110' 
            : 'rpg-text opacity-70 hover:opacity-100'
        }`}
      >
        <span className="text-xl">📋</span>
        <span className="text-xs mt-1 font-medium">Rewards</span>
      </button>
      {showWallet && (
        <button
          onClick={() => setActiveTab(Tab.Wallet)}
          className={`flex flex-col items-center justify-center w-full h-full transition-all ${
            activeTab === Tab.Wallet 
              ? 'rpg-title scale-110' 
              : 'rpg-text opacity-70 hover:opacity-100'
          }`}
        >
          <span className="text-xl">👛</span>
          <span className="text-xs mt-1 font-medium">Wallet</span>
        </button>
      )}
    </div>
  </div>
);
