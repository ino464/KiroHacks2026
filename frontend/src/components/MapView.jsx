import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { getLandmarks } from "../api";
import LandmarkPopup from "./LandmarkPopup";
import CreateLandmarkModal from "./CreateLandmarkModal";
import { useAuth } from "../context/AuthContext";

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DIFFICULTY_COLORS = {
  easy: "#22c55e",
  moderate: "#f59e0b",
  hard: "#ef4444",
  expert: "#7c3aed",
};

const CATEGORY_ICONS = {
  hiking_trail: "🥾",
  viewpoint: "👁️",
  swimming_hole: "🏊",
  camping: "⛺",
  picnic_area: "🧺",
  historical: "🏛️",
  wildlife: "🦅",
  other: "📍",
};

// SLO center + ~50 mile bounds
const SLO_CENTER = [35.2828, -120.6596];
const INITIAL_ZOOM = 11;
const MIN_ZOOM = 10;
const MAX_ZOOM = 17;

// ~50 mile radius around SLO
const SLO_BOUNDS = L.latLngBounds(
  L.latLng(34.56, -121.55), // SW corner
  L.latLng(35.98, -119.77)  // NE corner
);

function makeIcon(landmark) {
  const color = DIFFICULTY_COLORS[landmark.difficulty] || "#6b7280";
  const emoji = CATEGORY_ICONS[landmark.category] || "📍";
  const officialRing = landmark.is_official
    ? `border: 2px solid #1d4ed8;`
    : `border: 2px solid ${color};`;

  const html = `
    <div style="
      background: white;
      ${officialRing}
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    ">${emoji}</div>
  `;
  return L.divIcon({ html, className: "custom-marker-icon", iconSize: [36, 36], iconAnchor: [18, 18] });
}

function MapClickHandler({ onMapClick, placing }) {
  useMapEvents({
    click(e) {
      if (placing) onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView() {
  const { user } = useAuth();
  const [landmarks, setLandmarks] = useState([]);
  const [filters, setFilters] = useState({ category: "", difficulty: "", official_only: false });
  const [placing, setPlacing] = useState(false);
  const [newLatLng, setNewLatLng] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchLandmarks = useCallback(async () => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.official_only) params.official_only = true;
    const res = await getLandmarks(params);
    setLandmarks(res.data);
  }, [filters]);

  useEffect(() => {
    fetchLandmarks();
  }, [fetchLandmarks]);

  const handleMapClick = (latlng) => {
    setNewLatLng(latlng);
    setPlacing(false);
    setShowCreateModal(true);
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    setNewLatLng(null);
    fetchLandmarks();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="bg-white border-b px-4 py-2 flex flex-wrap gap-3 items-center z-10 shadow-sm">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green bg-gray-50"
        >
          <option value="">All categories</option>
          <option value="hiking_trail">🥾 Hiking Trail</option>
          <option value="viewpoint">👁️ Viewpoint</option>
          <option value="swimming_hole">🏊 Swimming Hole</option>
          <option value="camping">⛺ Camping</option>
          <option value="picnic_area">🧺 Picnic Area</option>
          <option value="historical">🏛️ Historical</option>
          <option value="wildlife">🦅 Wildlife</option>
          <option value="other">📍 Other</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slo-green bg-gray-50"
        >
          <option value="">All difficulties</option>
          <option value="easy">🟢 Easy</option>
          <option value="moderate">🟡 Moderate</option>
          <option value="hard">🔴 Hard</option>
          <option value="expert">🟣 Expert</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.official_only}
            onChange={(e) => setFilters({ ...filters, official_only: e.target.checked })}
            className="accent-slo-green w-4 h-4"
          />
          <span className="text-gray-600">Official only</span>
        </label>

        <span className="text-sm text-gray-400 ml-auto">
          {landmarks.length} spot{landmarks.length !== 1 ? "s" : ""}
        </span>

        {user && (
          <button
            onClick={() => setPlacing(!placing)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              placing
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-slo-green text-white hover:bg-green-800"
            }`}
          >
            {placing ? "✕ Cancel" : "+ Add Spot"}
          </button>
        )}
      </div>

      {placing && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-700 text-sm px-4 py-2 text-center font-medium">
          📍 Click anywhere on the map to place your new spot
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={SLO_CENTER}
          zoom={INITIAL_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          maxBounds={SLO_BOUNDS}
          maxBoundsViscosity={0.85}
          className="w-full h-full"
          style={{ cursor: placing ? "crosshair" : undefined }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} placing={placing} />

          {landmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.latitude, lm.longitude]}
              icon={makeIcon(lm)}
            >
              <Popup maxWidth={320} minWidth={280} className="rounded-xl">
                <LandmarkPopup landmarkId={lm.id} onDeleted={fetchLandmarks} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-6 left-3 z-[999] bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 text-xs text-gray-600 flex flex-col gap-1.5">
          <span className="font-semibold text-gray-700">Difficulty</span>
          {Object.entries(DIFFICULTY_COLORS).map(([d, c]) => (
            <span key={d} className="flex items-center gap-1.5">
              <span style={{ background: c }} className="w-2.5 h-2.5 rounded-full inline-block shrink-0" />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </span>
          ))}
          <div className="border-t border-gray-200 mt-0.5 pt-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 inline-block shrink-0" />
            Official trail
          </div>
        </div>
      </div>

      {showCreateModal && newLatLng && (
        <CreateLandmarkModal
          latlng={newLatLng}
          onClose={() => { setShowCreateModal(false); setNewLatLng(null); }}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
