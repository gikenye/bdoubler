"use client";

import React from "react";

interface RPGWindowProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * RPGWindow component creates a retro RPG-style window frame.
 * 
 * This component provides a classic game window appearance with:
 * - Double border frame
 * - Shadow effects
 * - Optional title bar
 * 
 * @example
 * ```tsx
 * <RPGWindow title="Status">
 *   <p>Player HP: 100/100</p>
 * </RPGWindow>
 * ```
 */
export function RPGWindow({ children, title, className = "" }: RPGWindowProps) {
  return (
    <div className={`rpg-window ${className}`}>
      {title && (
        <div className="mb-3 pb-2 border-b-2 border-rpg-brown">
          <h3 className="rpg-title text-lg">{title}</h3>
        </div>
      )}
      <div className="rpg-window-inner">
        {children}
      </div>
    </div>
  );
}

