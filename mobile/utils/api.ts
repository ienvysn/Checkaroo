import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Based on Metro logs, the host IP is 192.168.1.66
const API_URL = 'http://192.168.1.66:5000/api'; 

const API = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

// Attach token automatically from AsyncStorage
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to fetch auth token from storage:', error);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth')
    ) {
      await AsyncStorage.removeItem('token');
      // In a real app, you'd trigger a redirect here, possibly via a state management store or a listener
    }
    return Promise.reject(error);
  }
);

/* ------------------- Auth ------------------- */
export const loginUser = (userData: any) => API.post('/auth/login', userData);
export const registerUser = (userData: any) => API.post('/auth/register', userData);
export const getUserProfile = () => API.get('/auth/profile');
export const updateUserProfile = (userData: any) => API.put('/auth/profile', userData);
export const changePassword = (data: any) => API.put('/auth/change-password', data);
export const deleteAccount = (data: any) => API.delete('/auth/account', { data });

/* ------------------- Groups ------------------- */
export const getGroups = () => API.get('/groups');
export const getGroupById = (groupId: any) => API.get(`/groups/${groupId}`);
export const createGroup = (groupData: any) => API.post('/groups', groupData);
export const joinGroup = (groupId: any) => API.post(`/groups/${groupId}/join`);
export const deleteGroup = (groupId: any) => API.delete(`/groups/${groupId}`);
export const getInviteInfo = (token: any) => API.get(`/groups/invite/${token}`);

/* ------------------- Items (nested under groups) ------------------- */
export const getItems = (groupId: any) => API.get(`/groups/${groupId}/items`);
export const addItem = (groupId: any, item: any) =>
  API.post(`/groups/${groupId}/items`, item);
export const updateItem = (groupId: any, itemId: any, updates: any) =>
  API.put(`/groups/${groupId}/items/${itemId}`, updates);
export const deleteItem = (groupId: any, itemId: any) =>
  API.delete(`/groups/${groupId}/items/${itemId}`);

/*-------------------Activity-----------------------*/
export const getActivities = (groupId: any) =>
  API.get(`/groups/${groupId}/activities`);
export const getRecentActivities = (groupId: any) =>
  API.get(`/groups/${groupId}/activities/recent`);

/* ------------------- Group Management ------------------- */
export const updateGroupName = (groupId: any, name: any) =>
  API.put(`/groups/${groupId}/name`, { name });
export const removeMember = (groupId: any, userId: any) =>
  API.delete(`/groups/${groupId}/members/${userId}`);
export const leaveGroup = (groupId: any) => API.post(`/groups/${groupId}/leave`);

export default API;
