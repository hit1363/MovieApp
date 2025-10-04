import axios from "axios";

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:8081" : "/";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});