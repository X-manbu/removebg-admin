import { Storage } from "./storage";
import { STORAGE_KEYS } from "@/constants";
import { useUserStoreHook } from "@/store/modules/user";
import router from "@/router";
import type { LoginUserInfo } from "@/types/api/auth";

// 负责本地凭证的读写
export const AuthStorage = {
  getAccessToken(): string {
    return Storage.get(STORAGE_KEYS.ACCESS_TOKEN, "");
  },

  setAccessToken(token: string): void {
    Storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getUserInfo(): LoginUserInfo | null {
    return Storage.get<LoginUserInfo | null>(STORAGE_KEYS.USER_INFO, null);
  },

  setUserInfo(user: LoginUserInfo): void {
    Storage.set(STORAGE_KEYS.USER_INFO, user);
  },

  clearAuth(): void {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.remove(STORAGE_KEYS.USER_INFO);
  },
};

/**
 * 权限判断
 */
export function hasPerm(value: string | string[], type: "button" | "role" = "button"): boolean {
  const userInfo = AuthStorage.getUserInfo();
  if (!userInfo) return false;

  const roles = [userInfo.role];
  if (type === "role") {
    return typeof value === "string"
      ? roles.includes(value)
      : value.some((v) => roles.includes(v));
  }

  // 管理员拥有所有按钮权限
  return userInfo.role === "admin";
}

/**
 * 重定向到登录页面
 */
export async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  ElNotification({
    title: "提示",
    message,
    type: "warning",
    duration: 3000,
  });

  await useUserStoreHook().resetAllState();

  try {
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
    window.location.href = "/#/login";
  }
}
