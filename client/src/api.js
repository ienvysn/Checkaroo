import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
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

export const getItems = () => API.get("/items");
export const addItem = (item) => API.post("/items", item);
export const updateItem = (id, updates) => API.put(`/items/${id}`, updates);
export const deleteItem = (id) => API.delete(`/items/${id}`);

export const loginUser = (userData) => API.post("/auth/login", userData);
export const registerUser = (userData) => API.post("/auth/register", userData);
