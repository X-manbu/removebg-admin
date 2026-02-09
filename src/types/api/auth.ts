/**
 * 认证相关类型定义
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/**
 * 登录用户信息
 */
export interface LoginUserInfo {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 角色 */
  role: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** JWT Token */
  token: string;
  /** 用户信息 */
  user: LoginUserInfo;
}
