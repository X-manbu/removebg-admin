import { store } from "@/store";

import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/types/api";
import type { UserInfo } from "@/types/api/user";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useDictStoreHook } from "@/store/modules/dict";
import { useTagsViewStore } from "@/store";
import { cleanupWebSocket } from "@/composables";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref<UserInfo>({} as UserInfo);

  /**
   * 登录
   */
  function login(loginRequest: LoginRequest) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(loginRequest)
        .then((data) => {
          const { token, user } = data;
          // 保存 token 和用户信息
          AuthStorage.setAccessToken(token);
          AuthStorage.setUserInfo(user);
          // 同步到 store
          Object.assign(userInfo.value, {
            userId: String(user.id),
            username: user.username,
            roles: [user.role],
            perms: [],
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 获取用户信息（从本地存储恢复）
   */
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      const storedUser = AuthStorage.getUserInfo();
      if (!storedUser) {
        reject("用户信息不存在，请重新登录");
        return;
      }
      const info: UserInfo = {
        userId: String(storedUser.id),
        username: storedUser.username,
        roles: [storedUser.role],
        perms: [],
      };
      Object.assign(userInfo.value, info);
      resolve(info);
    });
  }

  /**
   * 登出
   */
  function logout() {
    return resetAllState();
  }

  /**
   * 重置所有系统状态
   */
  function resetAllState() {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    usePermissionStoreHook().resetRouter();
    useDictStoreHook().clearDictCache();
    useTagsViewStore().delAllViews();

    // 3. 清理 WebSocket 连接
    cleanupWebSocket();

    return Promise.resolve();
  }

  /**
   * 重置用户状态
   */
  function resetUserState() {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
  }

  return {
    userInfo,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    getUserInfo,
    login,
    logout,
    resetAllState,
    resetUserState,
  };
});

/**
 * 在组件外部使用UserStore的钩子函数
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
