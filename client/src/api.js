import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const getItems = () => API.get("/items");
export const addItem = (item) => API.post("/items", item);
export const updateItem = (id, updates) => API.put(`/items/${id}`, updates);
export const deleteItem = (id) => API.delete(`/items/${id}`);
