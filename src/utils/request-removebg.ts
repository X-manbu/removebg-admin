import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

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
// 请求拦截器
// ============================================

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers.Authorization === "no-auth") {
      delete config.headers.Authorization;
    } else {
      const token = AuthStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// 响应拦截器
// ============================================

interface RemovebgResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

let isRedirecting = false;

http.interceptors.response.use(
  (response: AxiosResponse<RemovebgResponse>) => {
    const { code, message, data } = response.data;

    if (code === 0) {
      return data as any;
    }

    // Token 过期或未登录
    if (code === 2001) {
      if (!isRedirecting) {
        isRedirecting = true;
        redirectToLogin("登录已过期，请重新登录").finally(() => {
          isRedirecting = false;
        });
      }
      return Promise.reject(new Error(message || "登录已过期"));
    }

    // 非管理员
    if (code === 2003) {
      ElMessage.error("需要管理员权限");
      return Promise.reject(new Error(message || "需要管理员权限"));
    }

    ElMessage.error(message || "请求失败");
    return Promise.reject(new Error(message || "Error"));
  },
  (error) => {
    if (!error.response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const responseData = error.response.data as RemovebgResponse | undefined;

    // 处理 HTTP 401
    if (error.response.status === 401) {
      const code = responseData?.code;
      if (code === 2001 && !isRedirecting) {
        isRedirecting = true;
        redirectToLogin("登录已过期，请重新登录").finally(() => {
          isRedirecting = false;
        });
      }
      return Promise.reject(new Error(responseData?.message || "未授权"));
    }

    const { message } = responseData || {};
    ElMessage.error(message || "请求失败");
    return Promise.reject(new Error(message || "Error"));
  }
);

export default http;
