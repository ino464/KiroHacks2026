import React, { useEffect, useState } from "react";
import { getLeaderboard, getMyHikeLog, logHike } from "../api";
import { useAuth } from "../context/AuthContext";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ landmarkId }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [myCount, setMyCount] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getLeaderboard(landmarkId).then((r) => setEntries(r.data));
    if (user) {
      getMyHikeLog(landmarkId)
        .then((r) => { setMyCount(r.data.hike_count); setInput(String(r.data.hike_count)); })
        .catch(() => { setMyCount(0); setInput("0"); });
    }
  }, [landmarkId, user]);

  const handleSave = async () => {
    const count = parseInt(input, 10);
    if (isNaN(count) || count < 0) return;
    setLoading(true);
    try {
      await logHike(landmarkId, count);
      setMyCount(count);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      const r = await getLeaderboard(landmarkId);
      setEntries(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
        🏆 Leaderboard
      </h4>

      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">No hikes logged yet — be the first!</p>
      ) : (
        <div className="space-y-1 mb-3">
          {entries.map((e) => (
            <div
              key={e.rank}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg ${
                user && e.username === user.username
                  ? "bg-slo-green/10 font-semibold"
                  : "bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{MEDALS[e.rank - 1] || `#${e.rank}`}</span>
                <span className="text-gray-700">{e.username}</span>
              </span>
              <span className="text-gray-500">{e.hike_count}x</span>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <div className="border-t pt-2">
          <p className="text-xs text-gray-500 mb-1">
            Your hikes: <span className="font-semibold text-gray-700">{myCount}x</span>
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slo-green"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-slo-green text-white text-xs py-1 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
            >
              {saved ? "✓ Saved!" : loading ? "..." : "Update hike count"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 border-t pt-2">Sign in to log your hikes</p>
      )}
    </div>
  );
}
