import { api } from "./api";

export const request = {
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  post: async (url, body = {}) => {
    try {
      const response = await api.post(url, body);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  put: async (url, body = {}) => {
    try {
      const response = await api.put(url, body);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },
};
