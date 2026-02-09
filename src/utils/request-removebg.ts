import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import { AuthStorage } from "@/utils/auth";

// ============================================
// Removebg 服务 HTTP 请求实例
// 响应格式: { code: 0, message: "...", data: ... }
// ============================================

const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

// ============================================
// 请求拦截器（复用 token 注入逻辑）
// ============================================

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// 响应拦截器（处理 code: 0 + message 格式）
// ============================================

interface RemovebgResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

http.interceptors.response.use(
  (response: AxiosResponse<RemovebgResponse>) => {
    const { code, message, data } = response.data;

    if (code === 0) {
      return data as any;
    }

    ElMessage.error(message || "请求失败");
    return Promise.reject(new Error(message || "Error"));
  },
  (error) => {
    if (!error.response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const { message } = (error.response.data as RemovebgResponse) || {};
    ElMessage.error(message || "请求失败");
    return Promise.reject(new Error(message || "Error"));
  }
);

export default http;
