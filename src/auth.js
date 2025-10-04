import { Alert } from "react-native";
import { create } from "zustand";
import { axiosInstance } from "./axios.js";

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      Alert.alert("Success", "Account created successfully");
      get().connectSocket();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      Alert.alert("Success", "Logged in successfully");

      get().connectSocket();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      Alert.alert("Success", "Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);
    set({ authUser: res.data });
    Alert.alert("Success", "Profile updated successfully");
    return res.data; // <-- return updated user for frontend
  } catch (error) {
    console.log("error in update profile:", error);
    Alert.alert("Error", error.response?.data?.message || "Update failed");
  } finally {
    set({ isUpdatingProfile: false });
  }
},

  connectSocket: () => {
    // Socket functionality disabled for React Native
    // Implement native socket solution if needed
  },
  disconnectSocket: () => {
    // Socket functionality disabled for React Native
  },
}));
