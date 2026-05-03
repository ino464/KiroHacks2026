import React, { useEffect, useState } from "react";
import { getObjectives } from "../api";

function getNextMonday() {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next;
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const next = getNextMonday();
      const diff = next - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs text-gray-400">Resets in {timeLeft}</span>;
}

export default function ObjectivesPanel({ onClose }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getObjectives()
      .then(r => setObjectives(r.data))
      .finally(() => setLoading(false));
  }, []);

  const completed = objectives.filter(o => o.completed).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-[1000] pt-16 pr-4">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slo-green text-white px-5 py-4 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg">Weekly Objectives</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">{completed}/{objectives.length} completed</span>
            <Countdown />
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: objectives.length ? `${(completed / objectives.length) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Objectives list */}
        <div className="overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-4">Loading...</p>
          ) : (
            objectives.map(obj => (
              <div
                key={obj.id}
                className={`rounded-xl p-3 border transition ${
                  obj.completed
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{obj.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold ${obj.completed ? "text-green-700" : "text-gray-800"}`}>
                        {obj.title}
                      </span>
                      {obj.completed && (
                        <span className="text-lg shrink-0" title={obj.newly_awarded ? "Trophy awarded!" : "Completed"}>
                          {obj.newly_awarded ? "🏆" : "✓"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{obj.description}</p>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{obj.progress} / {obj.target} {obj.unit}</span>
                        <span>{Math.round((obj.progress / obj.target) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            obj.completed ? "bg-green-500" : "bg-slo-green"
                          }`}
                          style={{ width: `${Math.min((obj.progress / obj.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {!loading && completed === objectives.length && objectives.length > 0 && (
            <div className="text-center py-3">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-sm font-semibold text-slo-green">All objectives complete!</p>
              <p className="text-xs text-gray-400">Come back next Monday for new challenges</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
