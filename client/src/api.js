import axios from "axios";

// Create axios instance
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url.includes("/auth")
    ) {
      localStorage.removeItem("token");
      window.location.reload(); // Log the user out
    }

    return Promise.reject(error);
  }
);

/* ------------------- Auth ------------------- */
export const loginUser = (userData) => API.post("/auth/login", userData);
export const registerUser = (userData) => API.post("/auth/register", userData);

/* ------------------- Groups ------------------- */
export const getGroups = () => API.get("/groups");
export const getGroupById = (groupId) => API.get(`/groups/${groupId}`);
export const createGroup = (groupData) => API.post("/groups", groupData);
export const joinGroup = (groupId) => API.post(`/groups/${groupId}/join`);
export const deleteGroup = (groupId) => API.delete(`/groups/${groupId}`);

/* ------------------- Items (nested under groups) ------------------- */
export const getItems = (groupId) => API.get(`/groups/${groupId}/items`);
export const addItem = (groupId, item) =>
  API.post(`/groups/${groupId}/items`, item);
export const updateItem = (groupId, itemId, updates) =>
  API.put(`/groups/${groupId}/items/${itemId}`, updates);
export const deleteItem = (groupId, itemId) =>
  API.delete(`/groups/${groupId}/items/${itemId}`);
