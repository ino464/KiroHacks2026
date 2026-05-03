import React, { useEffect, useState } from "react";
import { getLandmark, uploadPhoto, deletePhoto, deleteLandmark, photoUrl } from "../api";
import { useAuth } from "../context/AuthContext";
import Leaderboard from "./Leaderboard";

const DIFFICULTY_BADGE = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
  expert: "bg-purple-100 text-purple-800",
};

const CATEGORY_LABELS = {
  hiking_trail: "🥾 Hiking Trail",
  viewpoint: "👁️ Viewpoint",
  swimming_hole: "🏊 Swimming Hole",
  camping: "⛺ Camping",
  picnic_area: "🧺 Picnic Area",
  historical: "🏛️ Historical",
  wildlife: "🦅 Wildlife",
  other: "📍 Other",
};

export default function LandmarkPopup({ landmarkId, onDeleted }) {
  const { user } = useAuth();
  const [landmark, setLandmark] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tab, setTab] = useState("info"); // "info" | "leaderboard"

  useEffect(() => {
    getLandmark(landmarkId).then((res) => setLandmark(res.data));
  }, [landmarkId]);

  if (!landmark) {
    return <div className="p-2 text-sm text-gray-500">Loading...</div>;
  }

  const isOwner = user && landmark.author && user.id === landmark.author.id;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadPhoto(landmark.id, file);
      const res = await getLandmark(landmark.id);
      setLandmark(res.data);
      setPhotoIdx(res.data.photos.length - 1);
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Delete this photo?")) return;
    await deletePhoto(photoId);
    const res = await getLandmark(landmark.id);
    setLandmark(res.data);
    setPhotoIdx(0);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${landmark.title}"?`)) return;
    await deleteLandmark(landmark.id);
    onDeleted();
  };

  const photos = landmark.photos || [];
  const currentPhoto = photos[photoIdx];

  return (
    <div className="text-sm w-72">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-gray-900 leading-tight">{landmark.title}</h3>
          {landmark.is_official && (
            <span className="shrink-0 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
              Official
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGE[landmark.difficulty]}`}>
            {landmark.difficulty.charAt(0).toUpperCase() + landmark.difficulty.slice(1)}
          </span>
          <span className="text-xs text-gray-500">{CATEGORY_LABELS[landmark.category]}</span>
        </div>
      </div>

      {/* Tabs — only show leaderboard tab for official trails */}
      {landmark.is_official && (
        <div className="flex border-b mb-2">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-xs py-1.5 font-medium transition ${
              tab === "info"
                ? "border-b-2 border-slo-green text-slo-green"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`flex-1 text-xs py-1.5 font-medium transition ${
              tab === "leaderboard"
                ? "border-b-2 border-slo-green text-slo-green"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🏆 Leaderboard
          </button>
        </div>
      )}

      {tab === "leaderboard" ? (
        <Leaderboard landmarkId={landmark.id} />
      ) : (
        <>
          {/* Photo gallery */}
          {photos.length > 0 ? (
            <div className="mb-2 relative">
              <img
                src={photoUrl(currentPhoto.filename)}
                alt={currentPhoto.original_filename}
                className="w-full h-40 object-cover rounded-lg"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`w-2 h-2 rounded-full transition ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((photoIdx - 1 + photos.length) % photos.length)}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/60"
                  >‹</button>
                  <button
                    onClick={() => setPhotoIdx((photoIdx + 1) % photos.length)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/60"
                  >›</button>
                </>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDeletePhoto(currentPhoto.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  title="Delete photo"
                >✕</button>
              )}
            </div>
          ) : (
            <div className="mb-2 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              No photos yet
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 text-xs leading-relaxed mb-2 max-h-24 overflow-y-auto">
            {landmark.description}
          </p>

          {/* Trail stats for official trails */}
          {landmark.is_official && (landmark.trail_length_miles || landmark.elevation_gain_ft || landmark.avg_time_minutes) && (
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {landmark.trail_length_miles && (
                <div className="bg-green-50 rounded-lg p-1.5 text-center">
                  <div className="text-sm font-bold text-slo-green">{landmark.trail_length_miles}</div>
                  <div className="text-xs text-gray-400">mi</div>
                </div>
              )}
              {landmark.elevation_gain_ft && (
                <div className="bg-orange-50 rounded-lg p-1.5 text-center">
                  <div className="text-sm font-bold text-orange-600">{landmark.elevation_gain_ft.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">ft gain</div>
                </div>
              )}
              {landmark.avg_time_minutes && (
                <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                  <div className="text-sm font-bold text-blue-600">
                    {landmark.avg_time_minutes >= 60
                      ? `${Math.floor(landmark.avg_time_minutes / 60)}h${landmark.avg_time_minutes % 60 ? ` ${landmark.avg_time_minutes % 60}m` : ""}`
                      : `${landmark.avg_time_minutes}m`}
                  </div>
                  <div className="text-xs text-gray-400">avg time</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-2">
            <span>{landmark.author ? `by ${landmark.author.username}` : "Official"}</span>
            <span>{new Date(landmark.created_at).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          {user && (
            <div className="mt-2 flex gap-2">
              <label className={`flex-1 text-center cursor-pointer bg-slo-sky/10 text-slo-sky border border-slo-sky/30 rounded-lg py-1 text-xs font-medium hover:bg-slo-sky/20 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? "Uploading..." : "📷 Add Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-lg py-1 text-xs font-medium hover:bg-red-100 transition"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
