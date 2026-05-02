import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

export const photoUrl = (filename) => `/uploads/${filename}`;

export default api;
