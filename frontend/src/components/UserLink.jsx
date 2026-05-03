import React, { useState } from "react";
import ProfileModal from "./ProfileModal";

/**
 * Clickable username that opens a profile modal.
 * Usage: <UserLink username="john" onMessage={fn} />
 */
export default function UserLink({ username, onMessage, className = "" }) {
  const [showProfile, setShowProfile] = useState(false);

  if (!username) return null;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowProfile(true); }}
        className={`hover:underline hover:text-slo-green transition font-medium ${className}`}
      >
        {username}
      </button>
      {showProfile && (
        <ProfileModal
          username={username}
          onClose={() => setShowProfile(false)}
          onMessage={(u) => { setShowProfile(false); onMessage && onMessage(u); }}
        />
      )}
    </>
  );
}
