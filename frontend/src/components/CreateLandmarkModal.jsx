import React, { useState } from "react";
import { createLandmark, uploadPhoto } from "../api";

const CATEGORIES = [
  { value: "hiking_trail", label: "🥾 Hiking Trail" },
  { value: "viewpoint", label: "👁️ Viewpoint" },
  { value: "swimming_hole", label: "🏊 Swimming Hole" },
  { value: "camping", label: "⛺ Camping" },
  { value: "picnic_area", label: "🧺 Picnic Area" },
  { value: "historical", label: "🏛️ Historical" },
  { value: "wildlife", label: "🦅 Wildlife" },
  { value: "other", label: "📍 Other" },
];

const DIFFICULTIES = [
  { value: "easy", label: "🟢 Easy" },
  { value: "moderate", label: "🟡 Moderate" },
  { value: "hard", label: "🔴 Hard" },
  { value: "expert", label: "🟣 Expert" },
];

export default function CreateLandmarkModal({ latlng, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    category: "hiking_trail",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createLandmark({
        ...form,
        latitude: latlng.lat,
        longitude: latlng.lng,
      });
      const landmarkId = res.data.id;

      // Upload any selected photos
      for (const file of photos) {
        await uploadPhoto(landmarkId, file);
      }

      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create landmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Add a New Spot</h2>
          <p className="text-sm text-gray-500 mb-4">
            📍 {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handle}
                required
                placeholder="e.g. Secret waterfall off Prefumo Canyon"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                required
                rows={3}
                placeholder="Describe what makes this spot special, how to get there, what to expect..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handle}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handle}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotos(Array.from(e.target.files))}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slo-green/10 file:text-slo-green file:font-medium hover:file:bg-slo-green/20"
              />
              {photos.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{photos.length} file(s) selected</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slo-green text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Spot"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
