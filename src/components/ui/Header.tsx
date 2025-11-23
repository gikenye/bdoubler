"use client";

import { useState, useEffect } from "react";
import { APP_NAME } from "~/lib/constants";
import { useQuickAuth } from "~/hooks/useQuickAuth";
import { useNeynarUser } from "~/hooks/useNeynarUser";
import { Button } from "~/components/ui/button";

export function Header() {
  const { authenticatedUser, status, signIn } = useQuickAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && authenticatedUser) {
      fetch(`/api/users?fids=${authenticatedUser.fid}`)
        .then(res => res.json())
        .then(data => setUserData(data.users?.[0] || null))
        .catch(console.error);
    } else {
      setUserData(null);
    }
  }, [status, authenticatedUser]);

  const neynarUser = useNeynarUser({ user: { fid: authenticatedUser?.fid } });

  return (
    <div className="relative">
      <div
        className="mt-4 mb-4 mx-4 px-3 py-3 rpg-window flex items-center justify-between"
      >
        <div className="rpg-title text-lg font-bold">
          Welcome to {APP_NAME}!
        </div>
        {status === 'authenticated' && userData ? (
          <div
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
            }}
          >
            {userData.pfp_url && (
              <img
                src={userData.pfp_url}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-rpg-brown shadow-[0_2px_4px_var(--rpg-shadow)]"
              />
            )}
          </div>
        ) : status === 'unauthenticated' ? (
          <Button onClick={signIn} className="btn btn-primary">
            Sign In
          </Button>
        ) : null}
      </div>
      {status === 'authenticated' && userData && isUserDropdownOpen && (
        <div className="absolute top-full right-0 z-50 w-fit mt-1 mx-4 rpg-window">
          <div className="p-3 space-y-2">
            <div className="text-right">
              <h3 className="rpg-title text-sm mb-1">
                {userData.display_name || userData.username}
              </h3>
              <p className="rpg-text text-xs opacity-80">
                @{userData.username}
              </p>
              <p className="rpg-text text-xs opacity-70">
                FID: {userData.fid}
              </p>
              {neynarUser.user && (
                <p className="rpg-text text-xs opacity-70">
                  Neynar Score: {neynarUser.user.score}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
