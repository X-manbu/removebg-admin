import request from "@/utils/request-removebg";
import type { LoginRequest, LoginResponse } from "@/types/api/auth";

const AuthAPI = {
  /** 管理员登录 */
  login(data: LoginRequest) {
    return request<any, LoginResponse>({
      url: "/api/admin/login",
      method: "post",
      data,
      headers: {
        Authorization: "no-auth",
      },
    });
  },
};

export default AuthAPI;
