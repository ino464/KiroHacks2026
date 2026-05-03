import React, { useEffect, useState } from "react";
import { getMyStats } from "../api";

export default function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStats()
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-[1000] pt-16 pr-4">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slo-green text-white px-5 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-lg">My Stats</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
          ) : stats ? (
            <div className="p-5 space-y-4">
              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-3xl font-bold text-slo-green">{stats.total_hikes}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Hikes</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.trail_count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Trails Logged</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-3xl font-bold text-amber-600">{stats.post_count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Spots Posted</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.total_miles}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Miles Hiked</div>
                </div>
              </div>

              {/* Trophies */}
              <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                <div className="text-3xl font-bold text-yellow-600">🏆 {stats.trophies ?? 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">Trophies (Objectives Completed)</div>
              </div>

              {/* Medals */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Leaderboard Medals
                </h3>
                {stats.medals.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                    No medals yet — get top 3 on a trail leaderboard!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.medals.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <span className="text-2xl">{m.medal}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">
                            {m.trail_title}
                          </div>
                          <div className="text-xs text-gray-400">
                            #{m.rank} on leaderboard
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Motivational message */}
              <div className="text-center text-xs text-gray-400 pt-1 border-t">
                {stats.total_miles === 0
                  ? "Start hiking to build your stats! 🥾"
                  : stats.total_miles < 10
                  ? "You're just getting started — keep exploring! 🌿"
                  : stats.total_miles < 50
                  ? "You're a regular on the trails! 🏔️"
                  : stats.total_miles < 100
                  ? "Century hiker incoming! 💪"
                  : "SLO Explorer legend! 🏆"}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">Could not load stats</div>
          )}
        </div>
      </div>
    </div>
  );
}
