import React, { useEffect, useState } from "react";
import { getProfile } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfileModal({ username, onClose, onMessage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile(username)
      .then(r => setProfile(r.data))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slo-green text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{username}</h2>
              {profile && (
                <p className="text-white/70 text-xs">
                  Joined {new Date(profile.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : profile ? (
          <div className="p-5 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-slo-green">{profile.total_hikes}</div>
                <div className="text-xs text-gray-500">Total Hikes</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.total_miles}</div>
                <div className="text-xs text-gray-500">Miles Hiked</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.trail_count}</div>
                <div className="text-xs text-gray-500">Trails Logged</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{profile.post_count}</div>
                <div className="text-xs text-gray-500">Spots Posted</div>
              </div>
            </div>

            {/* Trophies */}
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">🏆 {profile.trophies ?? 0}</div>
              <div className="text-xs text-gray-500">Trophies (Objectives Completed)</div>
            </div>

            {/* Medals */}
            {profile.medals.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Medals</h3>
                <div className="space-y-1.5">
                  {profile.medals.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xl">{m.medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">{m.trail_title}</div>
                        <div className="text-xs text-gray-400">#{m.rank} on leaderboard</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message button */}
            {user && user.username !== username && (
              <button
                onClick={() => { onClose(); onMessage(username); }}
                className="w-full bg-slo-green text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-800 transition flex items-center justify-center gap-2"
              >
                <span>✉️</span> Send Message
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">User not found</div>
        )}
      </div>
    </div>
  );
}
