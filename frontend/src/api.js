import axios from "axios";

// In production (Vercel) use the Railway URL, in dev use Vite's proxy
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const register = (data) => api.post("/auth/register", data);
export const login = (username, password) => {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  return api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};
export const getMe = () => api.get("/auth/me");

// --- Landmarks ---
export const getLandmarks = (params) => api.get("/landmarks", { params });
export const getLandmark = (id) => api.get(`/landmarks/${id}`);
export const createLandmark = (data) => api.post("/landmarks", data);
export const updateLandmark = (id, data) => api.patch(`/landmarks/${id}`, data);
export const deleteLandmark = (id) => api.delete(`/landmarks/${id}`);

// --- Photos ---
export const uploadPhoto = (landmarkId, file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/landmarks/${landmarkId}/photos`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deletePhoto = (photoId) => api.delete(`/photos/${photoId}`);
// --- Hikes & Leaderboard ---
export const logHike = (landmarkId, hikeCount) =>
  api.post(`/landmarks/${landmarkId}/hikes`, { hike_count: hikeCount });
export const getLeaderboard = (landmarkId) =>
  api.get(`/landmarks/${landmarkId}/leaderboard`);
export const getMyHikeLog = (landmarkId) =>
  api.get(`/landmarks/${landmarkId}/my-hikes`);
export const getMyStats = () => api.get("/users/me/stats");

export const photoUrl = (filename) => {
  const base = import.meta.env.VITE_API_URL || "";
  return `${base}/api/uploads/${filename}`;
};

export default api;

// --- Social (likes & comments) ---
export const getLandmarkLikes = (landmarkId) => api.get(`/landmarks/${landmarkId}/like`);
export const likeLandmark = (landmarkId, isLike) => api.post(`/landmarks/${landmarkId}/like`, { is_like: isLike });
export const getComments = (landmarkId) => api.get(`/landmarks/${landmarkId}/comments`);
export const createComment = (landmarkId, body) => api.post(`/landmarks/${landmarkId}/comments`, { body });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
export const likeComment = (commentId, isLike) => api.post(`/comments/${commentId}/like`, { is_like: isLike });

// --- Profiles ---
export const getProfile = (username) => api.get(`/users/${username}/profile`);

// --- Messages ---
export const getConversations = () => api.get("/messages/conversations");
export const getConversation = (username) => api.get(`/messages/${username}`);
export const sendMessage = (username, body) => api.post(`/messages/${username}`, { body });
export const getUnreadCount = () => api.get("/messages/unread/count");

// --- AI Chat ---
export const sendChatMessage = (messages) => api.post("/chat", { messages });
